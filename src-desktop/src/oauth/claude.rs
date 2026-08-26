//! Claude subscription sign-in and quota reading.
//!
//! Uses the public Claude Code OAuth client. The authorization code flow with
//! PKCE redirects to `http://localhost:54545/callback`, which is the port the
//! Claude Code CLI listens on. The user can also paste the code shown on the
//! Anthropic page if the browser cannot reach the app.

use std::{
    collections::HashMap,
    sync::{Arc, Mutex, OnceLock},
    time::{Duration as StdDuration, Instant},
};

use chrono::{Duration, Utc};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};

use crate::{
    credentials::Credentials,
    model::{QuotaReading, QuotaWindow, RemoteIdentity},
    oauth::{describe_http_failure, LoginOutcome, Pkce, USER_AGENT},
    parse::{number, reset_time},
};

pub const CLIENT_ID: &str = "9d1c250a-e61b-44d9-88ed-5944d1962f5e";
pub const AUTHORIZE_URL: &str = "https://claude.ai/oauth/authorize";
pub const TOKEN_URL: &str = "https://api.anthropic.com/v1/oauth/token";
pub const USAGE_URL: &str = "https://api.anthropic.com/api/oauth/usage";
pub const PROFILE_URL: &str = "https://api.anthropic.com/api/oauth/profile";
pub const SCOPES: &str = "org:create_api_key user:profile user:inference";
pub const CALLBACK_PORT: u16 = 54545;
pub const CALLBACK_PATH: &str = "/callback";
const ANTHROPIC_VERSION: &str = "2023-06-01";
const OAUTH_BETA: &str = "oauth-2025-04-20";
/// Refresh when less than this remains, as the Claude CLI does.
pub const REFRESH_LEAD: Duration = Duration::hours(4);
/// A usage read stays fresh this long. Same value as 9router.
const USAGE_CACHE_TTL: StdDuration = StdDuration::from_secs(300);
/// After a 429 the usage endpoint rests this long. Same value as 9router.
const RATE_LIMIT_COOLDOWN: StdDuration = StdDuration::from_secs(180);

/// One cache slot per access token.
#[derive(Default)]
struct UsageSlot {
    last_good: Option<QuotaReading>,
    fresh_until: Option<Instant>,
    cooldown_until: Option<Instant>,
    identity: Option<RemoteIdentity>,
    /// Held while one request is in flight so callers wait instead of
    /// sending a second request for the same token.
    in_flight: Arc<tokio::sync::Mutex<()>>,
}

fn usage_cache() -> &'static Mutex<HashMap<String, UsageSlot>> {
    static CACHE: OnceLock<Mutex<HashMap<String, UsageSlot>>> = OnceLock::new();
    CACHE.get_or_init(Mutex::default)
}

fn cache_key(access_token: &str) -> String {
    let digest = Sha256::digest(access_token.as_bytes());
    digest.iter().map(|byte| format!("{byte:02x}")).collect()
}

fn with_slot<T>(key: &str, action: impl FnOnce(&mut UsageSlot) -> T) -> T {
    let mut cache = usage_cache()
        .lock()
        .unwrap_or_else(|poison| poison.into_inner());
    action(cache.entry(key.to_string()).or_default())
}

/// Reads the quota through the shared cache, like 9router's `getClaudeUsage`:
/// - a fresh read is served from memory unless `force` is set;
/// - one request per token is in flight at a time, others wait for it;
/// - after a 429 the endpoint rests, and the last good read is served;
/// - a network or server error also falls back to the last good read;
/// - an expired login is always reported, never masked by old data.
pub async fn cached_usage(
    client: &reqwest::Client,
    access_token: &str,
    force: bool,
) -> Result<QuotaReading, String> {
    let key = cache_key(access_token);
    let now = Instant::now();
    if !force {
        if let Some(reading) = with_slot(&key, |slot| {
            slot.fresh_until
                .filter(|until| *until > now)
                .and(slot.last_good.clone())
        }) {
            return Ok(stale_copy(&reading));
        }
    }

    let gate = with_slot(&key, |slot| slot.in_flight.clone());
    let _guard = gate.lock().await;
    // The request we waited for may have filled the cache.
    let (fresh, cooling, last_good) = with_slot(&key, |slot| {
        let now = Instant::now();
        (
            slot.fresh_until.is_some_and(|until| until > now),
            slot.cooldown_until.is_some_and(|until| until > now),
            slot.last_good.clone(),
        )
    });
    if let Some(reading) = last_good.as_ref().filter(|_| (fresh && !force) || cooling) {
        return Ok(stale_copy(reading));
    }
    if cooling {
        return Err(
            "Anthropic rate-limited the quota request. Try again in a few minutes.".to_string(),
        );
    }

    match usage(client, access_token).await {
        Ok(mut reading) => {
            let identity = match with_slot(&key, |slot| slot.identity.clone()) {
                Some(identity) => identity,
                None => {
                    let (identity, _) = profile(client, access_token).await;
                    identity
                }
            };
            reading.identity = Some(identity.clone());
            with_slot(&key, |slot| {
                slot.identity = Some(identity);
                slot.last_good = Some(reading.clone());
                slot.fresh_until = Some(Instant::now() + USAGE_CACHE_TTL);
                slot.cooldown_until = None;
            });
            Ok(reading)
        }
        Err(UsageError::Expired(message)) => {
            with_slot(&key, |slot| {
                slot.last_good = None;
                slot.fresh_until = None;
                slot.identity = None;
            });
            Err(message)
        }
        Err(UsageError::RateLimited(message)) => {
            let last_good = with_slot(&key, |slot| {
                slot.cooldown_until = Some(Instant::now() + RATE_LIMIT_COOLDOWN);
                slot.last_good.clone()
            });
            last_good.map(|reading| stale_copy(&reading)).ok_or(message)
        }
        Err(UsageError::Other(message)) => {
            let last_good = with_slot(&key, |slot| slot.last_good.clone());
            last_good.map(|reading| stale_copy(&reading)).ok_or(message)
        }
    }
}

fn stale_copy(reading: &QuotaReading) -> QuotaReading {
    let mut copy = reading.clone();
    if !copy.source.ends_with("(cached)") {
        copy.source = format!("{} (cached)", copy.source);
    }
    copy
}

enum UsageError {
    Expired(String),
    RateLimited(String),
    Other(String),
}

impl From<UsageError> for String {
    fn from(error: UsageError) -> Self {
        match error {
            UsageError::Expired(message)
            | UsageError::RateLimited(message)
            | UsageError::Other(message) => message,
        }
    }
}

pub fn redirect_uri() -> String {
    format!("http://localhost:{CALLBACK_PORT}{CALLBACK_PATH}")
}

pub fn authorize_url(pkce: &Pkce, redirect_uri: &str) -> String {
    let query = [
        ("code", "true"),
        ("client_id", CLIENT_ID),
        ("response_type", "code"),
        ("redirect_uri", redirect_uri),
        ("scope", SCOPES),
        ("code_challenge", pkce.challenge.as_str()),
        ("code_challenge_method", "S256"),
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
    // A pasted code may carry the state after a `#`.
    let (code, embedded_state) = code.split_once('#').unwrap_or((code, ""));
    let state = if embedded_state.is_empty() {
        state.unwrap_or(pkce.state.as_str())
    } else {
        embedded_state
    };
    if state != pkce.state {
        return Err("The sign-in response does not match this session. Start again.".to_string());
    }
    let tokens = post_json(
        client,
        &json!({
            "grant_type": "authorization_code",
            "client_id": CLIENT_ID,
            "code": code.trim(),
            "state": state,
            "redirect_uri": redirect_uri,
            "code_verifier": pkce.verifier,
        }),
    )
    .await?;
    let credentials = credentials_from(&tokens, None)?;
    let (identity, account_key) = profile(client, &credentials.access_token).await;
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
        .ok_or_else(|| "This Claude login cannot be renewed. Sign in again.".to_string())?;
    let tokens = post_json(
        client,
        &json!({
            "grant_type": "refresh_token",
            "client_id": CLIENT_ID,
            "refresh_token": refresh_token,
        }),
    )
    .await?;
    credentials_from(&tokens, current.refresh_token.clone())
}

async fn post_json(client: &reqwest::Client, body: &Value) -> Result<Value, String> {
    let response = client
        .post(TOKEN_URL)
        .header(reqwest::header::USER_AGENT, USER_AGENT)
        .json(body)
        .send()
        .await
        .map_err(|_| "Anthropic could not be reached.".to_string())?;
    let status = response.status();
    let text = response.text().await.unwrap_or_default();
    if !status.is_success() {
        return Err(describe_http_failure("Claude", status, &text));
    }
    serde_json::from_str(&text)
        .map_err(|_| "Claude returned an invalid token response.".to_string())
}

fn credentials_from(
    tokens: &Value,
    fallback_refresh: Option<String>,
) -> Result<Credentials, String> {
    let access_token = tokens
        .get("access_token")
        .and_then(Value::as_str)
        .ok_or_else(|| "Claude returned no access token.".to_string())?
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
        project_id: None,
    })
}

async fn profile(client: &reqwest::Client, access_token: &str) -> (RemoteIdentity, String) {
    let response = client
        .get(PROFILE_URL)
        .bearer_auth(access_token)
        .header("anthropic-beta", OAUTH_BETA)
        .header("anthropic-version", ANTHROPIC_VERSION)
        .header(reqwest::header::USER_AGENT, USER_AGENT)
        .send()
        .await;
    let json = match response {
        Ok(response) if response.status().is_success() => {
            response.json::<Value>().await.unwrap_or(Value::Null)
        }
        _ => Value::Null,
    };
    let identity = parse_profile(&json);
    let key = identity
        .provider_user_id
        .clone()
        .or_else(|| identity.display_name.clone())
        .unwrap_or_else(|| Utc::now().timestamp_millis().to_string());
    (identity, key)
}

fn parse_profile(json: &Value) -> RemoteIdentity {
    let account = json.get("account");
    let organization = json.get("organization");
    let text = |value: Option<&Value>, key: &str| {
        value
            .and_then(|value| value.get(key))
            .and_then(Value::as_str)
            .map(str::to_string)
    };
    RemoteIdentity {
        provider_user_id: text(account, "uuid").or_else(|| text(account, "id")),
        display_name: text(account, "email")
            .or_else(|| text(account, "display_name"))
            .or_else(|| text(account, "full_name")),
        plan: text(organization, "rate_limit_tier")
            .map(|tier| tier_label(&tier))
            .or_else(|| text(organization, "billing_type").map(|value| title_case(&value)))
            .or_else(|| text(organization, "organization_type").map(|value| title_case(&value))),
    }
}

pub fn tier_label(tier: &str) -> String {
    // Examples: `default_claude_max_5x`, `default_claude_pro`.
    let lower = tier.to_lowercase();
    if lower.contains("max_20x") {
        "Max 20x".to_string()
    } else if lower.contains("max_5x") {
        "Max 5x".to_string()
    } else if lower.contains("max") {
        "Max".to_string()
    } else if lower.contains("pro") {
        "Pro".to_string()
    } else if lower.contains("team") {
        "Team".to_string()
    } else if lower.contains("enterprise") {
        "Enterprise".to_string()
    } else {
        title_case(tier)
    }
}

async fn usage(client: &reqwest::Client, access_token: &str) -> Result<QuotaReading, UsageError> {
    let response = client
        .get(USAGE_URL)
        .bearer_auth(access_token)
        .header("anthropic-beta", OAUTH_BETA)
        .header("anthropic-version", ANTHROPIC_VERSION)
        .header(reqwest::header::USER_AGENT, USER_AGENT)
        .send()
        .await
        .map_err(|_| UsageError::Other("Anthropic could not be reached.".to_string()))?;
    let status = response.status();
    if status.as_u16() == 401 || status.as_u16() == 403 {
        return Err(UsageError::Expired(
            "The Claude login expired. Sign in again.".to_string(),
        ));
    }
    if status.as_u16() == 429 {
        return Err(UsageError::RateLimited(
            "Anthropic rate-limited the quota request. Try again in a few minutes.".to_string(),
        ));
    }
    let text = response.text().await.unwrap_or_default();
    if !status.is_success() {
        return Err(UsageError::Other(describe_http_failure(
            "Claude", status, &text,
        )));
    }
    let json: Value = serde_json::from_str(&text)
        .map_err(|_| UsageError::Other("Claude returned invalid quota data.".to_string()))?;
    parse_usage(&json).map_err(UsageError::Other)
}

pub fn parse_usage(json: &Value) -> Result<QuotaReading, String> {
    let object = json
        .as_object()
        .ok_or_else(|| "Claude returned invalid quota data.".to_string())?;
    let mut windows = Vec::new();
    add_window(object, "five_hour", "Session (5h)", &mut windows);
    add_window(object, "seven_day", "Weekly", &mut windows);
    let mut model_keys = object
        .keys()
        .filter(|key| key.starts_with("seven_day_") && *key != "seven_day")
        .cloned()
        .collect::<Vec<_>>();
    model_keys.sort();
    for key in model_keys {
        let model = key.trim_start_matches("seven_day_");
        add_window(
            object,
            &key,
            &format!("{} (weekly)", title_case(model)),
            &mut windows,
        );
    }
    if windows.is_empty() {
        return Err("Claude returned no active quota windows.".to_string());
    }
    Ok(QuotaReading {
        source: "Claude subscription API".to_string(),
        identity: None,
        windows,
        reset_credits: None,
    })
}

fn add_window(
    object: &serde_json::Map<String, Value>,
    key: &str,
    label: &str,
    windows: &mut Vec<QuotaWindow>,
) {
    let Some(window) = object.get(key).and_then(Value::as_object) else {
        return;
    };
    let Some(used) = number(window.get("utilization")) else {
        return;
    };
    windows.push(QuotaWindow {
        key: key.to_string(),
        label: label.to_string(),
        used_percent: used.clamp(0.0, 100.0),
        resets_at: reset_time(window.get("resets_at")),
    });
}

pub fn encode_query(pairs: &[(&str, &str)]) -> String {
    pairs
        .iter()
        .map(|(key, value)| format!("{key}={}", encode_component(value)))
        .collect::<Vec<_>>()
        .join("&")
}

pub fn encode_component(value: &str) -> String {
    let mut output = String::with_capacity(value.len());
    for byte in value.bytes() {
        match byte {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                output.push(byte as char)
            }
            _ => output.push_str(&format!("%{byte:02X}")),
        }
    }
    output
}

pub fn title_case(value: &str) -> String {
    value
        .split(['-', '_', ' '])
        .filter(|part| !part.is_empty())
        .map(|part| {
            let mut characters = part.chars();
            characters
                .next()
                .map(|first| first.to_uppercase().collect::<String>() + characters.as_str())
                .unwrap_or_default()
        })
        .collect::<Vec<_>>()
        .join(" ")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn builds_the_claude_code_authorize_url() {
        let pkce = Pkce {
            verifier: "v".into(),
            challenge: "c+/".into(),
            state: "s".into(),
        };
        let url = authorize_url(&pkce, &redirect_uri());
        assert!(url.starts_with("https://claude.ai/oauth/authorize?code=true&client_id=9d1c250a"));
        assert!(url.contains("redirect_uri=http%3A%2F%2Flocalhost%3A54545%2Fcallback"));
        assert!(url.contains("code_challenge=c%2B%2F"));
        assert!(url.contains("scope=org%3Acreate_api_key%20user%3Aprofile%20user%3Ainference"));
    }

    #[test]
    fn parses_usage_windows_with_model_limits() {
        let json: Value = serde_json::from_str(
            r#"{"five_hour":{"utilization":37.5,"resets_at":"2026-08-25T15:00:00Z"},
                "seven_day":{"utilization":61,"resets_at":"2026-08-29T07:00:00Z"},
                "seven_day_opus":{"utilization":12,"resets_at":null},
                "extra_usage":null}"#,
        )
        .expect("json");
        let reading = parse_usage(&json).expect("reading");
        assert_eq!(reading.windows.len(), 3);
        assert_eq!(reading.windows[0].used_percent, 37.5);
        assert_eq!(reading.windows[2].label, "Opus (weekly)");
    }

    #[test]
    fn parses_fable_weekly_limit() {
        let json: Value = serde_json::from_str(
            r#"{"five_hour":{"utilization":10,"resets_at":null},
                "seven_day":{"utilization":20,"resets_at":"2026-08-30T07:00:00Z"},
                "seven_day_fable":{"utilization":36,"resets_at":"2026-08-30T07:00:00Z"}}"#,
        )
        .expect("json");
        let reading = parse_usage(&json).expect("reading");
        let fable = reading
            .windows
            .iter()
            .find(|window| window.key == "seven_day_fable")
            .expect("Fable window");
        assert_eq!(fable.label, "Fable (weekly)");
        assert_eq!(fable.used_percent, 36.0);
    }

    #[test]
    fn parses_profile_identity() {
        let json: Value = serde_json::from_str(
            r#"{"account":{"uuid":"u-1","email":"me@example.com"},
                "organization":{"name":"Me","rate_limit_tier":"default_claude_max_5x"}}"#,
        )
        .expect("json");
        let identity = parse_profile(&json);
        assert_eq!(identity.display_name.as_deref(), Some("me@example.com"));
        assert_eq!(identity.plan.as_deref(), Some("Max 5x"));
    }
}
