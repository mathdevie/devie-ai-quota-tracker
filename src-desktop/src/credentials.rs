//! Token storage for OAuth connections.
//!
//! Tokens live in one private JSON file per connection under the application
//! data folder, with `0600` permissions. This mirrors what the provider CLIs
//! do with their own credential files and avoids Keychain prompts on every
//! rebuild of an unsigned development binary.

use std::{
    fs,
    path::{Path, PathBuf},
};

use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use zeroize::Zeroize;

#[derive(Clone, Debug, Default, Deserialize, Serialize, PartialEq)]
pub struct Credentials {
    pub access_token: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub refresh_token: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub expires_at: Option<DateTime<Utc>>,
    /// Provider-specific data, such as the ChatGPT account id.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub account_id: Option<String>,
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
        let _ = fs::set_permissions(parent, fs::Permissions::from_mode(0o700));
    }
    let bytes = serde_json::to_vec_pretty(credentials).map_err(|error| error.to_string())?;
    let temporary = path.with_extension("json.tmp");
    fs::write(&temporary, bytes).map_err(|error| error.to_string())?;
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        fs::set_permissions(&temporary, fs::Permissions::from_mode(0o600))
            .map_err(|error| error.to_string())?;
    }
    fs::rename(&temporary, &path).map_err(|error| error.to_string())
}

pub fn remove(app_data_dir: &Path, connection_id: &str) {
    let _ = fs::remove_file(path_for(app_data_dir, connection_id));
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trips_and_restricts_permissions() {
        let root = tempfile::tempdir().expect("temp dir");
        let credentials = Credentials {
            access_token: "access".into(),
            refresh_token: Some("refresh".into()),
            expires_at: Some(Utc::now() + Duration::hours(1)),
            account_id: None,
        };
        save(root.path(), "abc", &credentials).expect("save");
        let loaded = load(root.path(), "abc").expect("load");
        assert_eq!(loaded.access_token, "access");
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
