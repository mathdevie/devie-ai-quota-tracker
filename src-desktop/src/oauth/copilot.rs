//! GitHub Copilot sign-in through the GitHub device code flow.
//!
//! Uses the public GitHub Copilot client id. Quota comes from the internal
//! Copilot user endpoint with the GitHub OAuth token.

use std::time::Duration as StdDuration;

use chrono::{Duration, Utc};
use serde_json::{Map, Value};

use crate::{
    credentials::Credentials,
    model::{QuotaAmount, QuotaReading, QuotaWindow, RemoteIdentity},
    oauth::{describe_http_failure, LoginOutcome, USER_AGENT},
    parse::{number, reset_time},
};

/// Public OAuth client ID of GitHub's Copilot IDE plugins.
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
            project_id: None,
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

pub fn parse_payload(payload: &Value, login: &str) -> Result<QuotaReading, String> {
    let object = payload
        .as_object()
        .ok_or_else(|| "GitHub Copilot returned an invalid quota object.".to_string())?;
    let snapshots = object
        .get("quota_snapshots")
        .and_then(Value::as_object)
        .ok_or_else(|| "GitHub Copilot returned no quota snapshots.".to_string())?;
    let reset = reset_time(
        object
            .get("quota_reset_date_utc")
            .or_else(|| object.get("quota_reset_date")),
    );
    // Since June 2026 the premium allowance is billed in AI Credits (one
    // credit is one US cent). Annual subscribers may still count requests.
    let credits = object
        .get("token_based_billing")
        .and_then(Value::as_bool)
        .unwrap_or(false);
    let (label, unit) = if credits {
        ("AI Credits", "credits")
    } else {
        ("Premium", "requests")
    };
    let mut windows = Vec::new();
    add_snapshot(
        snapshots,
        "premium_interactions",
        label,
        unit,
        reset.clone(),
        &mut windows,
    );
    add_snapshot(
        snapshots,
        "chat",
        "Chat",
        "messages",
        reset.clone(),
        &mut windows,
    );
    add_snapshot(
        snapshots,
        "completions",
        "Completions",
        "completions",
        reset,
        &mut windows,
    );
    if windows.is_empty() {
        return Err("GitHub Copilot returned no usable subscription quota.".to_string());
    }
    let plan = object
        .get("copilot_plan")
        .and_then(Value::as_str)
        .map(plan_label);
    Ok(QuotaReading {
        source: "GitHub CLI + Copilot quota".to_string(),
        identity: Some(RemoteIdentity {
            provider_user_id: Some(login.to_string()),
            display_name: Some(login.to_string()),
            plan,
        }),
        windows,
        reset_credits: None,
    })
}

/// The marketing name of a `copilot_plan` value. "individual" is the old
/// name of Copilot Pro, still used by the API.
pub fn plan_label(plan: &str) -> String {
    match plan.to_lowercase().as_str() {
        "free" | "free_limited" | "free_limited_copilot" => "Free".to_string(),
        "individual" | "pro" | "copilot_pro" => "Pro".to_string(),
        "individual_pro" | "pro_plus" | "copilot_pro_plus" => "Pro+".to_string(),
        "individual_max" | "max" | "copilot_max" => "Max".to_string(),
        "business" | "copilot_business" => "Business".to_string(),
        "enterprise" | "copilot_enterprise" => "Enterprise".to_string(),
        "student" | "education" => "Student".to_string(),
        other => title_case(other),
    }
}

fn add_snapshot(
    snapshots: &Map<String, Value>,
    key: &str,
    label: &str,
    unit: &str,
    resets_at: Option<String>,
    windows: &mut Vec<QuotaWindow>,
) {
    let Some(snapshot) = snapshots.get(key).and_then(Value::as_object) else {
        return;
    };
    let unlimited = snapshot
        .get("unlimited")
        .and_then(Value::as_bool)
        .unwrap_or(false);
    let entitlement = number(snapshot.get("entitlement"));
    if !unlimited && entitlement.is_some_and(|value| value <= 0.0) {
        return;
    }
    if unlimited {
        windows.push(QuotaWindow {
            key: key.to_string(),
            label: label.to_string(),
            used_percent: 0.0,
            resets_at: None,
            unlimited: true,
            amount: None,
            paid: false,
        });
        return;
    }
    let remaining = number(
        snapshot
            .get("remaining")
            .or_else(|| snapshot.get("quota_remaining")),
    );
    let percent_remaining = number(snapshot.get("percent_remaining")).or_else(|| {
        let total = entitlement?;
        (total > 0.0).then_some(remaining? / total * 100.0)
    });
    let Some(percent_remaining) = percent_remaining else {
        return;
    };
    let amount = entitlement.map(|total| {
        let used = number(snapshot.get("credits_used"))
            .or_else(|| remaining.map(|left| total - left))
            .unwrap_or(total * (100.0 - percent_remaining) / 100.0)
            .max(0.0);
        let overage_allowed = snapshot
            .get("overage_permitted")
            .and_then(Value::as_bool)
            .unwrap_or(false);
        let overage =
            number(snapshot.get("overage_count")).filter(|count| overage_allowed || *count > 0.0);
        QuotaAmount {
            used: Some(used.round()),
            total,
            unit: Some(unit.to_string()),
            overage,
        }
    });
    windows.push(QuotaWindow {
        key: key.to_string(),
        label: label.to_string(),
        used_percent: (100.0 - percent_remaining).clamp(0.0, 100.0),
        resets_at,
        unlimited: false,
        amount,
        paid: false,
    });
}

fn title_case(value: &str) -> String {
    value
        .split(['-', '_'])
        .map(|part| {
            let mut chars = part.chars();
            chars
                .next()
                .map(|first| first.to_uppercase().collect::<String>() + chars.as_str())
                .unwrap_or_default()
        })
        .collect::<Vec<_>>()
        .join(" ")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_premium_interaction_quota() {
        let payload: Value = serde_json::from_str(
            r#"{"copilot_plan":"individual","quota_reset_date":"2026-09-01T00:00:00Z","quota_snapshots":{"premium_interactions":{"entitlement":300,"remaining":225,"percent_remaining":75,"quota_id":"premium_interactions"}}}"#,
        )
        .expect("fixture");
        let reading = parse_payload(&payload, "octocat").expect("reading");
        assert_eq!(reading.windows[0].used_percent, 25.0);
        assert_eq!(reading.windows[0].label, "Premium");
        let amount = reading.windows[0].amount.clone().expect("amount");
        assert_eq!((amount.used, amount.total), (Some(75.0), 300.0));
        assert_eq!(amount.overage, None);
        assert_eq!(
            reading.identity.and_then(|value| value.plan),
            Some("Pro".into())
        );
    }

    #[test]
    fn reads_ai_credits_and_unlimited_windows() {
        let payload: Value = serde_json::from_str(
            r#"{"copilot_plan":"individual","token_based_billing":true,"quota_reset_date":"2026-09-01","quota_reset_date_utc":"2026-09-01T00:00:00.000Z",
            "quota_snapshots":{
              "chat":{"unlimited":true,"entitlement":0,"remaining":0,"percent_remaining":100.0},
              "premium_interactions":{"unlimited":false,"entitlement":1500,"remaining":823,"percent_remaining":54.9,"credits_used":676,"overage_permitted":true,"overage_count":12}}}"#,
        )
        .expect("fixture");
        let reading = parse_payload(&payload, "octocat").expect("reading");
        let premium = &reading.windows[0];
        assert_eq!(premium.label, "AI Credits");
        assert_eq!(
            premium.resets_at.as_deref(),
            Some("2026-09-01T00:00:00.000Z")
        );
        let amount = premium.amount.clone().expect("amount");
        assert_eq!(
            (amount.used, amount.total, amount.overage),
            (Some(676.0), 1500.0, Some(12.0))
        );
        assert_eq!(amount.unit.as_deref(), Some("credits"));
        let chat = &reading.windows[1];
        assert!(chat.unlimited);
        assert_eq!(chat.used_percent, 0.0);
        assert_eq!(chat.resets_at, None);
    }

    #[test]
    fn maps_plan_names() {
        assert_eq!(plan_label("individual"), "Pro");
        assert_eq!(plan_label("business"), "Business");
        assert_eq!(plan_label("some_new_plan"), "Some New Plan");
    }

    #[test]
    fn ignores_zero_entitlement_placeholders() {
        let payload: Value = serde_json::from_str(
            r#"{"quota_snapshots":{"premium_interactions":{"entitlement":0,"remaining":0,"percent_remaining":100}}}"#,
        )
        .expect("fixture");
        assert!(parse_payload(&payload, "octocat").is_err());
    }
}
