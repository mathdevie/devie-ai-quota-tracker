//! Unofficial Antigravity integration: browser OAuth and remote per-model
//! quotas.
//!
//! Antigravity has no documented quota API and no published OAuth client.
//! The integration reproduces how the IDE reads the quota, and the provider
//! page shows a risk notice: Google may restrict or change this without
//! notice.
//!
//! Protocol reference: decolua/9router at 4eda76e2, OAuth provider and
//! open-sse/services/usage/google.js, plus the quota summary endpoint used by
//! CodexBar and Antigravity Manager. These are internal Google endpoints.
//!
//! The quota summary is what the IDE's Model Quota panel shows: two groups
//! (Gemini; Claude and GPT), each with a weekly and a five-hour limit. The
//! model catalog is the fallback; its per-model rows repeat the pooled limits.

use chrono::{Duration, Utc};
use serde_json::{json, Value};

use crate::{
    credentials::Credentials,
    model::{QuotaReading, QuotaWindow},
    oauth::{claude::encode_query, gemini, LoginOutcome, Pkce},
    parse::{number, reset_time},
};

// Google's own installed-application client, embedded in the closed-source
// Antigravity IDE and its CLI. Google did not publish it for reuse; the
// community extracted it and 9router and others copied it. Google treats the
// client secret of an installed application as non-confidential:
// <https://developers.google.com/identity/protocols/oauth2#installed>
// This is distinct from Gemini CLI's client: their refresh tokens must never
// be interchanged.
const CLIENT_ID: &str = "1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com";
const CLIENT_SECRET: &str = "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";
const SCOPES: &str = "https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/cclog https://www.googleapis.com/auth/experimentsandconfigs";
const LOAD_URL: &str = "https://cloudcode-pa.googleapis.com/v1internal:loadCodeAssist";
const SUMMARY_URL: &str =
    "https://daily-cloudcode-pa.googleapis.com/v1internal:retrieveUserQuotaSummary";
const QUOTA_URL: &str = "https://daily-cloudcode-pa.googleapis.com/v1internal:fetchAvailableModels";
// Protocol compatibility headers used by the reference client. The quota
// endpoint answers only requests that look like the IDE.
const CLIENT_VERSION: &str = "2.11.0";

fn user_agent() -> String {
    format!("antigravity/ide/{CLIENT_VERSION} darwin/arm64")
}
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
        credentials.project_id = gemini::project_id(info.get("cloudaicompanionProject"));
        identity.plan = gemini::plan_name(&info);
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
        // The caller adds the "sign in again" advice.
        return Err(format!(
            "Antigravity token exchange failed (HTTP {}).",
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

/// A failed Code Assist request. The status lets the caller tell a denied
/// or missing endpoint (worth a fallback) from a rate limit or an expired
/// login (not worth a second request).
#[derive(Debug)]
struct ApiError {
    status: Option<u16>,
    message: String,
}

impl From<ApiError> for String {
    fn from(error: ApiError) -> Self {
        error.message
    }
}

async fn api_post(
    client: &reqwest::Client,
    token: &str,
    url: &str,
    body: &Value,
) -> Result<Value, ApiError> {
    let response = client
        .post(url)
        .bearer_auth(token)
        .header(reqwest::header::USER_AGENT, user_agent())
        .header("X-Client-Name", "antigravity")
        .header("X-Client-Version", CLIENT_VERSION)
        .json(body)
        .send()
        .await
        .map_err(|_| ApiError {
            status: None,
            message: "Antigravity could not be reached.".into(),
        })?;
    let status = response.status();
    if let Some(message) = api_error(status) {
        return Err(ApiError {
            status: Some(status.as_u16()),
            message,
        });
    }
    response.json().await.map_err(|_| ApiError {
        status: Some(status.as_u16()),
        message: "Antigravity returned invalid quota data.".into(),
    })
}

/// A denied, missing, or broken summary is worth one try of the model
/// catalog. A rate limit or an expired login is not: the catalog shares
/// both, and the message must reach the caller as is.
fn try_catalog(error: &ApiError) -> bool {
    !matches!(error.status, Some(401 | 429))
}

fn api_error(status: reqwest::StatusCode) -> Option<String> {
    match status.as_u16() {
        200..=299 => None,
        401 => Some("The Antigravity login expired. Sign in again.".into()),
        403 => Some("Antigravity quota access is unavailable for this account. The unofficial integration cannot read its limits.".into()),
        429 => Some("Antigravity quota requests are rate limited. Try again later.".into()),
        code => Some(format!("Antigravity quota request failed (HTTP {code}).")),
    }
}

async fn subscription(client: &reqwest::Client, token: &str) -> Result<Value, String> {
    api_post(
        client,
        token,
        LOAD_URL,
        &json!({
            "metadata": { "ideType": 9, "platform": 2, "pluginType": 2 },
            "mode": 1,
        }),
    )
    .await
    .map_err(String::from)
}

pub async fn usage(
    client: &reqwest::Client,
    credentials: &Credentials,
) -> Result<QuotaReading, String> {
    let token = &credentials.access_token;
    // The login saves the project id and the plan. Ask loadCodeAssist only
    // when the login could not, so a read is normally one request.
    let project = match &credentials.project_id {
        Some(id) => Some(id.clone()),
        None => subscription(client, token)
            .await
            .ok()
            .and_then(|info| gemini::project_id(info.get("cloudaicompanionProject"))),
    };
    let body = project
        .map(|id| json!({ "project": id }))
        .unwrap_or_else(|| json!({}));
    // The summary is the grouped view the IDE shows. The model catalog is the
    // fallback when Google denies or empties the summary for this account.
    match api_post(client, token, SUMMARY_URL, &body).await {
        Ok(json) => {
            if let Ok(reading) = parse_summary(&json) {
                return Ok(reading);
            }
        }
        Err(error) if !try_catalog(&error) => return Err(error.message),
        Err(_) => {}
    }
    let json = api_post(client, token, QUOTA_URL, &body).await?;
    parse_usage(&json)
}

/// `parse::reset_time` passes unknown text through. A window needs a real
/// timestamp or none.
fn strict_reset_time(value: Option<&Value>) -> Option<String> {
    reset_time(value).filter(|time| chrono::DateTime::parse_from_rfc3339(time).is_ok())
}

/// Reads `retrieveUserQuotaSummary`: groups of buckets, one bucket per
/// window. Keys are the bucket ids (`gemini-5h`, `3p-weekly`). Labels follow
/// the Claude card and fit the popover: "Gemini (5h)", "Other (Weekly)".
pub fn parse_summary(json: &Value) -> Result<QuotaReading, String> {
    let groups = json
        .get("groups")
        .and_then(Value::as_array)
        .ok_or_else(|| "Antigravity returned no quota summary.".to_string())?;
    let mut windows = Vec::new();
    for group in groups {
        let group_name = group.get("displayName").and_then(Value::as_str);
        let Some(buckets) = group.get("buckets").and_then(Value::as_array) else {
            continue;
        };
        let mut lanes = Vec::new();
        for bucket in buckets {
            if bucket.get("disabled").and_then(Value::as_bool) == Some(true) {
                continue;
            }
            let Some(key) = bucket
                .get("bucketId")
                .and_then(Value::as_str)
                .map(str::trim)
                .filter(|key| !key.is_empty())
            else {
                continue;
            };
            let Some(remaining) = number(bucket.get("remainingFraction"))
                .filter(|value| value.is_finite() && (0.0..=1.0).contains(value))
            else {
                continue;
            };
            let (rank, window) = window_label(bucket, key);
            let label = format!("{} ({window})", pool_label(key, group_name));
            lanes.push((
                rank,
                QuotaWindow {
                    key: key.to_string(),
                    label,
                    used_percent: (1.0 - remaining) * 100.0,
                    resets_at: strict_reset_time(bucket.get("resetTime")),
                    ..Default::default()
                },
            ));
        }
        // Session first, then weekly, like the Claude card.
        lanes.sort_by_key(|(rank, _)| *rank);
        windows.extend(lanes.into_iter().map(|(_, window)| window));
    }
    if windows.is_empty() {
        return Err(
            "Antigravity quota is unavailable. Google returned no usable limits for this account."
                .into(),
        );
    }
    Ok(QuotaReading {
        source: "Antigravity API (Unofficial)".into(),
        windows,
        identity: None,
        reset_credits: None,
    })
}

/// The pool a bucket belongs to. The bucket id is stable across display
/// text changes: `gemini-*` is the Gemini pool, `3p-*` (third party) holds
/// Claude and GPT. An unknown pool keeps its shortened group name.
fn pool_label(key: &str, group_name: Option<&str>) -> String {
    let key = key.to_lowercase();
    if key.starts_with("gemini") {
        return "Gemini".to_string();
    }
    if key.starts_with("3p") {
        return "Other".to_string();
    }
    group_name
        .and_then(group_label)
        .unwrap_or_else(|| "Other".to_string())
}

/// "Gemini Models" -> "Gemini", "Claude and GPT models" -> "Claude & GPT".
fn group_label(name: &str) -> Option<String> {
    let name = name.trim();
    let lower = name.to_lowercase();
    let base = if lower == "models" {
        ""
    } else if lower.ends_with(" models") {
        name[..name.len() - " models".len()].trim_end()
    } else {
        name
    };
    let base = base.replace(" and ", " & ");
    (!base.is_empty()).then_some(base)
}

/// The window of a bucket, with a sort rank: the five-hour session first.
/// Read with the pool: "Gemini (5h)", "Gemini (Weekly)".
fn window_label(bucket: &Value, key: &str) -> (u8, String) {
    let window = bucket
        .get("window")
        .and_then(Value::as_str)
        .map(str::trim)
        .unwrap_or("");
    if window == "5h" || key.ends_with("-5h") {
        return (0, "5h".to_string());
    }
    if window == "weekly" || key.ends_with("-weekly") {
        return (1, "Weekly".to_string());
    }
    let label = bucket
        .get("displayName")
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|name| !name.is_empty())
        .unwrap_or(if window.is_empty() { key } else { window });
    (2, label.to_string())
}

/// Reads `fetchAvailableModels`, the model catalog. Every model repeats the
/// pooled limits of its group; entries without a display name are internal
/// routing aliases (tiered, tab) and are skipped.
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
        let Some(label) = model
            .get("displayName")
            .and_then(Value::as_str)
            .map(str::trim)
            .filter(|name| !name.is_empty())
        else {
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
            label: label.to_string(),
            used_percent: (1.0 - remaining) * 100.0,
            resets_at: strict_reset_time(quota.get("resetTime")),
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
        source: "Antigravity API (Unofficial)".into(),
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
            let payload = json!({"models": {"gemini": {
                "displayName": "Gemini", "quotaInfo": {"remainingFraction": 0.6}
            }}})
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
            &json!({"project": "account-project"}),
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
            "future-model": { "displayName": "Future", "quotaInfo": { "remainingFraction": "0" } },
            "full-model": { "displayName": "Full", "quotaInfo": { "remainingFraction": 1 } }
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
            assert!(parse_usage(&json!({ "models": { "m": {
                "displayName": "M", "quotaInfo": { "remainingFraction": fraction }
            } } }))
            .is_err());
        }
        for payload in [
            json!({}),
            json!({"models": []}),
            json!({"models": {}}),
            json!({"models": {"available": {}}}),
            json!({"models": {"missing": {"displayName": "M", "quotaInfo": {}}}}),
            json!({"models": {"internal": {"isInternal": true, "displayName": "I", "quotaInfo": {"remainingFraction": 0.5}}}}),
            // Catalog aliases without a display name: tiered routers, tab models.
            json!({"models": {"gemini-3.8-flash-tiered": {"quotaInfo": {"remainingFraction": 1, "resetTime": "2026-09-06T12:00:00Z"}}}}),
            json!({"models": {"tab_flash_lite_preview": {"displayName": " ", "quotaInfo": {"remainingFraction": 1}}}}),
        ] {
            assert!(parse_usage(&payload).is_err());
        }
    }

    #[test]
    fn reads_the_grouped_summary_as_four_windows() {
        // Shape observed on 2026-09-05 for a Google AI Pro account.
        let reading = parse_summary(&json!({
            "groups": [
                {
                    "displayName": "Gemini Models",
                    "description": "Models within this group: Gemini Flash, Gemini Pro",
                    "buckets": [
                        { "bucketId": "gemini-weekly", "displayName": "Weekly Limit Remaining",
                          "window": "weekly", "resetTime": "2026-09-12T14:14:14Z", "remainingFraction": 1 },
                        { "bucketId": "gemini-5h", "displayName": "Five Hour Limit Remaining",
                          "window": "5h", "resetTime": "2026-09-05T19:14:14Z", "remainingFraction": 0.4 }
                    ]
                },
                {
                    "displayName": "Claude and GPT models",
                    "buckets": [
                        { "bucketId": "3p-weekly", "window": "weekly",
                          "resetTime": "2026-09-12T14:14:14Z", "remainingFraction": 0.75 },
                        { "bucketId": "3p-5h", "window": "5h",
                          "resetTime": "2026-09-05T19:14:14Z", "remainingFraction": 1 }
                    ]
                }
            ],
            "description": "Within each group, models share a weekly limit and a 5-hour limit."
        }))
        .unwrap();
        assert_eq!(reading.source, "Antigravity API (Unofficial)");
        let rows: Vec<(&str, &str, f64, Option<&str>)> = reading
            .windows
            .iter()
            .map(|w| {
                (
                    w.key.as_str(),
                    w.label.as_str(),
                    w.used_percent,
                    w.resets_at.as_deref(),
                )
            })
            .collect();
        assert_eq!(
            rows,
            vec![
                (
                    "gemini-5h",
                    "Gemini (5h)",
                    60.0,
                    Some("2026-09-05T19:14:14Z")
                ),
                (
                    "gemini-weekly",
                    "Gemini (Weekly)",
                    0.0,
                    Some("2026-09-12T14:14:14Z")
                ),
                ("3p-5h", "Other (5h)", 0.0, Some("2026-09-05T19:14:14Z")),
                (
                    "3p-weekly",
                    "Other (Weekly)",
                    25.0,
                    Some("2026-09-12T14:14:14Z")
                ),
            ]
        );
        assert!(reading
            .windows
            .iter()
            .all(|w| w.amount.is_none() && !w.unlimited && !w.paid));
    }

    #[test]
    fn summary_skips_disabled_and_unknown_buckets_and_needs_one_window() {
        let reading = parse_summary(&json!({ "groups": [ { "displayName": "Custom", "buckets": [
            { "bucketId": "custom-5h", "remainingFraction": 0.5, "disabled": true },
            { "bucketId": "custom-weekly", "remainingFraction": "NaN" },
            { "bucketId": "", "remainingFraction": 0.5 },
            { "remainingFraction": 0.5 },
            { "bucketId": "custom-daily", "displayName": "Daily Limit Remaining",
              "window": "daily", "remainingFraction": 0.9, "resetTime": "soon" },
            { "bucketId": "custom-5h-b", "window": "5h", "remainingFraction": 0.2 }
        ] } ] }))
        .unwrap();
        let rows: Vec<(&str, &str)> = reading
            .windows
            .iter()
            .map(|w| (w.key.as_str(), w.label.as_str()))
            .collect();
        assert_eq!(
            rows,
            vec![
                ("custom-5h-b", "Custom (5h)"),
                ("custom-daily", "Custom (Daily Limit Remaining)"),
            ]
        );
        assert!(reading.windows[1].resets_at.is_none());
        for payload in [
            json!({}),
            json!({"groups": []}),
            json!({"groups": [{"displayName": "Gemini Models"}]}),
            json!({"groups": [{"displayName": "Gemini Models", "buckets": []}]}),
            json!({"groups": [{"buckets": [{"bucketId": "gemini-5h", "remainingFraction": 1.5}]}]}),
        ] {
            assert!(parse_summary(&payload).is_err());
        }
    }

    #[test]
    fn names_pools_from_bucket_ids_before_group_text() {
        // The bucket id wins over a renamed group; unknown ids use the group.
        assert_eq!(pool_label("gemini-5h", Some("Google Models")), "Gemini");
        assert_eq!(
            pool_label("3p-weekly", Some("Claude and GPT models")),
            "Other"
        );
        assert_eq!(pool_label("3p-weekly", None), "Other");
        assert_eq!(pool_label("imagen-5h", Some("Imagen models")), "Imagen");
        assert_eq!(pool_label("x-5h", None), "Other");
        assert_eq!(group_label("Gemini Models").as_deref(), Some("Gemini"));
        assert_eq!(
            group_label("Claude and GPT models").as_deref(),
            Some("Claude & GPT")
        );
        assert_eq!(group_label("Imagen").as_deref(), Some("Imagen"));
        assert!(group_label(" models").is_none());
        let reading = parse_summary(&json!({ "groups": [ { "buckets": [
            { "bucketId": "3p-weekly", "remainingFraction": 1 }
        ] } ] }))
        .unwrap();
        assert_eq!(reading.windows[0].label, "Other (Weekly)");
    }

    #[test]
    fn skips_unknown_rows_and_invalid_reset_times() {
        let reading = parse_usage(&json!({ "models": {
            "known": { "displayName": "Known", "quotaInfo": { "remainingFraction": 0.2, "resetTime": "tomorrow" } },
            "unknown": { "displayName": "Unknown", "quotaInfo": { "resetTime": "2026-09-06T12:00:00Z" } }
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
    fn falls_back_to_the_catalog_only_when_it_can_help() {
        let error = |status| ApiError {
            status,
            message: String::new(),
        };
        assert!(try_catalog(&error(Some(403))));
        assert!(try_catalog(&error(Some(404))));
        assert!(try_catalog(&error(Some(500))));
        assert!(try_catalog(&error(None)));
        assert!(!try_catalog(&error(Some(401))));
        assert!(!try_catalog(&error(Some(429))));
        assert_eq!(
            user_agent(),
            format!("antigravity/ide/{CLIENT_VERSION} darwin/arm64")
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
