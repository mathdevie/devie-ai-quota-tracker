//! Codex (ChatGPT subscription) sign-in and quota reading.
//!
//! Uses the public Codex CLI OAuth client. The callback is fixed to
//! `http://localhost:1455/auth/callback`, which is what OpenAI allows for it.

use chrono::{Duration, Utc};
use serde_json::Value;

use crate::{
    credentials::Credentials,
    model::{QuotaReading, QuotaWindow, RemoteIdentity},
    oauth::{
        claude::{encode_query, title_case},
        decode_jwt_claims, describe_http_failure, LoginOutcome, Pkce, USER_AGENT,
    },
    providers::{number, reset_time},
};

pub const CLIENT_ID: &str = "app_EMoamEEZ73f0CkXaXp7hrann";
pub const AUTHORIZE_URL: &str = "https://auth.openai.com/oauth/authorize";
pub const TOKEN_URL: &str = "https://auth.openai.com/oauth/token";
pub const USAGE_URL: &str = "https://chatgpt.com/backend-api/wham/usage";
pub const SCOPE: &str = "openid profile email offline_access";
pub const CALLBACK_PORT: u16 = 1455;
pub const CALLBACK_PATH: &str = "/auth/callback";
/// Codex access tokens last hours; renew early like the CLI does.
pub const REFRESH_LEAD: Duration = Duration::minutes(30);

pub fn redirect_uri() -> String {
    format!("http://localhost:{CALLBACK_PORT}{CALLBACK_PATH}")
}

pub fn authorize_url(pkce: &Pkce, redirect_uri: &str) -> String {
    let query = [
        ("response_type", "code"),
        ("client_id", CLIENT_ID),
        ("redirect_uri", redirect_uri),
        ("scope", SCOPE),
        ("code_challenge", pkce.challenge.as_str()),
        ("code_challenge_method", "S256"),
        ("id_token_add_organizations", "true"),
        ("codex_cli_simplified_flow", "true"),
        ("originator", "codex_cli_rs"),
        ("state", pkce.state.as_str()),
    ];
    format!("{AUTHORIZE_URL}?{}", encode_query(&query))
}

pub async fn exchange(
    client: &reqwest::Client,
    pkce: &Pkce,
    redirect_uri: &str,
    code: &str,
    state: Option<&str>,
) -> Result<LoginOutcome, String> {
    if state.is_some_and(|value| value != pkce.state) {
        return Err("The sign-in response does not match this session. Start again.".to_string());
    }
    let tokens = post_form(
        client,
        &[
            ("grant_type", "authorization_code"),
            ("client_id", CLIENT_ID),
            ("code", code.trim()),
            ("redirect_uri", redirect_uri),
            ("code_verifier", pkce.verifier.as_str()),
        ],
    )
    .await?;
    let (credentials, identity, account_key) = interpret(&tokens, None)?;
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
        .ok_or_else(|| "This Codex login cannot be renewed. Sign in again.".to_string())?;
    let tokens = post_form(
        client,
        &[
            ("grant_type", "refresh_token"),
            ("client_id", CLIENT_ID),
            ("refresh_token", refresh_token),
            ("scope", "openid profile email"),
        ],
    )
    .await?;
    let (mut credentials, _, _) = interpret(&tokens, current.refresh_token.clone())?;
    if credentials.account_id.is_none() {
        credentials.account_id = current.account_id.clone();
    }
    Ok(credentials)
}

async fn post_form(client: &reqwest::Client, form: &[(&str, &str)]) -> Result<Value, String> {
    let response = client
        .post(TOKEN_URL)
        .header(reqwest::header::USER_AGENT, USER_AGENT)
        .header(reqwest::header::ACCEPT, "application/json")
        .form(form)
        .send()
        .await
        .map_err(|_| "OpenAI could not be reached.".to_string())?;
    let status = response.status();
    let text = response.text().await.unwrap_or_default();
    if !status.is_success() {
        return Err(describe_http_failure("Codex", status, &text));
    }
    serde_json::from_str(&text).map_err(|_| "Codex returned an invalid token response.".to_string())
}

/// Reads tokens and the identity claims from the id token.
fn interpret(
    tokens: &Value,
    fallback_refresh: Option<String>,
) -> Result<(Credentials, RemoteIdentity, String), String> {
    let access_token = tokens
        .get("access_token")
        .and_then(Value::as_str)
        .ok_or_else(|| "Codex returned no access token.".to_string())?
        .to_string();
    let refresh_token = tokens
        .get("refresh_token")
        .and_then(Value::as_str)
        .map(str::to_string)
        .or(fallback_refresh);
    let expires_at = number(tokens.get("expires_in"))
        .map(|seconds| Utc::now() + Duration::seconds(seconds as i64));

    let claims = tokens
        .get("id_token")
        .and_then(Value::as_str)
        .and_then(decode_jwt_claims)
        .or_else(|| decode_jwt_claims(&access_token))
        .unwrap_or(Value::Null);
    let auth = claims.get("https://api.openai.com/auth");
    let text = |value: Option<&Value>, key: &str| {
        value
            .and_then(|value| value.get(key))
            .and_then(Value::as_str)
            .map(str::to_string)
    };
    let account_id = text(auth, "chatgpt_account_id").or_else(|| text(Some(&claims), "account_id"));
    let plan = text(auth, "chatgpt_plan_type")
        .or_else(|| text(Some(&claims), "plan_type"))
        .map(|plan| title_case(&plan));
    let email = text(Some(&claims), "email");
    let account_key = account_id
        .clone()
        .or_else(|| email.clone())
        .unwrap_or_else(|| Utc::now().timestamp_millis().to_string());

    Ok((
        Credentials {
            access_token,
            refresh_token,
            expires_at,
            account_id: account_id.clone(),
        },
        RemoteIdentity {
            provider_user_id: account_id,
            display_name: email,
            plan,
        },
        account_key,
    ))
}

pub async fn usage(
    client: &reqwest::Client,
    credentials: &Credentials,
) -> Result<QuotaReading, String> {
    let mut request = client
        .get(USAGE_URL)
        .bearer_auth(&credentials.access_token)
        .header(reqwest::header::ACCEPT, "application/json")
        .header(reqwest::header::USER_AGENT, "codex_cli_rs/0.50.0")
        .header("originator", "codex_cli_rs");
    if let Some(account_id) = &credentials.account_id {
        request = request.header("ChatGPT-Account-ID", account_id);
    }
    let response = request
        .send()
        .await
        .map_err(|_| "ChatGPT could not be reached.".to_string())?;
    let status = response.status();
    if status.as_u16() == 401 || status.as_u16() == 403 {
        return Err("The Codex login expired. Sign in again.".to_string());
    }
    let text = response.text().await.unwrap_or_default();
    if !status.is_success() {
        return Err(describe_http_failure("Codex", status, &text));
    }
    let json: Value = serde_json::from_str(&text)
        .map_err(|_| "Codex returned invalid quota data.".to_string())?;
    parse_usage(&json)
}

pub fn parse_usage(json: &Value) -> Result<QuotaReading, String> {
    let limits = json
        .get("rate_limit")
        .or_else(|| json.get("rate_limits"))
        .and_then(Value::as_object)
        .ok_or_else(|| "Codex returned no rate limit data.".to_string())?;
    let mut windows = Vec::new();
    add_window(
        limits,
        &["primary_window", "primary"],
        "primary",
        "5-hour limit",
        &mut windows,
    );
    add_window(
        limits,
        &["secondary_window", "secondary"],
        "secondary",
        "Weekly limit",
        &mut windows,
    );
    if windows.is_empty() {
        return Err("Codex returned no active quota windows.".to_string());
    }
    let plan = json
        .get("plan_type")
        .and_then(Value::as_str)
        .map(title_case);
    Ok(QuotaReading {
        source: "ChatGPT subscription API".to_string(),
        identity: plan.map(|plan| RemoteIdentity {
            provider_user_id: None,
            display_name: None,
            plan: Some(plan),
        }),
        windows,
    })
}

fn add_window(
    limits: &serde_json::Map<String, Value>,
    keys: &[&str],
    key: &str,
    fallback_label: &str,
    windows: &mut Vec<QuotaWindow>,
) {
    let Some(window) = keys
        .iter()
        .find_map(|candidate| limits.get(*candidate).and_then(Value::as_object))
    else {
        return;
    };
    let Some(used) = number(
        window
            .get("used_percent")
            .or_else(|| window.get("percent_used")),
    ) else {
        return;
    };
    let label = number(window.get("limit_window_seconds"))
        .map(|seconds| seconds / 60.0)
        .or_else(|| number(window.get("window_minutes")))
        .map(|minutes| {
            if minutes >= 10_000.0 {
                "Weekly limit".to_string()
            } else if minutes >= 60.0 {
                format!("{}-hour limit", (minutes / 60.0).round())
            } else {
                fallback_label.to_string()
            }
        })
        .unwrap_or_else(|| fallback_label.to_string());
    windows.push(QuotaWindow {
        key: key.to_string(),
        label,
        used_percent: used.clamp(0.0, 100.0),
        resets_at: reset_time(
            window
                .get("reset_at")
                .or_else(|| window.get("resets_at"))
                .or_else(|| window.get("reset_after_seconds"))
                .filter(|value| !value.is_null()),
        )
        .and_then(|value| normalize_reset(value, window)),
    });
}

/// `reset_after_seconds` is relative; turn it into an absolute time.
fn normalize_reset(value: String, window: &serde_json::Map<String, Value>) -> Option<String> {
    if window.get("reset_at").is_some() || window.get("resets_at").is_some() {
        return Some(value);
    }
    let seconds = number(window.get("reset_after_seconds"))?;
    Some((Utc::now() + Duration::seconds(seconds as i64)).to_rfc3339())
}

#[cfg(test)]
mod tests {
    use super::*;
    use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};

    #[test]
    fn builds_the_codex_authorize_url() {
        let pkce = Pkce {
            verifier: "v".into(),
            challenge: "c".into(),
            state: "s".into(),
        };
        let url = authorize_url(&pkce, &redirect_uri());
        assert!(url.contains("client_id=app_EMoamEEZ73f0CkXaXp7hrann"));
        assert!(url.contains("redirect_uri=http%3A%2F%2Flocalhost%3A1455%2Fauth%2Fcallback"));
        assert!(url.contains("codex_cli_simplified_flow=true"));
    }

    #[test]
    fn reads_identity_from_the_id_token() {
        let claims = URL_SAFE_NO_PAD.encode(
            br#"{"email":"me@example.com","https://api.openai.com/auth":{"chatgpt_account_id":"acc-1","chatgpt_plan_type":"plus"}}"#,
        );
        let tokens: Value = serde_json::json!({
            "access_token": "a",
            "refresh_token": "r",
            "expires_in": 3600,
            "id_token": format!("h.{claims}.s"),
        });
        let (credentials, identity, key) = interpret(&tokens, None).expect("interpret");
        assert_eq!(credentials.account_id.as_deref(), Some("acc-1"));
        assert_eq!(identity.plan.as_deref(), Some("Plus"));
        assert_eq!(key, "acc-1");
    }

    #[test]
    fn parses_wham_usage() {
        let json: Value = serde_json::from_str(
            r#"{"plan_type":"pro","rate_limit":{"allowed":true,"limit_reached":false,
                "primary_window":{"used_percent":41,"limit_window_seconds":18000,"reset_at":1788000000},
                "secondary_window":{"used_percent":71,"limit_window_seconds":604800,"reset_at":1788400000}}}"#,
        )
        .expect("json");
        let reading = parse_usage(&json).expect("reading");
        assert_eq!(reading.windows[0].label, "5-hour limit");
        assert_eq!(reading.windows[1].used_percent, 71.0);
        assert_eq!(
            reading.identity.and_then(|value| value.plan).as_deref(),
            Some("Pro")
        );
    }
}
