//! Provider sign-in flows.
//!
//! The flows follow the public clients used by the official CLIs, which is
//! also what 9router does:
//! - Claude: authorization code with PKCE, callback on `localhost:54545`.
//! - Codex: authorization code with PKCE, callback on `localhost:1455`.
//! - Gemini CLI: authorization code with a dynamic loopback callback.
//! - GitHub Copilot: device code flow.
//! - Cursor: PKCE deep link, polled on `api2.cursor.sh` (no callback port).

pub mod callback;
pub mod claude;
pub mod codex;
pub mod copilot;
pub mod cursor;
pub mod gemini;

use std::{
    collections::HashMap,
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc, Mutex,
    },
    time::Duration,
};

use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use rand::RngCore;
use serde::Serialize;
use sha2::{Digest, Sha256};

use std::path::Path;

use crate::{
    credentials::{self, Credentials},
    model::{NewConnection, Provider, ProviderConnection, QuotaReading, RemoteIdentity},
};

pub const LOGIN_TIMEOUT: Duration = Duration::from_secs(300);
pub const USER_AGENT: &str = "devie-quota/0.2";

/// Data the interface needs to guide the user through a sign-in.
#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginStart {
    pub session_id: String,
    pub provider: Provider,
    /// The page the browser opened.
    pub url: String,
    /// Device flow only: the code the user types on the provider page.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_code: Option<String>,
    /// True when the user can paste an authorization code by hand.
    pub accepts_manual_code: bool,
}

/// The result of a completed sign-in, before the connection exists.
#[derive(Clone, Debug)]
pub struct LoginOutcome {
    pub credentials: Credentials,
    pub identity: RemoteIdentity,
    /// Stable per-account key, such as an account id or a login name.
    pub account_key: String,
}

#[derive(Clone, Debug)]
pub struct Pkce {
    pub verifier: String,
    pub challenge: String,
    pub state: String,
}

pub fn pkce() -> Pkce {
    let verifier = random_token(32);
    let challenge = URL_SAFE_NO_PAD.encode(Sha256::digest(verifier.as_bytes()));
    Pkce {
        verifier,
        challenge,
        state: random_token(32),
    }
}

pub fn random_token(bytes: usize) -> String {
    let mut buffer = vec![0u8; bytes];
    rand::thread_rng().fill_bytes(&mut buffer);
    URL_SAFE_NO_PAD.encode(buffer)
}

/// One in-progress sign-in.
pub struct PendingLogin {
    pub provider: Provider,
    pub pkce: Option<Pkce>,
    pub redirect_uri: String,
    pub callback: Option<callback::CallbackServer>,
    pub device: Option<copilot::DeviceCode>,
    pub cursor: Option<cursor::DeepLogin>,
}

#[derive(Default)]
struct LoginRegistry {
    /// Sign-ins that started but did not begin waiting for the browser.
    pending: HashMap<String, PendingLogin>,
    /// Sign-ins waiting for the browser: their callback stop flags.
    waiting: HashMap<String, Arc<AtomicBool>>,
}

#[derive(Clone, Default)]
pub struct LoginSessions(Arc<Mutex<LoginRegistry>>);

impl LoginSessions {
    fn lock(&self) -> std::sync::MutexGuard<'_, LoginRegistry> {
        self.0.lock().unwrap_or_else(|poison| poison.into_inner())
    }

    pub fn insert(&self, id: String, login: PendingLogin) {
        let mut registry = self.lock();
        // Only one sign-in at a time: a new one cancels the previous ones so
        // the fixed callback ports become free again.
        registry.pending.clear();
        for stop in registry.waiting.drain().map(|(_, stop)| stop) {
            stop.store(true, Ordering::Relaxed);
        }
        registry.pending.insert(id, login);
    }

    /// Moves a sign-in to the waiting stage. `cancel` can still stop it.
    pub fn take(&self, id: &str) -> Option<PendingLogin> {
        let mut registry = self.lock();
        let login = registry.pending.remove(id)?;
        if let Some(stop) = login.callback.as_ref().map(|server| server.stop_handle()) {
            registry.waiting.insert(id.to_string(), stop);
        }
        Some(login)
    }

    /// Ends a sign-in at any stage and frees its callback port.
    pub fn cancel(&self, id: &str) {
        let mut registry = self.lock();
        registry.pending.remove(id);
        if let Some(stop) = registry.waiting.remove(id) {
            stop.store(true, Ordering::Relaxed);
        }
    }

    /// Forgets a sign-in that finished, one way or the other.
    pub fn finish(&self, id: &str) {
        self.lock().waiting.remove(id);
    }
}

/// Starts a sign-in: opens the browser and returns what the interface shows.
pub async fn start(
    client: &reqwest::Client,
    provider: Provider,
) -> Result<(LoginStart, PendingLogin), String> {
    let session_id = random_token(16);
    match provider {
        Provider::Claude | Provider::Codex => {
            let pair = pkce();
            let (redirect_uri, url, port, path) = if provider == Provider::Claude {
                let redirect = claude::redirect_uri();
                let url = claude::authorize_url(&pair, &redirect);
                (redirect, url, claude::CALLBACK_PORT, claude::CALLBACK_PATH)
            } else {
                let redirect = codex::redirect_uri();
                let url = codex::authorize_url(&pair, &redirect);
                (redirect, url, codex::CALLBACK_PORT, codex::CALLBACK_PATH)
            };
            let server = callback::CallbackServer::start(port, path)?;
            open_browser(&url)?;
            Ok((
                LoginStart {
                    session_id,
                    provider: provider.clone(),
                    url,
                    user_code: None,
                    accepts_manual_code: provider == Provider::Claude,
                },
                PendingLogin {
                    provider,
                    pkce: Some(pair),
                    redirect_uri,
                    callback: Some(server),
                    device: None,
                    cursor: None,
                },
            ))
        }
        Provider::Gemini => {
            let pair = pkce();
            let server = callback::CallbackServer::start(0, gemini::CALLBACK_PATH)?;
            let redirect_uri = gemini::redirect_uri(server.port());
            let url = gemini::authorize_url(&pair, &redirect_uri);
            open_browser(&url)?;
            Ok((
                LoginStart {
                    session_id,
                    provider: provider.clone(),
                    url,
                    user_code: None,
                    accepts_manual_code: false,
                },
                PendingLogin {
                    provider,
                    pkce: Some(pair),
                    redirect_uri,
                    callback: Some(server),
                    device: None,
                    cursor: None,
                },
            ))
        }
        Provider::Copilot => {
            let device = copilot::request_device_code(client).await?;
            open_browser(&device.verification_uri)?;
            Ok((
                LoginStart {
                    session_id,
                    provider: provider.clone(),
                    url: device.verification_uri.clone(),
                    user_code: Some(device.user_code.clone()),
                    accepts_manual_code: false,
                },
                PendingLogin {
                    provider,
                    pkce: None,
                    redirect_uri: String::new(),
                    callback: None,
                    device: Some(device),
                    cursor: None,
                },
            ))
        }
        Provider::Cursor => {
            let login = cursor::deep_login(pkce());
            let url = cursor::authorize_url(&login);
            open_browser(&url)?;
            Ok((
                LoginStart {
                    session_id,
                    provider: provider.clone(),
                    url,
                    user_code: None,
                    accepts_manual_code: false,
                },
                PendingLogin {
                    provider,
                    pkce: None,
                    redirect_uri: String::new(),
                    callback: None,
                    device: None,
                    cursor: Some(login),
                },
            ))
        }
    }
}

/// Finishes a sign-in. `manual_code` is a code the user pasted; otherwise
/// the function waits for the browser redirect or the device approval.
pub async fn finish(
    client: &reqwest::Client,
    login: PendingLogin,
    manual_code: Option<String>,
) -> Result<LoginOutcome, String> {
    match login.provider {
        Provider::Copilot => {
            let device = login
                .device
                .ok_or_else(|| "The GitHub sign-in session is invalid.".to_string())?;
            copilot::wait_for_approval(client, &device).await
        }
        Provider::Cursor => {
            let login = login
                .cursor
                .ok_or_else(|| "The Cursor sign-in session is invalid.".to_string())?;
            cursor::wait_for_login(client, &login).await
        }
        Provider::Claude | Provider::Codex | Provider::Gemini => {
            let pair = login
                .pkce
                .ok_or_else(|| "The sign-in session is invalid.".to_string())?;
            let (code, state) = match manual_code {
                Some(code) if !code.trim().is_empty() => (code.trim().to_string(), None),
                _ => {
                    let server = login
                        .callback
                        .ok_or_else(|| "The sign-in session is invalid.".to_string())?;
                    let params =
                        tauri::async_runtime::spawn_blocking(move || server.wait(LOGIN_TIMEOUT))
                            .await
                            .map_err(|_| "The sign-in stopped early.".to_string())?
                            .ok_or_else(|| {
                                "The browser did not return in time. Start the sign-in again."
                                    .to_string()
                            })?;
                    if let Some(error) = params.error {
                        return Err(format!("The provider refused the sign-in: {error}"));
                    }
                    let code = params
                        .code
                        .ok_or_else(|| "The provider returned no code.".to_string())?;
                    // A browser callback must always echo the state; only a
                    // manually pasted code may omit it.
                    let state = params.state.ok_or_else(|| {
                        "The sign-in response does not match this session. Start again.".to_string()
                    })?;
                    (code, Some(state))
                }
            };
            match login.provider {
                Provider::Claude => {
                    claude::exchange(client, &pair, &login.redirect_uri, &code, state.as_deref())
                        .await
                }
                Provider::Codex => {
                    codex::exchange(client, &pair, &login.redirect_uri, &code, state.as_deref())
                        .await
                }
                Provider::Gemini => {
                    gemini::exchange(client, &pair, &login.redirect_uri, &code, state.as_deref())
                        .await
                }
                Provider::Copilot | Provider::Cursor => unreachable!(),
            }
        }
    }
}

/// A stable id for one provider account, the same across sign-ins.
pub fn connection_id(provider: &str, locator: &str) -> String {
    uuid::Uuid::new_v5(
        &uuid::Uuid::NAMESPACE_URL,
        format!("com.devie.quota/{provider}/{locator}").as_bytes(),
    )
    .to_string()
}

/// Builds the connection record for a finished sign-in.
pub fn connection_for(provider: &Provider, outcome: &LoginOutcome) -> NewConnection {
    let provider_name = match provider {
        Provider::Claude => "Claude",
        Provider::Codex => "Codex",
        Provider::Gemini => "Gemini CLI",
        Provider::Copilot => "Copilot",
        Provider::Cursor => "Cursor",
    };
    let locator = format!("oauth/{}/{}", provider.as_str(), outcome.account_key);
    let who = outcome
        .identity
        .display_name
        .clone()
        .unwrap_or_else(|| "Account".to_string());
    NewConnection {
        id: connection_id(provider.as_str(), &locator),
        provider: provider.clone(),
        label: format!("{provider_name} · {who}"),
        source_locator: locator,
        identity: Some(outcome.identity.clone()),
    }
}

/// Reads the quota for an OAuth connection, renewing tokens when needed.
pub async fn refresh_quota(
    connection: &ProviderConnection,
    app_data_dir: &Path,
    client: &reqwest::Client,
    force: bool,
) -> Result<QuotaReading, String> {
    let current = credentials_for_request(connection, app_data_dir, client).await?;
    match read_quota(connection, client, &current, force).await {
        Err(message) if message.contains("expired") && current.refresh_token.is_some() => {
            // The token may have been revoked early. Renew once, then retry.
            let renewed = renew(connection, app_data_dir, client, &current).await?;
            read_quota(connection, client, &renewed, force).await
        }
        result => result,
    }
}

/// Loads credentials and renews them before a provider request when required.
pub async fn credentials_for_request(
    connection: &ProviderConnection,
    app_data_dir: &Path,
    client: &reqwest::Client,
) -> Result<Credentials, String> {
    let mut current = credentials::load(app_data_dir, &connection.id)?;
    let lead = match connection.provider {
        Provider::Claude => claude::REFRESH_LEAD,
        Provider::Codex => codex::REFRESH_LEAD,
        Provider::Gemini => gemini::REFRESH_LEAD,
        Provider::Copilot => chrono::Duration::zero(),
        Provider::Cursor => cursor::REFRESH_LEAD,
    };
    if current.refresh_token.is_some() && current.expires_within(lead) {
        current = renew(connection, app_data_dir, client, &current).await?;
    }
    Ok(current)
}

async fn renew(
    connection: &ProviderConnection,
    app_data_dir: &Path,
    client: &reqwest::Client,
    current: &Credentials,
) -> Result<Credentials, String> {
    let renewed = match connection.provider {
        Provider::Claude => claude::refresh_tokens(client, current).await,
        Provider::Codex => codex::refresh_tokens(client, current).await,
        Provider::Gemini => gemini::refresh_tokens(client, current).await,
        Provider::Copilot => Err("GitHub tokens do not renew. Sign in again.".to_string()),
        Provider::Cursor => Err("Cursor tokens do not renew. Sign in again.".to_string()),
    }
    .map_err(|message| format!("{message} Sign in again to renew the login."))?;
    credentials::save(app_data_dir, &connection.id, &renewed)?;
    Ok(renewed)
}

async fn read_quota(
    connection: &ProviderConnection,
    client: &reqwest::Client,
    current: &Credentials,
    force: bool,
) -> Result<QuotaReading, String> {
    match connection.provider {
        Provider::Claude => claude::cached_usage(client, &current.access_token, force).await,
        Provider::Codex => codex::usage(client, current).await,
        Provider::Gemini => gemini::usage(client, current).await,
        Provider::Copilot => {
            let login = connection
                .identity
                .as_ref()
                .and_then(|identity| identity.provider_user_id.as_deref())
                .unwrap_or("github");
            copilot::usage(client, current, login).await
        }
        Provider::Cursor => cursor::usage(client, current).await,
    }
}

fn open_browser(url: &str) -> Result<(), String> {
    open::that_detached(url).map_err(|_| "The browser could not open.".to_string())
}

pub fn decode_jwt_claims(token: &str) -> Option<serde_json::Value> {
    let payload = token.split('.').nth(1)?;
    let bytes = URL_SAFE_NO_PAD.decode(payload.trim_end_matches('=')).ok()?;
    serde_json::from_slice(&bytes).ok()
}

/// Turns an HTTP error body into a short user-facing sentence.
pub fn describe_http_failure(provider: &str, status: reqwest::StatusCode, body: &str) -> String {
    let detail = serde_json::from_str::<serde_json::Value>(body)
        .ok()
        .and_then(|json| {
            ["error_description", "message", "error"]
                .iter()
                .find_map(|key| {
                    json.get(*key).and_then(|value| {
                        value
                            .as_str()
                            .map(str::to_string)
                            .or_else(|| value.get("message")?.as_str().map(str::to_string))
                    })
                })
        })
        .unwrap_or_else(|| body.chars().take(120).collect());
    if detail.trim().is_empty() {
        format!("{provider} returned HTTP {}.", status.as_u16())
    } else {
        format!("{provider} returned HTTP {}: {detail}", status.as_u16())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn pkce_challenge_matches_rfc_7636() {
        let pair = pkce();
        assert_eq!(pair.verifier.len(), 43);
        let expected = URL_SAFE_NO_PAD.encode(Sha256::digest(pair.verifier.as_bytes()));
        assert_eq!(pair.challenge, expected);
        assert_ne!(pair.state, pair.verifier);
    }

    #[test]
    fn decodes_jwt_claims() {
        let claims = URL_SAFE_NO_PAD.encode(br#"{"email":"a@b.c"}"#);
        let token = format!("eyJhbGciOiJub25lIn0.{claims}.sig");
        assert_eq!(
            decode_jwt_claims(&token).and_then(|json| json["email"].as_str().map(str::to_string)),
            Some("a@b.c".into())
        );
    }
}
