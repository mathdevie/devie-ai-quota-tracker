//! One owner per login. Manual codes feed the existing waiter; cancellation
//! covers polling, token exchange, and the final persistence boundary.
use super::{LoginOutcome, PendingLogin, Provider};
use std::{
    collections::HashMap,
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc, Mutex,
    },
};
use tokio::sync::{oneshot, watch};

struct Session {
    pending: Option<PendingLogin>,
    cancel: watch::Sender<bool>,
    callback_stop: Option<Arc<AtomicBool>>,
    manual_tx: Option<oneshot::Sender<String>>,
    manual_rx: Option<oneshot::Receiver<String>>,
    provider: Option<Provider>,
}

impl Session {
    fn cancel(&self) {
        self.cancel.send_replace(true);
        if let Some(stop) = &self.callback_stop {
            stop.store(true, Ordering::Relaxed);
        }
    }
}

#[derive(Clone, Default)]
pub struct LoginSessions(Arc<Mutex<HashMap<String, Session>>>);

impl LoginSessions {
    fn lock(&self) -> std::sync::MutexGuard<'_, HashMap<String, Session>> {
        self.0.lock().unwrap_or_else(|p| p.into_inner())
    }

    /// Reserve before opening a callback port or making a device-code request.
    pub fn reserve(&self) -> String {
        let mut sessions = self.lock();
        for session in sessions.values() {
            session.cancel();
        }
        sessions.clear();
        let id = super::random_token(16);
        let (cancel, _) = watch::channel(false);
        sessions.insert(
            id.clone(),
            Session {
                pending: None,
                cancel,
                callback_stop: None,
                manual_tx: None,
                manual_rx: None,
                provider: None,
            },
        );
        id
    }

    pub fn install(&self, id: &str, pending: PendingLogin) -> Result<(), String> {
        let mut sessions = self.lock();
        let session = sessions.get_mut(id).ok_or("The sign-in session ended.")?;
        let (tx, rx) = oneshot::channel();
        session.callback_stop = pending.callback.as_ref().map(|s| s.stop_handle());
        session.provider = Some(pending.provider.clone());
        session.pending = Some(pending);
        session.manual_tx = Some(tx);
        session.manual_rx = Some(rx);
        Ok(())
    }

    pub fn take(&self, id: &str) -> Option<LoginTask> {
        let mut sessions = self.lock();
        let session = sessions.get_mut(id)?;
        Some(LoginTask {
            pending: session.pending.take()?,
            cancelled: session.cancel.subscribe(),
            manual: session.manual_rx.take()?,
        })
    }

    pub fn submit_code(&self, id: &str, code: String) -> Result<(), String> {
        let mut sessions = self.lock();
        let session = sessions.get_mut(id).ok_or("The sign-in session ended.")?;
        if session.provider != Some(Provider::Claude) || code.trim().is_empty() {
            return Err("This sign-in does not accept a manual code.".into());
        }
        session
            .manual_tx
            .take()
            .ok_or("A code was already submitted.")?
            .send(code.trim().to_string())
            .map_err(|_| "The sign-in session ended.".into())
    }

    pub fn cancel(&self, id: &str) {
        if let Some(session) = self.lock().remove(id) {
            session.cancel();
        }
    }

    /// The synchronous write and session check are indivisible with cancellation.
    pub fn commit<T>(
        &self,
        id: &str,
        save: impl FnOnce() -> Result<T, String>,
    ) -> Result<T, String> {
        let mut sessions = self.lock();
        let session = sessions.remove(id).ok_or("The sign-in session ended.")?;
        session.cancel();
        save()
    }
}

pub struct LoginTask {
    pub pending: PendingLogin,
    cancelled: watch::Receiver<bool>,
    manual: oneshot::Receiver<String>,
}

impl LoginTask {
    pub async fn run(mut self, client: &reqwest::Client) -> Result<LoginOutcome, String> {
        tokio::select! {
            biased;
            _ = self.cancelled.wait_for(|cancelled| *cancelled) => Err("The sign-in was cancelled.".into()),
            result = super::finish(client, self.pending, self.manual) => result,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn pending(provider: Provider) -> PendingLogin {
        PendingLogin {
            provider,
            pkce: None,
            redirect_uri: String::new(),
            callback: None,
            device: None,
            cursor: None,
        }
    }

    #[tokio::test]
    async fn manual_code_reaches_the_existing_waiter() {
        let sessions = LoginSessions::default();
        let id = sessions.reserve();
        sessions.install(&id, pending(Provider::Claude)).unwrap();
        let task = sessions.take(&id).unwrap();
        sessions.submit_code(&id, " code#state ".into()).unwrap();
        assert_eq!(task.manual.await.unwrap(), "code#state");
        assert!(sessions.take(&id).is_none());
    }

    #[tokio::test]
    async fn cancellation_stops_polling_and_prevents_late_save() {
        for provider in [Provider::Copilot, Provider::Cursor, Provider::Claude] {
            let sessions = LoginSessions::default();
            let id = sessions.reserve();
            sessions.install(&id, pending(provider)).unwrap();
            let task = sessions.take(&id).unwrap();
            sessions.cancel(&id);
            assert_eq!(
                task.run(&reqwest::Client::new()).await.unwrap_err(),
                "The sign-in was cancelled."
            );
            assert!(sessions
                .commit(&id, || -> Result<(), String> {
                    panic!("cancelled login saved")
                })
                .is_err());
        }
    }

    #[test]
    fn a_new_reservation_invalidates_in_flight_setup() {
        let sessions = LoginSessions::default();
        let old = sessions.reserve();
        let new = sessions.reserve();
        assert!(sessions.install(&old, pending(Provider::Claude)).is_err());
        sessions.install(&new, pending(Provider::Claude)).unwrap();
        assert_eq!(sessions.commit(&new, || Ok(42)).unwrap(), 42);
        assert!(sessions.commit(&new, || Ok(43)).is_err());
    }

    #[tokio::test]
    async fn replacing_a_running_callback_releases_its_port() {
        let sessions = LoginSessions::default();
        let id = sessions.reserve();
        let server = super::super::callback::CallbackServer::start(0, "/callback").unwrap();
        let port = server.port();
        let mut login = pending(Provider::Claude);
        login.pkce = Some(super::super::pkce());
        login.callback = Some(server);
        sessions.install(&id, login).unwrap();
        let task = sessions.take(&id).unwrap();
        let client = reqwest::Client::new();
        let running = task.run(&client);
        tokio::pin!(running);
        // Poll the real callback waiter before replacing this login.
        tokio::select! {
            biased;
            result = &mut running => panic!("callback unexpectedly completed: {result:?}"),
            _ = tokio::task::yield_now() => {},
        }
        sessions.reserve();
        assert_eq!(running.await.unwrap_err(), "The sign-in was cancelled.");
        let replacement = super::super::callback::CallbackServer::start(port, "/callback");
        assert!(replacement.is_ok(), "previous login kept its port");
        assert!(sessions.commit(&id, || Ok(())).is_err());
    }

    #[tokio::test]
    async fn cancellation_interrupts_active_device_and_cursor_waits() {
        for provider in [Provider::Copilot, Provider::Cursor] {
            let sessions = LoginSessions::default();
            let id = sessions.reserve();
            let mut login = pending(provider.clone());
            if provider == Provider::Cursor {
                login.cursor = Some(super::super::cursor::deep_login(super::super::pkce()));
            } else {
                login.device = Some(super::super::copilot::DeviceCode {
                    device_code: "synthetic".into(),
                    user_code: "synthetic".into(),
                    verification_uri: "https://example.com".into(),
                    interval: std::time::Duration::from_secs(300),
                    expires_in: std::time::Duration::from_secs(600),
                });
            }
            sessions.install(&id, login).unwrap();
            let task = sessions.take(&id).unwrap();
            let client = reqwest::Client::new();
            let running = task.run(&client);
            tokio::pin!(running);
            tokio::select! {
                biased;
                result = &mut running => panic!("poll unexpectedly completed: {result:?}"),
                _ = tokio::task::yield_now() => {},
            }
            sessions.cancel(&id);
            assert_eq!(running.await.unwrap_err(), "The sign-in was cancelled.");
        }
    }
}
