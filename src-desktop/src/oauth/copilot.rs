//! GitHub Copilot sign-in through the GitHub device code flow.
//!
//! Uses the public GitHub Copilot client id. Quota comes from the internal
//! Copilot user endpoint with the GitHub OAuth token.

use std::time::Duration as StdDuration;

use chrono::{Duration, Utc};
use serde_json::Value;

use crate::{
    credentials::Credentials,
    model::{QuotaReading, RemoteIdentity},
    oauth::{describe_http_failure, LoginOutcome, USER_AGENT},
    providers::copilot::parse_payload,
};

pub const CLIENT_ID: &str = "Iv1.b507a08c87ecfe98";
pub const DEVICE_CODE_URL: &str = "https://github.com/login/device/code";
pub const TOKEN_URL: &str = "https://github.com/login/oauth/access_token";
pub const USER_URL: &str = "https://api.github.com/user";
pub const USAGE_URL: &str = "https://api.github.com/copilot_internal/user";
pub const SCOPES: &str = "read:user";
const API_VERSION: &str = "2022-11-28";

#[derive(Clone, Debug)]
pub struct DeviceCode {
    pub device_code: String,
    pub user_code: String,
    pub verification_uri: String,
    pub interval: StdDuration,
    pub expires_in: StdDuration,
}

pub async fn request_device_code(client: &reqwest::Client) -> Result<DeviceCode, String> {
    let response = client
        .post(DEVICE_CODE_URL)
        .header(reqwest::header::ACCEPT, "application/json")
        .header(reqwest::header::USER_AGENT, USER_AGENT)
        .form(&[("client_id", CLIENT_ID), ("scope", SCOPES)])
        .send()
        .await
        .map_err(|_| "GitHub could not be reached.".to_string())?;
    let status = response.status();
    let text = response.text().await.unwrap_or_default();
    if !status.is_success() {
        return Err(describe_http_failure("GitHub", status, &text));
    }
    let json: Value = serde_json::from_str(&text)
        .map_err(|_| "GitHub returned an invalid device code response.".to_string())?;
    let field = |key: &str| {
        json.get(key)
            .and_then(Value::as_str)
            .map(str::to_string)
            .ok_or_else(|| format!("GitHub returned no `{key}`."))
    };
    Ok(DeviceCode {
        device_code: field("device_code")?,
        user_code: field("user_code")?,
        verification_uri: field("verification_uri")?,
        interval: StdDuration::from_secs(json["interval"].as_u64().unwrap_or(5).max(1)),
        expires_in: StdDuration::from_secs(json["expires_in"].as_u64().unwrap_or(900)),
    })
}

/// Polls GitHub until the user approves, denies, or the code expires.
pub async fn wait_for_approval(
    client: &reqwest::Client,
    device: &DeviceCode,
) -> Result<LoginOutcome, String> {
    let deadline = tokio::time::Instant::now() + device.expires_in.min(super::LOGIN_TIMEOUT);
    let mut interval = device.interval;
    loop {
        if tokio::time::Instant::now() >= deadline {
            return Err("The GitHub sign-in timed out. Start again.".to_string());
        }
        tokio::time::sleep(interval).await;
        let response = client
            .post(TOKEN_URL)
            .header(reqwest::header::ACCEPT, "application/json")
            .header(reqwest::header::USER_AGENT, USER_AGENT)
            .form(&[
                ("client_id", CLIENT_ID),
                ("device_code", device.device_code.as_str()),
                ("grant_type", "urn:ietf:params:oauth:grant-type:device_code"),
            ])
            .send()
            .await
            .map_err(|_| "GitHub could not be reached.".to_string())?;
        let json: Value = response.json().await.unwrap_or(Value::Null);
        match json.get("error").and_then(Value::as_str) {
            Some("authorization_pending") => continue,
            Some("slow_down") => {
                interval += StdDuration::from_secs(5);
                continue;
            }
            Some("expired_token") => {
                return Err("The GitHub code expired. Start again.".to_string())
            }
            Some("access_denied") => {
                return Err("GitHub access was denied.".to_string());
            }
            Some(error) => {
                let detail = json
                    .get("error_description")
                    .and_then(Value::as_str)
                    .unwrap_or(error);
                return Err(format!("GitHub sign-in failed: {detail}"));
            }
            None => {}
        }
        let Some(access_token) = json.get("access_token").and_then(Value::as_str) else {
            continue;
        };
        let credentials = Credentials {
            access_token: access_token.to_string(),
            refresh_token: json
                .get("refresh_token")
                .and_then(Value::as_str)
                .map(str::to_string),
            expires_at: json
                .get("expires_in")
                .and_then(Value::as_i64)
                .map(|seconds| Utc::now() + Duration::seconds(seconds)),
            account_id: None,
        };
        let identity = user(client, &credentials.access_token).await?;
        let account_key = identity
            .provider_user_id
            .clone()
            .unwrap_or_else(|| Utc::now().timestamp_millis().to_string());
        return Ok(LoginOutcome {
            credentials,
            identity,
            account_key,
        });
    }
}

async fn user(client: &reqwest::Client, access_token: &str) -> Result<RemoteIdentity, String> {
    let response = client
        .get(USER_URL)
        .bearer_auth(access_token)
        .header(reqwest::header::ACCEPT, "application/json")
        .header(reqwest::header::USER_AGENT, USER_AGENT)
        .header("X-GitHub-Api-Version", API_VERSION)
        .send()
        .await
        .map_err(|_| "GitHub could not be reached.".to_string())?;
    if !response.status().is_success() {
        return Err("GitHub did not return the account profile.".to_string());
    }
    let json: Value = response
        .json()
        .await
        .map_err(|_| "GitHub returned an invalid profile.".to_string())?;
    let login = json
        .get("login")
        .and_then(Value::as_str)
        .map(str::to_string);
    Ok(RemoteIdentity {
        provider_user_id: login.clone(),
        display_name: json
            .get("email")
            .and_then(Value::as_str)
            .map(str::to_string)
            .or(login),
        plan: None,
    })
}

pub async fn usage(
    client: &reqwest::Client,
    credentials: &Credentials,
    login: &str,
) -> Result<QuotaReading, String> {
    let response = client
        .get(USAGE_URL)
        .header(reqwest::header::ACCEPT, "application/json")
        .header(
            reqwest::header::AUTHORIZATION,
            format!("token {}", credentials.access_token),
        )
        .header(reqwest::header::USER_AGENT, "GitHubCopilotChat/0.26.7")
        .header("Editor-Version", "vscode/1.100.0")
        .header("Editor-Plugin-Version", "copilot-chat/0.26.7")
        .header("X-GitHub-Api-Version", API_VERSION)
        .send()
        .await
        .map_err(|_| "GitHub Copilot could not be reached.".to_string())?;
    let status = response.status();
    if status.as_u16() == 401 {
        return Err("The GitHub login expired. Sign in again.".to_string());
    }
    if status.as_u16() == 403 || status.as_u16() == 404 {
        return Err("This GitHub account has no Copilot access.".to_string());
    }
    let text = response.text().await.unwrap_or_default();
    if !status.is_success() {
        return Err(describe_http_failure("GitHub Copilot", status, &text));
    }
    let json: Value = serde_json::from_str(&text)
        .map_err(|_| "GitHub Copilot returned invalid quota data.".to_string())?;
    let mut reading = parse_payload(&json, login)?;
    reading.source = "GitHub Copilot API".to_string();
    Ok(reading)
}
