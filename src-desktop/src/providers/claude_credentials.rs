//! Reads the OAuth token that the Claude Code CLI stored for a config dir.
//!
//! Claude Code keeps its token in the macOS Keychain under
//! `Claude Code-credentials` for the default `~/.claude` dir, or
//! `Claude Code-credentials-<sha256(dir)[..8]>` when `CLAUDE_CONFIG_DIR` is
//! set. Older builds and other platforms use `<dir>/.credentials.json`. Both
//! places may exist; the newest token wins.
//!
//! The token is CLI-owned: this module never refreshes it, because a refresh
//! rotates the refresh token and would sign the CLI out.

use std::{
    fs,
    path::Path,
    process::{Command, Stdio},
    time::Duration,
};

use chrono::{DateTime, Utc};
use serde_json::Value;
use sha2::{Digest, Sha256};

use crate::{credentials::Credentials, discovery::run_with_timeout, oauth::claude::tier_label};

const KEYCHAIN_TIMEOUT: Duration = Duration::from_secs(5);

/// A token plus the plan hints Claude Code stores next to it.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct CliCredentials {
    pub credentials: Credentials,
    pub plan: Option<String>,
}

pub fn load(config_dir: &Path) -> Result<CliCredentials, String> {
    let mut candidates = Vec::new();
    if let Some(found) = read_keychain(&keychain_service(config_dir)) {
        candidates.push(found);
    }
    if let Ok(data) = fs::read(config_dir.join(".credentials.json")) {
        if let Some(found) = parse(&data) {
            candidates.push(found);
        }
    }
    let newest = candidates
        .into_iter()
        .max_by_key(|item| item.credentials.expires_at)
        .ok_or_else(|| {
            "No Claude login was found for this folder. Run `claude` and sign in.".to_string()
        })?;
    if newest
        .credentials
        .expires_at
        .is_some_and(|expires_at| expires_at <= Utc::now())
    {
        return Err(
            "The Claude CLI login expired. Run `claude` once to renew it, or sign in on the Providers page."
                .to_string(),
        );
    }
    Ok(newest)
}

/// The Keychain service name Claude Code uses for a config dir.
pub fn keychain_service(config_dir: &Path) -> String {
    let is_default = dirs::home_dir()
        .map(|home| home.join(".claude"))
        .is_some_and(|default| default == config_dir);
    if is_default {
        return "Claude Code-credentials".to_string();
    }
    let digest = Sha256::digest(config_dir.to_string_lossy().as_bytes());
    let hex = digest
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect::<String>();
    format!("Claude Code-credentials-{}", &hex[..8])
}

fn read_keychain(service: &str) -> Option<CliCredentials> {
    #[cfg(not(target_os = "macos"))]
    {
        let _ = service;
        return None;
    }
    #[cfg(target_os = "macos")]
    {
        let output = run_with_timeout(
            Command::new("/usr/bin/security")
                .args(["find-generic-password", "-s", service, "-w"])
                .stdin(Stdio::null()),
            KEYCHAIN_TIMEOUT,
        )?;
        parse(&output)
    }
}

/// Parses the `{"claudeAiOauth": {...}}` document Claude Code writes.
pub fn parse(data: &[u8]) -> Option<CliCredentials> {
    let json: Value = serde_json::from_slice(data).ok()?;
    let oauth = json.get("claudeAiOauth")?.as_object()?;
    let access_token = oauth.get("accessToken")?.as_str()?.to_string();
    let expires_at = oauth
        .get("expiresAt")
        .and_then(Value::as_f64)
        .and_then(|millis| DateTime::from_timestamp_millis(millis as i64));
    let plan = oauth
        .get("rateLimitTier")
        .and_then(Value::as_str)
        .map(tier_label)
        .or_else(|| {
            oauth
                .get("subscriptionType")
                .and_then(Value::as_str)
                .map(crate::oauth::claude::title_case)
        });
    Some(CliCredentials {
        credentials: Credentials {
            access_token,
            // Never carry the refresh token: the CLI owns it.
            refresh_token: None,
            expires_at,
            account_id: None,
            project_id: None,
        },
        plan,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_claude_code_credentials() {
        let parsed = parse(
            br#"{"claudeAiOauth":{"accessToken":"sk-ant-oat01-x","refreshToken":"sk-ant-ort01-y",
                "expiresAt":1787703546358,"subscriptionType":"max","rateLimitTier":"default_claude_max_5x"}}"#,
        )
        .expect("credentials");
        assert_eq!(parsed.credentials.access_token, "sk-ant-oat01-x");
        assert_eq!(parsed.credentials.refresh_token, None);
        assert_eq!(parsed.plan.as_deref(), Some("Max 5x"));
        assert_eq!(
            parsed
                .credentials
                .expires_at
                .map(|value| value.timestamp_millis()),
            Some(1787703546358)
        );
    }

    #[test]
    fn keychain_service_uses_a_short_sha256_for_custom_dirs() {
        assert_eq!(
            keychain_service(Path::new("/Users/math/.claude-personal")),
            "Claude Code-credentials-b546f24b"
        );
    }

    #[test]
    fn keychain_service_has_no_suffix_for_the_default_dir() {
        let default = dirs::home_dir().expect("home").join(".claude");
        assert_eq!(keychain_service(&default), "Claude Code-credentials");
    }

    #[test]
    fn expired_file_token_is_rejected() {
        let root = tempfile::tempdir().expect("temp dir");
        fs::write(
            root.path().join(".credentials.json"),
            br#"{"claudeAiOauth":{"accessToken":"old","expiresAt":1000}}"#,
        )
        .expect("file");
        let error = load(root.path()).expect_err("expired");
        assert!(error.contains("expired"));
    }
}
