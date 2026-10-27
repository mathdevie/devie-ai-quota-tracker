//! Token storage: one private JSON file (`0600`) per connection under the app
//! data folder, like the provider CLIs. No Keychain prompts on unsigned dev builds.

use std::{
    fs,
    path::{Path, PathBuf},
};

use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use zeroize::Zeroize;

/// All token mutations (refresh, reconnect, removal) share this connection lock.
pub async fn lock(app_data_dir: &Path, connection_id: &str) -> tokio::sync::OwnedMutexGuard<()> {
    use std::{
        collections::HashMap,
        sync::{Arc, Mutex, OnceLock, Weak},
    };
    type Gate = tokio::sync::Mutex<()>;
    static LOCKS: OnceLock<Mutex<HashMap<PathBuf, Weak<Gate>>>> = OnceLock::new();
    let gate = {
        let mut locks = LOCKS
            .get_or_init(Mutex::default)
            .lock()
            .unwrap_or_else(|p| p.into_inner());
        locks.retain(|_, gate| gate.strong_count() > 0);
        let key = path_for(app_data_dir, connection_id);
        let gate = locks
            .get(&key)
            .and_then(Weak::upgrade)
            .unwrap_or_else(|| Arc::new(Gate::new(())));
        locks.insert(key, Arc::downgrade(&gate));
        gate
    };
    gate.lock_owned().await
}

/// Re-read under the lock, then atomically rotate once. A rejected request uses
/// the latest token if another request or a reconnect has already replaced it.
pub async fn refresh_with<F, Fut>(
    root: &Path,
    id: &str,
    rejected: Option<&str>,
    due: impl FnOnce(&Credentials) -> bool,
    refresh: F,
) -> Result<Credentials, crate::oauth::ProviderError>
where
    F: FnOnce(Credentials) -> Fut,
    Fut: std::future::Future<Output = Result<Credentials, crate::oauth::ProviderError>>,
{
    use crate::oauth::ProviderError;
    let _guard = lock(root, id).await;
    let current = load(root, id).map_err(ProviderError::needs_login)?;
    if rejected.is_some_and(|token| token != current.access_token)
        || (rejected.is_none() && !due(&current))
    {
        return Ok(current);
    }
    let mut renewed = match refresh(current.clone()).await {
        Ok(renewed) => renewed,
        Err(error)
            if rejected.is_none()
                && error.transient()
                && current.expires_at.is_some()
                && !current.expires_within(Duration::zero()) =>
        {
            return Ok(current)
        }
        Err(error) => return Err(error),
    };
    if renewed.access_token.is_empty() {
        return Err(ProviderError::invalid(
            "The provider returned no access token.",
        ));
    }
    renewed.last_refresh_at = Some(Utc::now());
    save(root, id, &renewed)?;
    Ok(renewed)
}

/// Resolve deferred Google project setup without overwriting a concurrent
/// refresh or recreating credentials after account removal.
pub async fn project_with<F, Fut>(
    root: &Path,
    id: &str,
    resolve: F,
) -> Result<Credentials, crate::oauth::ProviderError>
where
    F: FnOnce(Credentials) -> Fut,
    Fut: std::future::Future<Output = Result<String, crate::oauth::ProviderError>>,
{
    let _guard = lock(root, id).await;
    let mut current = load(root, id).map_err(crate::oauth::ProviderError::needs_login)?;
    if current.project_id.is_none() {
        current.project_id = Some(resolve(current.clone()).await?);
        save(root, id, &current)?;
    }
    Ok(current)
}

#[derive(Clone, Debug, Default, Deserialize, Serialize, PartialEq)]
pub struct Credentials {
    pub access_token: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub refresh_token: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub expires_at: Option<DateTime<Utc>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub last_refresh_at: Option<DateTime<Utc>>,
    /// Provider-specific data, such as the ChatGPT account id.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub account_id: Option<String>,
    /// Provider-specific project data, such as a Gemini Code Assist project.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub project_id: Option<String>,
}

impl Credentials {
    /// True when the access token expires within `lead`.
    pub fn expires_within(&self, lead: Duration) -> bool {
        self.expires_at
            .is_some_and(|expires_at| expires_at - Utc::now() <= lead)
    }
}

impl Drop for Credentials {
    fn drop(&mut self) {
        self.access_token.zeroize();
        if let Some(token) = self.refresh_token.as_mut() {
            token.zeroize();
        }
    }
}

fn path_for(app_data_dir: &Path, connection_id: &str) -> PathBuf {
    app_data_dir
        .join("credentials")
        .join(format!("{connection_id}.json"))
}

pub fn load(app_data_dir: &Path, connection_id: &str) -> Result<Credentials, String> {
    let data = fs::read(path_for(app_data_dir, connection_id))
        .map_err(|_| "The saved login for this account is missing. Sign in again.".to_string())?;
    serde_json::from_slice(&data)
        .map_err(|_| "The saved login for this account is invalid. Sign in again.".to_string())
}

pub fn save(
    app_data_dir: &Path,
    connection_id: &str,
    credentials: &Credentials,
) -> Result<(), String> {
    let path = path_for(app_data_dir, connection_id);
    let parent = path
        .parent()
        .ok_or_else(|| "The credentials folder is invalid.".to_string())?;
    fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        fs::set_permissions(parent, fs::Permissions::from_mode(0o700))
            .map_err(|e| e.to_string())?;
    }
    let bytes = serde_json::to_vec_pretty(credentials).map_err(|error| error.to_string())?;
    let temporary = parent.join(format!("{}.tmp", uuid::Uuid::new_v4()));
    let result = (|| -> Result<(), String> {
        use std::io::Write;
        let mut options = fs::OpenOptions::new();
        options.write(true).create_new(true);
        #[cfg(unix)]
        {
            use std::os::unix::fs::OpenOptionsExt;
            options.mode(0o600);
        }
        let mut file = options.open(&temporary).map_err(|e| e.to_string())?;
        file.write_all(&bytes).map_err(|e| e.to_string())?;
        file.sync_all().map_err(|e| e.to_string())?;
        fs::rename(&temporary, &path).map_err(|e| e.to_string())
    })();
    if result.is_err() {
        let _ = fs::remove_file(&temporary);
    }
    result
}

pub fn remove(app_data_dir: &Path, connection_id: &str) {
    let _ = fs::remove_file(path_for(app_data_dir, connection_id));
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn deferred_project_setup_preserves_auth_errors_and_retries_with_rotated_token() {
        use crate::oauth::{ErrorKind, ProviderError};
        let root = tempfile::tempdir().unwrap();
        let mut initial = Credentials::default();
        initial.access_token = "old".into();
        save(root.path(), "account", &initial).unwrap();
        let error = project_with(root.path(), "account", |_| async {
            Err(ProviderError::new(ErrorKind::AccessExpired, "expired"))
        })
        .await
        .unwrap_err();
        assert_eq!(error.kind, ErrorKind::AccessExpired);
        assert!(load(root.path(), "account").unwrap().project_id.is_none());

        refresh_with(
            root.path(),
            "account",
            Some("old"),
            |_| true,
            |mut current| async {
                current.access_token = "new".into();
                Ok(current)
            },
        )
        .await
        .unwrap();
        let resolved = project_with(root.path(), "account", |current| async move {
            assert_eq!(current.access_token, "new");
            Ok("project".into())
        })
        .await
        .unwrap();
        assert_eq!(resolved.project_id.as_deref(), Some("project"));
        assert_eq!(load(root.path(), "account").unwrap().access_token, "new");
        project_with(root.path(), "account", |_| async {
            panic!("saved project should be reused");
        })
        .await
        .unwrap();
        remove(root.path(), "account");
        assert!(project_with(root.path(), "account", |_| async {
            panic!("removed account must not be recreated");
        })
        .await
        .is_err());
    }

    #[tokio::test]
    async fn simultaneous_requests_rotate_once_and_reuse_the_persisted_token() {
        use std::sync::{
            atomic::{AtomicUsize, Ordering},
            Arc,
        };
        let root = tempfile::tempdir().unwrap();
        let mut initial = Credentials::default();
        initial.access_token = "old".into();
        initial.refresh_token = Some("refresh-old".into());
        save(root.path(), "account", &initial).unwrap();
        let calls = Arc::new(AtomicUsize::new(0));
        let refresh = |mut current: Credentials| {
            let calls = calls.clone();
            async move {
                calls.fetch_add(1, Ordering::SeqCst);
                tokio::task::yield_now().await;
                current.access_token = "new".into();
                current.refresh_token = Some("refresh-new".into());
                Ok(current)
            }
        };
        let (a, b) = tokio::join!(
            refresh_with(root.path(), "account", Some("old"), |_| true, refresh),
            refresh_with(root.path(), "account", Some("old"), |_| true, refresh),
        );
        assert_eq!(a.unwrap().access_token, "new");
        assert_eq!(b.unwrap().refresh_token.as_deref(), Some("refresh-new"));
        assert_eq!(calls.load(Ordering::SeqCst), 1);
        assert_eq!(load(root.path(), "account").unwrap().access_token, "new");
    }

    #[tokio::test]
    async fn transient_refresh_keeps_a_valid_token_but_rejected_tokens_fail() {
        use crate::oauth::{ErrorKind, ProviderError};
        let root = tempfile::tempdir().unwrap();
        let mut initial = Credentials::default();
        initial.access_token = "valid".into();
        initial.expires_at = Some(Utc::now() + Duration::hours(1));
        save(root.path(), "account", &initial).unwrap();
        let fail = |_| async { Err(ProviderError::new(ErrorKind::Transport, "offline")) };
        assert_eq!(
            refresh_with(root.path(), "account", None, |_| true, fail)
                .await
                .unwrap()
                .access_token,
            "valid"
        );
        assert_eq!(
            refresh_with(root.path(), "account", Some("valid"), |_| true, fail)
                .await
                .unwrap_err()
                .kind,
            ErrorKind::Transport
        );
        remove(root.path(), "account");
        assert!(
            refresh_with(root.path(), "account", Some("valid"), |_| true, fail)
                .await
                .is_err()
        );
        assert!(load(root.path(), "account").is_err());
    }

    #[test]
    fn round_trips_and_restricts_permissions() {
        let root = tempfile::tempdir().expect("temp dir");
        let credentials = Credentials {
            access_token: "access".into(),
            refresh_token: Some("refresh".into()),
            expires_at: Some(Utc::now() + Duration::hours(1)),
            account_id: None,
            project_id: Some("project-123".into()),
            last_refresh_at: None,
        };
        save(root.path(), "abc", &credentials).expect("save");
        let loaded = load(root.path(), "abc").expect("load");
        assert_eq!(loaded.access_token, "access");
        assert_eq!(loaded.project_id.as_deref(), Some("project-123"));
        assert!(!loaded.expires_within(Duration::minutes(5)));
        assert!(loaded.expires_within(Duration::hours(2)));
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let mode = fs::metadata(path_for(root.path(), "abc"))
                .expect("metadata")
                .permissions()
                .mode();
            assert_eq!(mode & 0o777, 0o600);
        }
        remove(root.path(), "abc");
        assert!(load(root.path(), "abc").is_err());
    }
}
