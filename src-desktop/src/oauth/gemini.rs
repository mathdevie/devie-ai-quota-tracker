//! Gemini CLI sign-in and Code Assist quota reading.
//!
//! This uses the public OAuth client and Code Assist endpoints from Gemini CLI.

use std::collections::BTreeMap;

use chrono::{Duration, Utc};
use serde_json::{json, Value};

use crate::{
    credentials::Credentials,
    model::{QuotaReading, QuotaWindow, RemoteIdentity},
    oauth::{claude::encode_query, describe_http_failure, LoginOutcome, Pkce, USER_AGENT},
    parse::number,
};

/// Public installed-application OAuth client of Google's Gemini CLI
/// (`packages/core/src/code_assist/oauth2.ts`, Apache-2.0).
pub const CLIENT_ID: &str =
    "681255809395-oo8ft2oprdrnp9e3aqf6av3hmdib135j.apps.googleusercontent.com";
/// Published in the same Gemini CLI file. Google treats the client
/// secret of an installed application as non-confidential:
/// <https://developers.google.com/identity/protocols/oauth2#installed>
pub const CLIENT_SECRET: &str = "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";
pub const AUTHORIZE_URL: &str = "https://accounts.google.com/o/oauth2/v2/auth";
pub const TOKEN_URL: &str = "https://oauth2.googleapis.com/token";
pub const PROFILE_URL: &str = "https://www.googleapis.com/oauth2/v2/userinfo";
pub const CODE_ASSIST_URL: &str = "https://cloudcode-pa.googleapis.com";
pub const SCOPES: &str = "https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";
pub const CALLBACK_PATH: &str = "/oauth2callback";
pub const REFRESH_LEAD: Duration = Duration::minutes(5);

pub fn redirect_uri(port: u16) -> String {
    format!("http://127.0.0.1:{port}{CALLBACK_PATH}")
}

pub fn authorize_url(pair: &Pkce, redirect_uri: &str) -> String {
    let query = [
        ("client_id", CLIENT_ID),
        ("response_type", "code"),
        ("redirect_uri", redirect_uri),
        ("scope", SCOPES),
        ("state", pair.state.as_str()),
        ("access_type", "offline"),
        // Google can omit a refresh token for an existing Gemini CLI grant.
        ("prompt", "consent"),
    ];
    format!("{AUTHORIZE_URL}?{}", encode_query(&query))
}

pub async fn exchange(
    client: &reqwest::Client,
    pair: &Pkce,
    redirect_uri: &str,
    code: &str,
    state: Option<&str>,
) -> Result<LoginOutcome, String> {
    if state != Some(pair.state.as_str()) {
        return Err("The sign-in response does not match this session. Start again.".to_string());
    }
    let tokens = post_token(
        client,
        &[
            ("grant_type", "authorization_code"),
            ("client_id", CLIENT_ID),
            ("client_secret", CLIENT_SECRET),
            ("code", code.trim()),
            ("redirect_uri", redirect_uri),
        ],
    )
    .await?;
    let mut credentials = credentials_from(&tokens, None, None)?;
    let (mut identity, account_key) = profile(client, &credentials.access_token).await?;
    let project = load_or_create_project(client, &credentials.access_token).await?;
    credentials.project_id = Some(project.id);
    identity.plan = project.plan;
    Ok(LoginOutcome {
        credentials,
        identity,
        account_key,
    })
}

pub async fn refresh_tokens(
    client: &reqwest::Client,
    current: &Credentials,
) -> Result<Credentials, String> {
    let refresh_token = current
        .refresh_token
        .as_deref()
        .ok_or_else(|| "This Gemini login cannot be renewed. Sign in again.".to_string())?;
    let tokens = post_token(
        client,
        &[
            ("grant_type", "refresh_token"),
            ("client_id", CLIENT_ID),
            ("client_secret", CLIENT_SECRET),
            ("refresh_token", refresh_token),
        ],
    )
    .await?;
    let mut credentials = credentials_from(
        &tokens,
        current.refresh_token.clone(),
        current.project_id.clone(),
    )?;
    credentials.account_id = current.account_id.clone();
    Ok(credentials)
}

async fn post_token(client: &reqwest::Client, form: &[(&str, &str)]) -> Result<Value, String> {
    let response = client
        .post(TOKEN_URL)
        .header(reqwest::header::USER_AGENT, USER_AGENT)
        .header(reqwest::header::ACCEPT, "application/json")
        .form(form)
        .send()
        .await
        .map_err(|_| "Google could not be reached.".to_string())?;
    let status = response.status();
    let text = response.text().await.unwrap_or_default();
    if !status.is_success() {
        return Err(describe_http_failure("Gemini", status, &text));
    }
    serde_json::from_str(&text)
        .map_err(|_| "Gemini returned an invalid token response.".to_string())
}

fn credentials_from(
    tokens: &Value,
    fallback_refresh: Option<String>,
    project_id: Option<String>,
) -> Result<Credentials, String> {
    let access_token = tokens
        .get("access_token")
        .and_then(Value::as_str)
        .ok_or_else(|| "Gemini returned no access token.".to_string())?
        .to_string();
    let refresh_token = tokens
        .get("refresh_token")
        .and_then(Value::as_str)
        .map(str::to_string)
        .or(fallback_refresh);
    let expires_at = number(tokens.get("expires_in"))
        .map(|seconds| Utc::now() + Duration::seconds(seconds as i64));
    Ok(Credentials {
        access_token,
        refresh_token,
        expires_at,
        account_id: None,
        project_id,
    })
}

async fn profile(
    client: &reqwest::Client,
    access_token: &str,
) -> Result<(RemoteIdentity, String), String> {
    let response = client
        .get(PROFILE_URL)
        .bearer_auth(access_token)
        .header(reqwest::header::USER_AGENT, USER_AGENT)
        .send()
        .await
        .map_err(|_| "Google could not load the account profile.".to_string())?;
    let status = response.status();
    let text = response.text().await.unwrap_or_default();
    if !status.is_success() {
        return Err(describe_http_failure("Google profile", status, &text));
    }
    let json: Value = serde_json::from_str(&text)
        .map_err(|_| "Google returned an invalid account profile.".to_string())?;
    let provider_user_id = text_value(&json, &["id", "sub"]);
    let display_name = text_value(&json, &["email", "name"]);
    let account_key = provider_user_id
        .clone()
        .or_else(|| display_name.clone())
        .ok_or_else(|| "Google returned no account identity.".to_string())?;
    Ok((
        RemoteIdentity {
            provider_user_id,
            display_name,
            plan: None,
        },
        account_key,
    ))
}

#[derive(Debug, PartialEq)]
struct ProjectInfo {
    id: String,
    plan: Option<String>,
}

async fn load_or_create_project(
    client: &reqwest::Client,
    access_token: &str,
) -> Result<ProjectInfo, String> {
    let load = code_assist_post(
        client,
        access_token,
        "v1internal:loadCodeAssist",
        &json!({ "metadata": client_metadata(None) }),
    )
    .await?;
    if let Some(id) = project_id(load.get("cloudaicompanionProject")) {
        return Ok(ProjectInfo {
            id,
            plan: plan_name(&load),
        });
    }
    if load.get("currentTier").is_some_and(|tier| !tier.is_null()) {
        return Err(
            "Gemini requires a Google Cloud project for this account. Set one in Gemini CLI first."
                .to_string(),
        );
    }

    let tier = load
        .get("allowedTiers")
        .and_then(Value::as_array)
        .and_then(|tiers| {
            tiers
                .iter()
                .find(|tier| tier.get("isDefault").and_then(Value::as_bool) == Some(true))
                .or_else(|| tiers.first())
        });
    let tier_id = tier
        .and_then(|tier| text_value(tier, &["id", "tierId"]))
        .unwrap_or_else(|| "legacy-tier".to_string());
    let plan = tier
        .and_then(|tier| text_value(tier, &["name", "displayName"]))
        .or_else(|| Some(plan_label(&tier_id)));
    let mut operation = code_assist_post(
        client,
        access_token,
        "v1internal:onboardUser",
        &json!({
            "tierId": tier_id,
            "metadata": client_metadata(None),
        }),
    )
    .await?;

    for attempt in 0..10 {
        if let Some(id) = project_id(
            operation
                .get("response")
                .and_then(|response| response.get("cloudaicompanionProject")),
        ) {
            return Ok(ProjectInfo { id, plan });
        }
        if operation.get("done").and_then(Value::as_bool) == Some(true) {
            break;
        }
        let Some(name) = operation.get("name").and_then(Value::as_str) else {
            break;
        };
        if attempt == 9 {
            break;
        }
        tokio::time::sleep(std::time::Duration::from_secs(5)).await;
        operation = code_assist_get(client, access_token, name).await?;
    }
    Err(
        "Gemini did not finish the account setup. Open Gemini CLI once, then try again."
            .to_string(),
    )
}

fn client_metadata(project_id: Option<&str>) -> Value {
    let mut metadata = json!({
        "ideType": "IDE_UNSPECIFIED",
        "platform": "PLATFORM_UNSPECIFIED",
        "pluginType": "GEMINI",
    });
    if let Some(project_id) = project_id {
        metadata["duetProject"] = Value::String(project_id.to_string());
    }
    metadata
}

async fn code_assist_post(
    client: &reqwest::Client,
    access_token: &str,
    path: &str,
    body: &Value,
) -> Result<Value, String> {
    let url = format!("{CODE_ASSIST_URL}/{path}");
    let response = client
        .post(url)
        .bearer_auth(access_token)
        .header(reqwest::header::USER_AGENT, USER_AGENT)
        .json(body)
        .send()
        .await
        .map_err(|_| "Gemini Code Assist could not be reached.".to_string())?;
    parse_code_assist_response(response).await
}

async fn code_assist_get(
    client: &reqwest::Client,
    access_token: &str,
    path: &str,
) -> Result<Value, String> {
    let url = format!("{CODE_ASSIST_URL}/v1internal/{path}");
    let response = client
        .get(url)
        .bearer_auth(access_token)
        .header(reqwest::header::USER_AGENT, USER_AGENT)
        .send()
        .await
        .map_err(|_| "Gemini Code Assist could not be reached.".to_string())?;
    parse_code_assist_response(response).await
}

async fn parse_code_assist_response(response: reqwest::Response) -> Result<Value, String> {
    let status = response.status();
    let text = response.text().await.unwrap_or_default();
    if status.as_u16() == 401 {
        return Err("The Gemini login expired. Sign in again.".to_string());
    }
    if !status.is_success() {
        return Err(describe_http_failure("Gemini Code Assist", status, &text));
    }
    serde_json::from_str(&text).map_err(|_| "Gemini Code Assist returned invalid data.".to_string())
}

pub async fn usage(
    client: &reqwest::Client,
    credentials: &Credentials,
) -> Result<QuotaReading, String> {
    let project_id = credentials.project_id.as_deref().ok_or_else(|| {
        "The Gemini account has no Code Assist project. Sign in again.".to_string()
    })?;
    let json = code_assist_post(
        client,
        &credentials.access_token,
        "v1internal:retrieveUserQuota",
        &json!({ "project": project_id }),
    )
    .await?;
    parse_usage(&json)
}

pub fn parse_usage(json: &Value) -> Result<QuotaReading, String> {
    let buckets = json
        .get("buckets")
        .and_then(Value::as_array)
        .ok_or_else(|| "Gemini returned no quota data.".to_string())?;
    let mut windows = BTreeMap::new();
    for bucket in buckets {
        let Some(model_id) = bucket.get("modelId").and_then(Value::as_str) else {
            continue;
        };
        let Some(remaining) = number(bucket.get("remainingFraction")) else {
            continue;
        };
        windows.insert(
            model_id.to_string(),
            QuotaWindow {
                key: model_id.to_string(),
                label: model_label(model_id),
                used_percent: (1.0 - remaining.clamp(0.0, 1.0)) * 100.0,
                resets_at: bucket
                    .get("resetTime")
                    .and_then(Value::as_str)
                    .map(str::to_string),
                unlimited: false,
                amount: None,
                paid: false,
            },
        );
    }
    if windows.is_empty() {
        return Err("Gemini returned no active quota windows.".to_string());
    }
    Ok(QuotaReading {
        source: "Gemini Code Assist API".to_string(),
        identity: None,
        windows: windows.into_values().collect(),
        reset_credits: None,
    })
}

fn project_id(value: Option<&Value>) -> Option<String> {
    match value? {
        Value::String(id) if !id.is_empty() => Some(id.clone()),
        Value::Object(project) => project
            .get("id")
            .and_then(Value::as_str)
            .filter(|id| !id.is_empty())
            .map(str::to_string),
        _ => None,
    }
}

fn plan_name(json: &Value) -> Option<String> {
    ["paidTier", "currentTier"]
        .iter()
        .find_map(|key| {
            json.get(*key)
                .and_then(|tier| text_value(tier, &["name", "displayName", "id", "tierId"]))
        })
        .map(|name| plan_label(&name))
}

fn plan_label(value: &str) -> String {
    let value = value.trim_end_matches("-tier");
    match value.to_lowercase().as_str() {
        "legacy" | "free" | "g1-free" => "Free".to_string(),
        "standard" => "Code Assist Standard".to_string(),
        "enterprise" => "Code Assist Enterprise".to_string(),
        "g1-pro" => "AI Pro".to_string(),
        "g1-ultra" => "AI Ultra".to_string(),
        _ => title_words(value),
    }
}

fn model_label(model_id: &str) -> String {
    title_words(model_id)
}

fn title_words(value: &str) -> String {
    value
        .split(['-', '_'])
        .filter(|word| !word.is_empty())
        .map(|word| {
            let mut chars = word.chars();
            match chars.next() {
                Some(first) => format!("{}{}", first.to_uppercase(), chars.as_str()),
                None => String::new(),
            }
        })
        .collect::<Vec<_>>()
        .join(" ")
}

fn text_value(json: &Value, keys: &[&str]) -> Option<String> {
    keys.iter()
        .find_map(|key| json.get(*key).and_then(Value::as_str))
        .filter(|value| !value.is_empty())
        .map(str::to_string)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn builds_the_google_authorization_url() {
        let pair = Pkce {
            verifier: "verifier".into(),
            challenge: "challenge".into(),
            state: "state-value".into(),
        };
        let url = authorize_url(&pair, "http://127.0.0.1:3210/oauth2callback");
        assert!(url.starts_with(AUTHORIZE_URL));
        assert!(url.contains(CLIENT_ID));
        assert!(url.contains("state=state-value"));
        assert!(url.contains("access_type=offline"));
        assert!(url.contains("prompt=consent"));
        assert!(!url.contains("code_challenge"));
    }

    #[test]
    fn reads_model_quota_buckets() {
        let reading = parse_usage(&json!({
            "buckets": [
                {
                    "modelId": "gemini-3.1-pro-preview",
                    "remainingFraction": 0.73,
                    "resetTime": "2026-08-27T00:00:00Z"
                },
                {
                    "modelId": "gemini-3-flash",
                    "remainingFraction": 1.4
                }
            ]
        }))
        .expect("quota");
        assert_eq!(reading.windows.len(), 2);
        assert_eq!(reading.windows[0].label, "Gemini 3 Flash");
        assert_eq!(reading.windows[0].used_percent, 0.0);
        assert_eq!(reading.windows[1].label, "Gemini 3.1 Pro Preview");
        assert!((reading.windows[1].used_percent - 27.0).abs() < 0.001);
        assert_eq!(
            reading.windows[1].resets_at.as_deref(),
            Some("2026-08-27T00:00:00Z")
        );
    }

    #[test]
    fn accepts_project_shapes_and_plan_ids() {
        assert_eq!(
            project_id(Some(&json!({ "id": "project-object" }))).as_deref(),
            Some("project-object")
        );
        assert_eq!(
            project_id(Some(&json!("project-string"))).as_deref(),
            Some("project-string")
        );
        assert_eq!(
            plan_name(&json!({ "currentTier": { "id": "free-tier" } })).as_deref(),
            Some("Free")
        );
        assert_eq!(
            plan_name(&json!({ "paidTier": { "id": "g1-ultra-tier" }, "currentTier": { "id": "standard-tier" } }))
                .as_deref(),
            Some("AI Ultra")
        );
        assert_eq!(
            plan_name(&json!({
                "paidTier": null,
                "currentTier": { "name": "Gemini Code Assist Standard" }
            }))
            .as_deref(),
            Some("Gemini Code Assist Standard")
        );
    }

    #[test]
    fn preserves_refresh_and_project_data() {
        let credentials = credentials_from(
            &json!({ "access_token": "new", "expires_in": 3600 }),
            Some("refresh".into()),
            Some("project".into()),
        )
        .expect("credentials");
        assert_eq!(credentials.refresh_token.as_deref(), Some("refresh"));
        assert_eq!(credentials.project_id.as_deref(), Some("project"));
    }
}
