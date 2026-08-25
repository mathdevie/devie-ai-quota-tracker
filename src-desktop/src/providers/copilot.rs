use std::process::Command;

use reqwest::header::{ACCEPT, AUTHORIZATION, USER_AGENT};
use serde_json::{Map, Value};
use zeroize::Zeroize;

use crate::{
    model::{ProviderConnection, QuotaReading, QuotaWindow, RemoteIdentity},
    providers::{number, reset_time},
};

pub async fn refresh(
    connection: &ProviderConnection,
    client: &reqwest::Client,
) -> Result<QuotaReading, String> {
    let (host, login) = connection
        .source_locator
        .split_once('/')
        .ok_or_else(|| "The GitHub account locator is invalid.".to_string())?;
    if host != "github.com" {
        return Err("The POC supports Copilot accounts on github.com only.".to_string());
    }

    let mut token = github_token(host, login)?;
    let response = client
        .get("https://api.github.com/copilot_internal/user")
        .header(ACCEPT, "application/json")
        .header(AUTHORIZATION, format!("token {token}"))
        .header(USER_AGENT, "devie-quota/0.2")
        .header("Editor-Version", "vscode/1.95.0")
        .header("Editor-Plugin-Version", "copilot-chat/0.26.7")
        .header("X-GitHub-Api-Version", "2022-11-28")
        .send()
        .await;
    token.zeroize();

    let response = response.map_err(|_| "GitHub Copilot could not be reached.".to_string())?;
    if matches!(response.status().as_u16(), 401 | 403) {
        return Err("The GitHub CLI account needs Copilot access or a new login.".to_string());
    }
    if !response.status().is_success() {
        return Err(format!(
            "GitHub Copilot returned HTTP {}.",
            response.status().as_u16()
        ));
    }
    let payload: Value = response
        .json()
        .await
        .map_err(|_| "GitHub Copilot returned invalid quota data.".to_string())?;
    parse_payload(&payload, login)
}

fn github_token(host: &str, login: &str) -> Result<String, String> {
    let output = Command::new("gh")
        .args(["auth", "token", "--hostname", host, "--user", login])
        .env("GH_PROMPT_DISABLED", "1")
        .output()
        .map_err(|_| "GitHub CLI is not installed.".to_string())?;
    if !output.status.success() {
        return Err(format!(
            "The GitHub CLI account `{login}` needs a new login."
        ));
    }
    let token = String::from_utf8(output.stdout)
        .map_err(|_| "GitHub CLI returned an invalid token.".to_string())?
        .trim()
        .to_string();
    if token.is_empty() {
        return Err(format!("The GitHub CLI account `{login}` has no token."));
    }
    Ok(token)
}

pub fn parse_payload(payload: &Value, login: &str) -> Result<QuotaReading, String> {
    let object = payload
        .as_object()
        .ok_or_else(|| "GitHub Copilot returned an invalid quota object.".to_string())?;
    let snapshots = object
        .get("quota_snapshots")
        .and_then(Value::as_object)
        .ok_or_else(|| "GitHub Copilot returned no quota snapshots.".to_string())?;
    let reset = reset_time(object.get("quota_reset_date"));
    let mut windows = Vec::new();
    add_snapshot(
        snapshots,
        "premium_interactions",
        "Premium",
        reset.clone(),
        &mut windows,
    );
    add_snapshot(snapshots, "chat", "Chat", reset, &mut windows);
    if windows.is_empty() {
        return Err("GitHub Copilot returned no usable subscription quota.".to_string());
    }
    let plan = object
        .get("copilot_plan")
        .and_then(Value::as_str)
        .map(title_case);
    Ok(QuotaReading {
        source: "GitHub CLI + Copilot quota".to_string(),
        identity: Some(RemoteIdentity {
            provider_user_id: Some(login.to_string()),
            display_name: Some(login.to_string()),
            plan,
        }),
        windows,
    })
}

fn add_snapshot(
    snapshots: &Map<String, Value>,
    key: &str,
    label: &str,
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
    let percent_remaining = number(snapshot.get("percent_remaining")).or_else(|| {
        let total = entitlement?;
        let remaining = number(
            snapshot
                .get("remaining")
                .or_else(|| snapshot.get("quota_remaining")),
        )?;
        (total > 0.0).then_some(remaining / total * 100.0)
    });
    let used = if unlimited {
        0.0
    } else {
        let Some(remaining) = percent_remaining else {
            return;
        };
        (100.0 - remaining).clamp(0.0, 100.0)
    };
    windows.push(QuotaWindow {
        key: key.to_string(),
        label: label.to_string(),
        used_percent: used,
        resets_at,
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
        assert_eq!(
            reading.identity.and_then(|value| value.plan),
            Some("Individual".into())
        );
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
