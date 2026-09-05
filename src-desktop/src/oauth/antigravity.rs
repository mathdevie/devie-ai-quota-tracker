//! Beta Antigravity integration: browser OAuth and remote per-model quotas.
//!
//! Protocol reference: decolua/9router at 4eda76e2, OAuth provider and
//! open-sse/services/usage/google.js. These are internal Google endpoints;
//! the response does not guarantee separate five-hour and weekly limits.

use chrono::{Duration, Utc};
use serde_json::{json, Value};

use crate::{
    credentials::Credentials,
    model::{QuotaReading, QuotaWindow, RemoteIdentity},
    oauth::{claude::encode_query, gemini, LoginOutcome, Pkce},
    parse::{number, reset_time},
};

// Installed-application client published by 9router. This is distinct from
// Gemini CLI's client: their refresh tokens must never be interchanged.
const CLIENT_ID: &str = "1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com";
const CLIENT_SECRET: &str = "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";
const SCOPES: &str = "https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/cclog https://www.googleapis.com/auth/experimentsandconfigs";
const LOAD_URL: &str = "https://cloudcode-pa.googleapis.com/v1internal:loadCodeAssist";
const QUOTA_URL: &str = "https://daily-cloudcode-pa.googleapis.com/v1internal:fetchAvailableModels";
// Protocol compatibility headers used by the reference client.
const CLIENT_VERSION: &str = "2.11.0";
const CLIENT_USER_AGENT: &str = "antigravity/ide/2.11.0 darwin/arm64";
pub const CALLBACK_PATH: &str = "/callback";
pub const REFRESH_LEAD: Duration = Duration::minutes(5);

pub fn redirect_uri(port: u16) -> String {
    format!("http://localhost:{port}{CALLBACK_PATH}")
}

pub fn authorize_url(pair: &Pkce, redirect_uri: &str) -> String {
    let query = [
        ("client_id", CLIENT_ID),
        ("response_type", "code"),
        ("redirect_uri", redirect_uri),
        ("scope", SCOPES),
        ("state", pair.state.as_str()),
        ("access_type", "offline"),
        ("prompt", "consent"),
    ];
    format!("{}?{}", gemini::AUTHORIZE_URL, encode_query(&query))
}

pub async fn exchange(
    client: &reqwest::Client,
    pair: &Pkce,
    redirect_uri: &str,
    code: &str,
    state: Option<&str>,
) -> Result<LoginOutcome, String> {
    if state != Some(pair.state.as_str()) {
        return Err("The sign-in response does not match this session. Start again.".into());
    }
    let tokens = token_request(
        client,
        &[
            ("grant_type", "authorization_code"),
            ("code", code.trim()),
            ("redirect_uri", redirect_uri),
        ],
    )
    .await?;
    let mut credentials = credentials_from(&tokens, None)?;
    let (mut identity, account_key) = gemini::profile(client, &credentials.access_token).await?;
    // Account identity is valid even when Google's internal quota service is
    // unavailable. Save the login; the first refresh will show the quota error.
    if let Ok(info) = subscription(client, &credentials.access_token).await {
        credentials.project_id = project_id(&info);
        identity.plan = plan_name(&info);
    }
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
    let refresh = current
        .refresh_token
        .as_deref()
        .ok_or_else(|| "This Antigravity login cannot be renewed. Sign in again.".to_string())?;
    let tokens = token_request(
        client,
        &[("grant_type", "refresh_token"), ("refresh_token", refresh)],
    )
    .await?;
    credentials_from(&tokens, Some(current))
}

async fn token_request(client: &reqwest::Client, fields: &[(&str, &str)]) -> Result<Value, String> {
    let mut form = vec![("client_id", CLIENT_ID), ("client_secret", CLIENT_SECRET)];
    form.extend_from_slice(fields);
    let response = client
        .post(gemini::TOKEN_URL)
        .form(&form)
        .send()
        .await
        .map_err(|_| "Google could not be reached.".to_string())?;
    let status = response.status();
    if !status.is_success() {
        // Do not include token response bodies in UI errors or diagnostics.
        return Err(format!(
            "Antigravity token exchange failed (HTTP {}). Sign in again.",
            status.as_u16()
        ));
    }
    response
        .json()
        .await
        .map_err(|_| "Antigravity returned an invalid token response.".into())
}

fn credentials_from(tokens: &Value, current: Option<&Credentials>) -> Result<Credentials, String> {
    let access_token = tokens
        .get("access_token")
        .and_then(Value::as_str)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| "Antigravity returned no access token.".to_string())?
        .to_string();
    let refresh_token = tokens
        .get("refresh_token")
        .and_then(Value::as_str)
        .filter(|value| !value.is_empty())
        .map(str::to_string)
        .or_else(|| current.and_then(|c| c.refresh_token.clone()));
    if refresh_token.is_none() {
        return Err(
            "Antigravity returned no refresh token. Sign in again to allow offline access.".into(),
        );
    }
    Ok(Credentials {
        access_token,
        refresh_token,
        expires_at: number(tokens.get("expires_in"))
            .filter(|seconds| seconds.is_finite() && *seconds > 0.0 && *seconds <= 86400.0)
            .map(|seconds| Utc::now() + Duration::seconds(seconds as i64)),
        account_id: current.and_then(|c| c.account_id.clone()),
        project_id: current.and_then(|c| c.project_id.clone()),
    })
}

async fn api_post(
    client: &reqwest::Client,
    token: &str,
    url: &str,
    body: Value,
) -> Result<Value, String> {
    let response = client
        .post(url)
        .bearer_auth(token)
        .header(reqwest::header::USER_AGENT, CLIENT_USER_AGENT)
        .header("X-Client-Name", "antigravity")
        .header("X-Client-Version", CLIENT_VERSION)
        .json(&body)
        .send()
        .await
        .map_err(|_| "Antigravity could not be reached.".to_string())?;
    if let Some(error) = api_error(response.status()) {
        return Err(error);
    }
    response
        .json()
        .await
        .map_err(|_| "Antigravity returned invalid quota data.".into())
}

fn api_error(status: reqwest::StatusCode) -> Option<String> {
    match status.as_u16() {
        200..=299 => None,
        401 => Some("The Antigravity login expired. Sign in again.".into()),
        403 => Some("Antigravity quota access is unavailable for this account. The beta cannot read its limits.".into()),
        429 => Some("Antigravity quota requests are rate limited. Try again later.".into()),
        code => Some(format!("Antigravity quota request failed (HTTP {code}).")),
    }
}

async fn subscription(client: &reqwest::Client, token: &str) -> Result<Value, String> {
    api_post(
        client,
        token,
        LOAD_URL,
        json!({
            "metadata": { "ideType": 9, "platform": 2, "pluginType": 2 },
            "mode": 1,
        }),
    )
    .await
}

fn project_id(info: &Value) -> Option<String> {
    let project = info.get("cloudaicompanionProject")?;
    project
        .as_str()
        .or_else(|| project.get("id")?.as_str())
        .map(str::trim)
        .filter(|id| !id.is_empty())
        .map(str::to_string)
}

fn plan_name(info: &Value) -> Option<String> {
    ["paidTier", "currentTier"].iter().find_map(|tier| {
        info.get(*tier)?
            .get("name")?
            .as_str()
            .filter(|name| !name.trim().is_empty())
            .map(str::to_string)
    })
}

pub async fn usage(
    client: &reqwest::Client,
    credentials: &Credentials,
) -> Result<QuotaReading, String> {
    let info = subscription(client, &credentials.access_token).await?;
    let project = project_id(&info).or_else(|| credentials.project_id.clone());
    let body = project
        .map(|id| json!({ "project": id }))
        .unwrap_or_else(|| json!({}));
    let json = api_post(client, &credentials.access_token, QUOTA_URL, body).await?;
    let mut reading = parse_usage(&json)?;
    reading.identity = plan_name(&info).map(|plan| RemoteIdentity {
        plan: Some(plan),
        ..Default::default()
    });
    Ok(reading)
}

pub fn parse_usage(json: &Value) -> Result<QuotaReading, String> {
    let models = json
        .get("models")
        .and_then(Value::as_object)
        .ok_or_else(|| "Antigravity returned no quota data.".to_string())?;
    let mut windows = Vec::new();
    for (id, model) in models {
        if id.is_empty() || model.get("isInternal").and_then(Value::as_bool) == Some(true) {
            continue;
        }
        let Some(quota) = model.get("quotaInfo") else {
            continue;
        };
        // Missing, malformed, or out-of-range values are unknown, never 0% or
        // 100%. Do not fabricate request counts from a normalized percentage.
        let Some(remaining) = number(quota.get("remainingFraction"))
            .filter(|value| value.is_finite() && (0.0..=1.0).contains(value))
        else {
            continue;
        };
        windows.push(QuotaWindow {
            key: id.clone(),
            label: model
                .get("displayName")
                .and_then(Value::as_str)
                .filter(|name| !name.trim().is_empty())
                .unwrap_or(id)
                .to_string(),
            used_percent: (1.0 - remaining) * 100.0,
            resets_at: reset_time(quota.get("resetTime"))
                .filter(|time| chrono::DateTime::parse_from_rfc3339(time).is_ok()),
            ..Default::default()
        });
    }
    if windows.is_empty() {
        return Err(
            "Antigravity quota is unavailable. Google returned no usable limits for this account."
                .into(),
        );
    }
    Ok(QuotaReading {
        source: "Antigravity API (Beta)".into(),
        windows,
        identity: None,
        reset_credits: None,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn fetches_remote_quota_with_account_token_and_project() {
        use std::io::{BufRead, BufReader, Read, Write};
        use std::net::TcpListener;
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let url = format!(
            "http://{}/v1internal:fetchAvailableModels",
            listener.local_addr().unwrap()
        );
        let server = std::thread::spawn(move || {
            let (mut stream, _) = listener.accept().unwrap();
            stream
                .set_read_timeout(Some(std::time::Duration::from_secs(5)))
                .unwrap();
            let mut reader = BufReader::new(stream.try_clone().unwrap());
            let mut request = String::new();
            let mut length = 0;
            loop {
                let mut line = String::new();
                reader.read_line(&mut line).unwrap();
                if line == "\r\n" {
                    break;
                }
                if let Some(value) = line.to_lowercase().strip_prefix("content-length:") {
                    length = value.trim().parse::<usize>().unwrap();
                }
                request.push_str(&line);
            }
            let mut body = vec![0; length];
            reader.read_exact(&mut body).unwrap();
            assert!(request.starts_with("POST /v1internal:fetchAvailableModels "));
            assert!(request
                .to_lowercase()
                .contains("authorization: bearer account-token"));
            assert!(request
                .to_lowercase()
                .contains("x-client-name: antigravity"));
            assert_eq!(
                serde_json::from_slice::<Value>(&body).unwrap(),
                json!({"project": "account-project"})
            );
            let payload = json!({"models": {"gemini": {"quotaInfo": {"remainingFraction": 0.6}}}})
                .to_string();
            write!(stream, "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}", payload.len(), payload).unwrap();
        });
        let client = reqwest::Client::builder()
            .no_proxy()
            .timeout(std::time::Duration::from_secs(5))
            .build()
            .unwrap();
        let data = api_post(
            &client,
            "account-token",
            &url,
            json!({"project": "account-project"}),
        )
        .await
        .unwrap();
        assert_eq!(parse_usage(&data).unwrap().windows[0].used_percent, 40.0);
        server.join().unwrap();
    }

    #[test]
    fn parses_reported_model_quota_without_inventing_counts() {
        let reading = parse_usage(&json!({ "models": {
            "gemini-pro-agent": { "displayName": "Gemini Pro", "quotaInfo": {
                "remainingFraction": 0.75, "resetTime": "2026-09-06T12:00:00Z"
            }},
            "future-model": { "quotaInfo": { "remainingFraction": "0" } },
            "full-model": { "quotaInfo": { "remainingFraction": 1 } }
        }}))
        .unwrap();
        assert_eq!(reading.windows.len(), 3);
        let gemini = reading
            .windows
            .iter()
            .find(|w| w.key == "gemini-pro-agent")
            .unwrap();
        assert_eq!(gemini.label, "Gemini Pro");
        assert_eq!(gemini.used_percent, 25.0);
        assert_eq!(gemini.resets_at.as_deref(), Some("2026-09-06T12:00:00Z"));
        assert!(reading
            .windows
            .iter()
            .all(|w| w.amount.is_none() && !w.unlimited && !w.paid));
        assert_eq!(
            reading
                .windows
                .iter()
                .find(|w| w.key == "future-model")
                .unwrap()
                .used_percent,
            100.0
        );
        assert_eq!(
            reading
                .windows
                .iter()
                .find(|w| w.key == "full-model")
                .unwrap()
                .used_percent,
            0.0
        );
    }

    #[test]
    fn rejects_unknown_quota_instead_of_showing_exhausted_or_full() {
        for fraction in [
            Value::Null,
            json!("NaN"),
            json!("inf"),
            json!(true),
            json!(-0.1),
            json!(1.1),
            json!("bad"),
        ] {
            assert!(parse_usage(
                &json!({ "models": { "m": { "quotaInfo": { "remainingFraction": fraction } } } })
            )
            .is_err());
        }
        for payload in [
            json!({}),
            json!({"models": []}),
            json!({"models": {}}),
            json!({"models": {"available": {}}}),
            json!({"models": {"missing": {"quotaInfo": {}}}}),
            json!({"models": {"internal": {"isInternal": true, "quotaInfo": {"remainingFraction": 0.5}}}}),
        ] {
            assert!(parse_usage(&payload).is_err());
        }
    }

    #[test]
    fn skips_unknown_rows_and_invalid_reset_times() {
        let reading = parse_usage(&json!({ "models": {
            "known": { "quotaInfo": { "remainingFraction": 0.2, "resetTime": "tomorrow" } },
            "unknown": { "quotaInfo": { "resetTime": "2026-09-06T12:00:00Z" } }
        }}))
        .unwrap();
        assert_eq!(reading.windows.len(), 1);
        assert_eq!(reading.windows[0].used_percent, 80.0);
        assert!(reading.windows[0].resets_at.is_none());
    }

    #[test]
    fn refresh_preserves_account_and_project_and_rotates_tokens() {
        let mut current = credentials_from(
            &json!({"access_token": "old", "refresh_token": "refresh", "expires_in": 3600}),
            None,
        )
        .unwrap();
        current.project_id = Some("project".into());
        current.account_id = Some("account".into());
        let next = credentials_from(
            &json!({"access_token": "new", "expires_in": 3600}),
            Some(&current),
        )
        .unwrap();
        assert_eq!(next.refresh_token.as_deref(), Some("refresh"));
        assert_eq!(next.project_id, current.project_id);
        assert_eq!(next.account_id, current.account_id);
        assert!(next.expires_at.unwrap() > Utc::now());
        let rotated = credentials_from(
            &json!({"access_token": "new", "refresh_token": "rotated"}),
            Some(&current),
        )
        .unwrap();
        assert_eq!(rotated.refresh_token.as_deref(), Some("rotated"));
        assert!(credentials_from(&json!({"access_token": "new"}), None).is_err());
        assert!(credentials_from(&json!({"refresh_token": "refresh"}), None).is_err());
    }

    #[test]
    fn uses_distinct_oauth_client_and_offline_consent() {
        let pair = crate::oauth::pkce();
        let redirect = redirect_uri(12345);
        let url = reqwest::Url::parse(&authorize_url(&pair, &redirect)).unwrap();
        let query: std::collections::HashMap<_, _> = url.query_pairs().into_owned().collect();
        assert_eq!(query["client_id"], CLIENT_ID);
        assert_ne!(query["client_id"], gemini::CLIENT_ID);
        assert_eq!(query["state"], pair.state);
        assert_eq!(query["redirect_uri"], "http://localhost:12345/callback");
        assert_eq!(query["access_type"], "offline");
        assert_eq!(query["prompt"], "consent");
    }

    #[tokio::test]
    async fn rejects_missing_or_wrong_state_before_exchanging_tokens() {
        let client = reqwest::Client::new();
        let pair = crate::oauth::pkce();
        for state in [None, Some("wrong")] {
            let error = exchange(&client, &pair, &redirect_uri(12345), "code", state)
                .await
                .unwrap_err();
            assert!(error.contains("does not match"));
        }
    }

    #[test]
    fn reads_project_shapes_and_prefers_paid_plan() {
        assert_eq!(
            project_id(&json!({"cloudaicompanionProject": " project "})).as_deref(),
            Some("project")
        );
        assert_eq!(
            project_id(&json!({"cloudaicompanionProject": {"id": "project"}})).as_deref(),
            Some("project")
        );
        assert!(project_id(&json!({"cloudaicompanionProject": {}})).is_none());
        assert_eq!(
            plan_name(&json!({"paidTier": {"name": "AI Ultra"}, "currentTier": {"name": "Free"}}))
                .as_deref(),
            Some("AI Ultra")
        );
    }

    #[test]
    fn distinguishes_expired_login_from_unavailable_quota() {
        assert!(api_error(reqwest::StatusCode::UNAUTHORIZED)
            .unwrap()
            .contains("expired"));
        assert!(!api_error(reqwest::StatusCode::FORBIDDEN)
            .unwrap()
            .contains("expired"));
        assert!(api_error(reqwest::StatusCode::TOO_MANY_REQUESTS)
            .unwrap()
            .contains("rate limited"));
        assert!(api_error(reqwest::StatusCode::OK).is_none());
    }
}
