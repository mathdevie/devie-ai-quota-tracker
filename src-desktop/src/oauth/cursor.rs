//! Cursor sign-in and quota reading. No public OAuth client: the desktop
//! app's PKCE deep link (`cursor.com/loginDeepControl`, polled on
//! `api2.cursor.sh/auth/poll`) is reproduced, undocumented as it is. Quota
//! comes from the `cursor.com` dashboard endpoints with the token as the
//! `WorkosCursorSessionToken` cookie, with IDE Connect JSON and enterprise
//! usage fallbacks matching 9router. There is no known token renewal route.

use super::{error, ErrorKind, ProviderError};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use sha2::{Digest, Sha256};

use std::time::Duration as StdDuration;

use chrono::{DateTime, Duration, TimeZone, Utc};
use serde_json::Value;

use crate::{
    credentials::Credentials,
    model::{QuotaAmount, QuotaReading, QuotaWindow, RemoteIdentity},
    oauth::{
        claude::{encode_query, title_case},
        decode_jwt_claims, describe_http_failure, LoginOutcome, Pkce, USER_AGENT,
    },
    parse::{number, reset_time},
};

pub const LOGIN_URL: &str = "https://cursor.com/loginDeepControl";
pub const POLL_URL: &str = "https://api2.cursor.sh/auth/poll";
pub const USAGE_SUMMARY_URL: &str = "https://cursor.com/api/usage-summary";
pub const ME_URL: &str = "https://cursor.com/api/auth/me";
/// The desktop app sends this origin; the poll endpoint expects a client.
const APP_ORIGIN: &str = "vscode-file://vscode-app";
const POLL_INTERVAL: StdDuration = StdDuration::from_secs(2);

/// One deep-link sign-in: the PKCE pair and the request id the poll uses.
#[derive(Clone, Debug)]
pub struct DeepLogin {
    pub pkce: Pkce,
    pub uuid: String,
}

pub fn deep_login(pkce: Pkce) -> DeepLogin {
    DeepLogin {
        pkce,
        uuid: uuid::Uuid::new_v4().to_string(),
    }
}

pub fn authorize_url(login: &DeepLogin) -> String {
    let query = [
        ("challenge", login.pkce.challenge.as_str()),
        ("uuid", login.uuid.as_str()),
        ("mode", "login"),
    ];
    format!("{LOGIN_URL}?{}", encode_query(&query))
}

/// Polls Cursor until the user confirms the sign-in, or the wait times out.
pub async fn wait_for_login(
    client: &reqwest::Client,
    login: &DeepLogin,
) -> Result<LoginOutcome, String> {
    let deadline = tokio::time::Instant::now() + super::LOGIN_TIMEOUT;
    loop {
        if tokio::time::Instant::now() >= deadline {
            return Err("The Cursor sign-in timed out. Start again.".to_string());
        }
        tokio::time::sleep(POLL_INTERVAL).await;
        let response = client
            .get(POLL_URL)
            .query(&[
                ("uuid", login.uuid.as_str()),
                ("verifier", login.pkce.verifier.as_str()),
            ])
            .header(reqwest::header::ACCEPT, "application/json")
            .header(reqwest::header::USER_AGENT, USER_AGENT)
            .header(reqwest::header::ORIGIN, APP_ORIGIN)
            .send()
            .await
            .map_err(|_| "Cursor could not be reached.".to_string())?;
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        // 404 means "not confirmed yet". Other failures end the sign-in.
        if status.as_u16() == 404 {
            continue;
        }
        if !status.is_success() {
            return Err(describe_http_failure("Cursor", status, &text));
        }
        let json: Value = serde_json::from_str(&text)
            .map_err(|_| "Cursor returned an invalid sign-in response.".to_string())?;
        if json.get("accessToken").and_then(Value::as_str).is_none() {
            // Some responses are 200 with an empty body while pending.
            continue;
        }
        return interpret(&json);
    }
}

/// Reads the tokens and the identity claims from the access token.
fn interpret(tokens: &Value) -> Result<LoginOutcome, String> {
    let access_token = tokens
        .get("accessToken")
        .and_then(Value::as_str)
        .ok_or_else(|| "Cursor returned no access token.".to_string())?
        .to_string();
    let refresh_token = tokens
        .get("refreshToken")
        .and_then(Value::as_str)
        .map(str::to_string);
    let claims = decode_jwt_claims(&access_token).unwrap_or(Value::Null);
    let user_id = user_id_from_claims(&claims)
        .or_else(|| {
            tokens
                .get("userId")
                .and_then(Value::as_str)
                .map(str::to_string)
        })
        .ok_or_else(|| "Cursor returned a token without a user id.".to_string())?;
    let email = claims
        .get("email")
        .and_then(Value::as_str)
        .map(str::to_string);
    let expires_at =
        number(claims.get("exp")).and_then(|seconds| Utc.timestamp_opt(seconds as i64, 0).single());
    Ok(LoginOutcome {
        credentials: Credentials {
            access_token,
            refresh_token,
            expires_at,
            account_id: Some(user_id.clone()),
            project_id: None,
            last_refresh_at: None,
        },
        identity: RemoteIdentity {
            provider_user_id: Some(user_id.clone()),
            display_name: email,
            plan: None,
        },
        account_key: user_id,
    })
}

/// `sub` is `auth0|user_xxx`; the dashboard wants the part after the bar.
fn user_id_from_claims(claims: &Value) -> Option<String> {
    let subject = claims.get("sub")?.as_str()?;
    let user_id = subject.rsplit('|').next()?.trim();
    let valid = !user_id.is_empty()
        && user_id
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '.' | '_' | '-'));
    valid.then(|| user_id.to_string())
}

/// The session cookie the dashboard expects: `<user id>::<access token>`.
pub fn cookie_header(credentials: &Credentials) -> Result<String, String> {
    let user_id = credentials
        .account_id
        .clone()
        .or_else(|| {
            decode_jwt_claims(&credentials.access_token).and_then(|c| user_id_from_claims(&c))
        })
        .ok_or_else(|| "The Cursor login is incomplete. Sign in again.".to_string())?;
    Ok(format!(
        "WorkosCursorSessionToken={user_id}%3A%3A{}",
        credentials.access_token
    ))
}

async fn dashboard_json(
    client: &reqwest::Client,
    url: &str,
    cookie: &str,
    _invalid: &str,
) -> Result<Value, ProviderError> {
    error::json(
        client
            .get(url)
            .header(reqwest::header::ACCEPT, "application/json")
            .header(reqwest::header::USER_AGENT, USER_AGENT)
            .header(reqwest::header::COOKIE, cookie),
        "Cursor",
    )
    .await
}

async fn dashboard_usage(
    client: &reqwest::Client,
    credentials: &Credentials,
) -> Result<QuotaReading, ProviderError> {
    let cookie = cookie_header(credentials)?;
    let summary = dashboard_json(
        client,
        USAGE_SUMMARY_URL,
        &cookie,
        "Cursor returned invalid quota data.",
    )
    .await?;
    let mut reading = parse_usage_summary(&summary)?;
    // The profile is a bonus. A failure must not hide the quota.
    if let Ok(me) = dashboard_json(client, ME_URL, &cookie, "").await {
        let email = me.get("email").and_then(Value::as_str).map(str::to_string);
        if email.is_some() {
            let identity = reading.identity.get_or_insert_with(RemoteIdentity::default);
            identity.display_name = email;
            identity.provider_user_id = credentials.account_id.clone();
        }
    }
    Ok(reading)
}

const PERIOD_URL: &str =
    "https://api2.cursor.sh/aiserver.v1.DashboardService/GetCurrentPeriodUsage";
const PLAN_URL: &str = "https://api2.cursor.sh/aiserver.v1.DashboardService/GetPlanInfo";
const AUTH_USAGE_URL: &str = "https://api2.cursor.sh/auth/usage";
const CLIENT_VERSION: &str = "3.12.17";

pub async fn usage(
    client: &reqwest::Client,
    credentials: &Credentials,
) -> Result<QuotaReading, ProviderError> {
    match dashboard_usage(client, credentials).await {
        Ok(reading) => Ok(reading),
        // Do not multiply requests during an outage or retry an expired token.
        Err(error)
            if matches!(
                error.kind,
                ErrorKind::AccessExpired | ErrorKind::RateLimited | ErrorKind::Transport
            ) =>
        {
            Err(error)
        }
        Err(_) => ide_usage(client, credentials).await,
    }
}

fn digest(value: &str) -> String {
    Sha256::digest(value.as_bytes())
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect()
}

fn checksum(machine: &str, milliseconds: i64) -> String {
    let stamp = (milliseconds / 1_000_000) as u32;
    // Match JavaScript's 32-bit shift semantics in Cursor's checksum routine.
    let mut bytes = [8, 0, 24, 16, 8, 0].map(|shift| (stamp >> shift) as u8);
    let mut previous = 165;
    for (i, byte) in bytes.iter_mut().enumerate() {
        *byte = (*byte ^ previous).wrapping_add(i as u8);
        previous = *byte;
    }
    format!("{}{machine}", URL_SAFE_NO_PAD.encode(bytes))
}

fn ide_request(
    client: &reqwest::Client,
    url: &str,
    credentials: &Credentials,
) -> reqwest::RequestBuilder {
    let token = &credentials.access_token;
    let machine = digest(&format!("{token}machineId"));
    client
        .post(url)
        .bearer_auth(token)
        .json(&serde_json::json!({}))
        .header("accept", "application/json")
        .header("connect-protocol-version", "1")
        .header("user-agent", "connect-es/1.6.1")
        .header("x-client-key", digest(token))
        .header(
            "x-cursor-checksum",
            checksum(&machine, Utc::now().timestamp_millis()),
        )
        .header("x-cursor-client-version", CLIENT_VERSION)
        .header(
            "x-cursor-client-commit",
            "0fb762053c34788bb7760d5673f8a6d4c8589d50",
        )
        .header("x-cursor-client-type", "ide")
        .header("x-cursor-client-os", "macos")
        .header("x-cursor-client-arch", "aarch64")
        .header("x-cursor-client-device-type", "desktop")
        .header("x-ghost-mode", "true")
        .header("x-request-id", uuid::Uuid::new_v4().to_string())
        .header(
            "x-session-id",
            uuid::Uuid::new_v5(&uuid::Uuid::NAMESPACE_DNS, token.as_bytes()).to_string(),
        )
}

async fn ide_usage(
    client: &reqwest::Client,
    credentials: &Credentials,
) -> Result<QuotaReading, ProviderError> {
    let period = error::json(ide_request(client, PERIOD_URL, credentials), "Cursor").await;
    let mut reading = match period {
        Ok(json) => parse_period_usage(&json).ok(),
        Err(error)
            if matches!(
                error.kind,
                ErrorKind::AccessExpired | ErrorKind::RateLimited | ErrorKind::Transport
            ) =>
        {
            return Err(error)
        }
        Err(_) => None,
    };
    if reading.is_none() {
        let json = error::json(
            client
                .get(AUTH_USAGE_URL)
                .bearer_auth(&credentials.access_token)
                .header("accept", "application/json"),
            "Cursor",
        )
        .await?;
        reading = Some(parse_auth_usage(&json).map_err(ProviderError::invalid)?);
    }
    let mut reading = reading.unwrap();
    if let Ok(plan) = error::json(ide_request(client, PLAN_URL, credentials), "Cursor").await {
        if let Some(name) = plan
            .pointer("/planInfo/planName")
            .and_then(Value::as_str)
            .filter(|s| !s.trim().is_empty())
        {
            reading.identity = Some(RemoteIdentity {
                plan: Some(name.into()),
                ..Default::default()
            });
        }
    }
    Ok(reading)
}

fn parse_period_usage(json: &Value) -> Result<QuotaReading, String> {
    // Reuse our dashboard normalization to preserve cents, model pools and caps.
    let plan = json.get("planUsage").cloned().unwrap_or(Value::Null);
    let spend = json.get("spendLimitUsage").cloned().unwrap_or(Value::Null);
    let mut plan = plan;
    if plan.is_object() {
        plan["used"] = plan
            .get("includedSpend")
            .or_else(|| plan.get("totalSpend"))
            .cloned()
            .unwrap_or(Value::Null);
    }
    let normalized = serde_json::json!({
        "billingCycleEnd":json.get("billingCycleEnd"),
        "individualUsage": {"plan":plan, "onDemand":{
            "used":spend.get("individualUsed"), "limit":spend.get("individualLimit")
        }},
        "teamUsage":{"pooled":{"used":spend.get("pooledUsed"), "limit":spend.get("pooledLimit")}}
    });
    let mut reading = parse_usage_summary(&normalized)?;
    reading.source = "Cursor IDE API".into();
    Ok(reading)
}

fn parse_auth_usage(json: &Value) -> Result<QuotaReading, String> {
    let mut windows = Vec::new();
    for (key, bucket) in json
        .as_object()
        .ok_or("Cursor returned invalid quota data.")?
    {
        let total = number(bucket.get("maxRequestUsage")).filter(|n| n.is_finite() && *n > 0.0);
        let used = number(bucket.get("numRequests")).filter(|n| n.is_finite() && *n >= 0.0);
        if let (Some(total), Some(used)) = (total, used) {
            windows.push(QuotaWindow {
                key: format!("requests_{key}"),
                label: format!("{key} requests"),
                used_percent: (used / total * 100.0).clamp(0.0, 100.0),
                // startOfMonth is the period start, not a future reset deadline.
                resets_at: None,
                unlimited: false,
                paid: false,
                amount: Some(QuotaAmount {
                    used: Some(used),
                    total,
                    unit: Some("requests".into()),
                    overage: None,
                }),
            });
        }
    }
    if windows.is_empty() {
        return Err("Cursor returned no active quota windows.".into());
    }
    Ok(QuotaReading {
        source: "Cursor IDE API".into(),
        windows,
        ..Default::default()
    })
}

/// Turns `/api/usage-summary` into quota windows: the included plan (two
/// pools, "Cursor Models" and "Other Models", or one total on older shapes),
/// on-demand spending in cents (paid when capped, unlimited otherwise), the
/// personal cap of a team seat, and the capped team pool.
pub fn parse_usage_summary(json: &Value) -> Result<QuotaReading, String> {
    let resets_at =
        reset_time(json.get("billingCycleEnd")).and_then(|value| normalize_time(&value));
    let individual = json.get("individualUsage");
    let mut windows = Vec::new();

    if let Some(plan) = individual.and_then(|value| value.get("plan")) {
        let enabled = plan.get("enabled").and_then(Value::as_bool).unwrap_or(true);
        if enabled {
            add_plan_windows(plan, &resets_at, &mut windows);
        }
    }
    add_on_demand(
        individual.and_then(|value| value.get("onDemand")),
        &resets_at,
        &mut windows,
    );
    add_cents_window(
        individual.and_then(|value| value.get("overall")),
        "overall",
        "Personal cap",
        &resets_at,
        &mut windows,
    );
    add_cents_window(
        json.get("teamUsage").and_then(|value| value.get("pooled")),
        "pooled",
        "Team pool",
        &resets_at,
        &mut windows,
    );

    if windows.is_empty() {
        return Err("Cursor returned no active quota windows.".to_string());
    }
    let plan = json
        .get("membershipType")
        .and_then(Value::as_str)
        .filter(|value| !value.is_empty())
        .map(title_case);
    Ok(QuotaReading {
        source: "Cursor dashboard API".to_string(),
        identity: plan.map(|plan| RemoteIdentity {
            provider_user_id: None,
            display_name: None,
            plan: Some(plan),
        }),
        windows,
        reset_credits: None,
        observed_at: None,
        stale: false,
    })
}

/// The included plan: the two model pools when the dashboard reports them,
/// else one "Plan" window from the total percent or the cents.
fn add_plan_windows(plan: &Value, resets_at: &Option<String>, windows: &mut Vec<QuotaWindow>) {
    let pool = |key: &str, label: &str, percent: f64| QuotaWindow {
        key: key.to_string(),
        label: label.to_string(),
        used_percent: percent.clamp(0.0, 100.0),
        resets_at: resets_at.clone(),
        unlimited: false,
        amount: None,
        paid: false,
    };
    let auto = number(plan.get("autoPercentUsed"));
    let api = number(plan.get("apiPercentUsed"));
    if auto.is_some() || api.is_some() {
        if let Some(percent) = auto {
            windows.push(pool("cursor_models", "Cursor Models", percent));
        }
        if let Some(percent) = api {
            windows.push(pool("other_models", "Other Models", percent));
        }
        return;
    }
    let percent = number(plan.get("totalPercentUsed")).or_else(|| {
        let used = number(plan.get("used"))?;
        let limit = number(plan.get("limit"))?;
        (limit > 0.0).then(|| used / limit * 100.0)
    });
    if let Some(percent) = percent {
        windows.push(pool("plan", "Plan", percent));
    }
}

/// On-demand spending: capped is a paid window with the amount; uncapped shows
/// as unlimited with the spend so far, so the user sees what past the plan is
/// billed.
fn add_on_demand(
    block: Option<&Value>,
    resets_at: &Option<String>,
    windows: &mut Vec<QuotaWindow>,
) {
    let Some(block) = block else { return };
    let enabled = block.get("enabled").and_then(Value::as_bool);
    let capped = number(block.get("limit")).is_some_and(|limit| limit > 0.0);
    if capped {
        add_cents_window(Some(block), "on_demand", "On-demand", resets_at, windows);
    } else if enabled == Some(true) {
        windows.push(QuotaWindow {
            key: "on_demand".to_string(),
            label: "On-demand".to_string(),
            used_percent: 0.0,
            resets_at: resets_at.clone(),
            unlimited: true,
            amount: number(block.get("used")).map(|used| QuotaAmount {
                used: Some(used / 100.0),
                total: 0.0,
                unit: Some("USD".to_string()),
                overage: None,
            }),
            paid: true,
        });
    }
}

/// A window from a `{enabled, used, limit}` block in cents. Skipped when the
/// block is disabled or has no cap.
fn add_cents_window(
    block: Option<&Value>,
    key: &str,
    label: &str,
    resets_at: &Option<String>,
    windows: &mut Vec<QuotaWindow>,
) {
    let Some(block) = block else { return };
    if block.get("enabled").and_then(Value::as_bool) == Some(false) {
        return;
    }
    let Some(limit) = number(block.get("limit")).filter(|limit| *limit > 0.0) else {
        return;
    };
    let used = number(block.get("used")).unwrap_or(0.0);
    // The dollar amounts show under the bar; these caps are paid usage.
    windows.push(QuotaWindow {
        key: key.to_string(),
        label: label.to_string(),
        used_percent: (used / limit * 100.0).clamp(0.0, 100.0),
        resets_at: resets_at.clone(),
        unlimited: false,
        amount: Some(QuotaAmount {
            used: Some(used / 100.0),
            total: limit / 100.0,
            unit: Some("USD".to_string()),
            overage: None,
        }),
        paid: true,
    });
}

/// Cursor returns ISO dates; keep them as RFC 3339 for the interface.
fn normalize_time(value: &str) -> Option<String> {
    DateTime::parse_from_rfc3339(value)
        .ok()
        .map(|time| time.with_timezone(&Utc).to_rfc3339())
        .or_else(|| Some(value.to_string()))
}

/// Cursor access tokens are long-lived and there is no known renewal route.
pub const REFRESH_LEAD: Duration = Duration::zero();

#[cfg(test)]
mod tests {
    use super::*;
    use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};

    #[test]
    fn reads_ide_period_spending_and_enterprise_requests() {
        let reading = parse_period_usage(&serde_json::json!({
            "billingCycleEnd":"2026-12-01T00:00:00Z",
            "planUsage":{"limit":2000,"includedSpend":500},
            "spendLimitUsage":{"individualLimit":1000,"individualUsed":200}
        }))
        .unwrap();
        assert_eq!(reading.windows.len(), 2);
        assert_eq!(reading.windows[0].used_percent, 25.0);
        assert_eq!(reading.windows[1].amount.as_ref().unwrap().total, 10.0);
        let requests = parse_auth_usage(&serde_json::json!({"startOfMonth":"2026-11-01", "model":{"numRequests":20,"maxRequestUsage":100}})).unwrap();
        assert_eq!(requests.windows[0].used_percent, 20.0);
        assert!(requests.windows[0].resets_at.is_none());
        assert!(parse_auth_usage(&serde_json::json!({"model":{}})).is_err());
    }

    #[test]
    fn ide_requests_use_bearer_connect_json_without_dashboard_cookie() {
        let mut credentials = Credentials::default();
        credentials.access_token = "synthetic".into();
        let request = ide_request(&reqwest::Client::new(), PERIOD_URL, &credentials)
            .build()
            .unwrap();
        assert_eq!(request.headers()["authorization"], "Bearer synthetic");
        assert_eq!(request.headers()["content-type"], "application/json");
        assert_eq!(request.headers()["connect-protocol-version"], "1");
        assert!(request.headers().get("cookie").is_none());
    }

    fn jwt(claims: &str) -> String {
        format!("h.{}.s", URL_SAFE_NO_PAD.encode(claims))
    }

    #[test]
    fn builds_the_deep_link_url() {
        let login = DeepLogin {
            pkce: Pkce {
                verifier: "v".into(),
                challenge: "c".into(),
                state: "s".into(),
            },
            uuid: "1234".into(),
        };
        assert_eq!(
            authorize_url(&login),
            "https://cursor.com/loginDeepControl?challenge=c&uuid=1234&mode=login"
        );
    }

    #[test]
    fn reads_identity_from_the_access_token() {
        let token = jwt(r#"{"sub":"auth0|user_01ABC","email":"me@example.com","exp":1900000000}"#);
        let tokens = serde_json::json!({"accessToken": token, "refreshToken": "r"});
        let outcome = interpret(&tokens).expect("interpret");
        assert_eq!(outcome.account_key, "user_01ABC");
        assert_eq!(
            outcome.identity.display_name.as_deref(),
            Some("me@example.com")
        );
        assert_eq!(
            outcome.credentials.expires_at.map(|t| t.timestamp()),
            Some(1900000000)
        );
        assert_eq!(
            cookie_header(&outcome.credentials).expect("cookie"),
            format!("WorkosCursorSessionToken=user_01ABC%3A%3A{token}")
        );
    }

    #[test]
    fn parses_the_usage_summary() {
        let json: Value = serde_json::from_str(
            r#"{"billingCycleStart":"2026-08-01T00:00:00.000Z","billingCycleEnd":"2026-09-01T00:00:00.000Z",
                "membershipType":"pro_plus",
                "individualUsage":{
                  "plan":{"enabled":true,"used":1250,"limit":2000,"remaining":750,"totalPercentUsed":62.5},
                  "onDemand":{"enabled":true,"used":300,"limit":5000,"remaining":4700}},
                "teamUsage":{"onDemand":{"enabled":false},"pooled":{"enabled":false}}}"#,
        )
        .expect("json");
        let reading = parse_usage_summary(&json).expect("reading");
        assert_eq!(reading.windows.len(), 2);
        assert_eq!(reading.windows[0].key, "plan");
        assert_eq!(reading.windows[0].used_percent, 62.5);
        assert_eq!(
            reading.windows[0].resets_at.as_deref(),
            Some("2026-09-01T00:00:00+00:00")
        );
        assert_eq!(reading.windows[1].label, "On-demand");
        assert_eq!(reading.windows[1].used_percent, 6.0);
        assert!(reading.windows[1].paid);
        let amount = reading.windows[1].amount.clone().expect("amount");
        assert_eq!((amount.used, amount.total), (Some(3.0), 50.0));
        assert_eq!(amount.unit.as_deref(), Some("USD"));
        assert_eq!(
            reading.identity.and_then(|value| value.plan).as_deref(),
            Some("Pro Plus")
        );
    }

    #[test]
    fn shows_uncapped_on_demand_and_uses_cents_when_percent_is_missing() {
        let json = serde_json::json!({
            "individualUsage": {
                "plan": {"enabled": true, "used": 500, "limit": 2000},
                "onDemand": {"enabled": true, "used": 300}
            }
        });
        let reading = parse_usage_summary(&json).expect("reading");
        assert_eq!(reading.windows.len(), 2);
        assert_eq!(reading.windows[0].used_percent, 25.0);
        assert!(reading.windows[0].resets_at.is_none());
        // Enabled on-demand without a cap shows as unlimited paid usage.
        assert_eq!(reading.windows[1].key, "on_demand");
        assert!(reading.windows[1].unlimited);
        assert!(reading.windows[1].paid);
        let amount = reading.windows[1].amount.clone().expect("spend");
        assert_eq!((amount.used, amount.total), (Some(3.0), 0.0));
        assert_eq!(amount.unit.as_deref(), Some("USD"));
    }

    #[test]
    fn splits_the_plan_into_the_two_model_pools() {
        let json = serde_json::json!({
            "billingCycleEnd": "2026-08-29T00:00:00.000Z",
            "membershipType": "enterprise",
            "individualUsage": {
                "plan": {
                    "enabled": true, "used": 0, "limit": 2000,
                    "totalPercentUsed": 0.0, "autoPercentUsed": 12.5, "apiPercentUsed": 40.0
                },
                "onDemand": {"enabled": false}
            }
        });
        let reading = parse_usage_summary(&json).expect("reading");
        let keys: Vec<&str> = reading.windows.iter().map(|w| w.key.as_str()).collect();
        assert_eq!(keys, ["cursor_models", "other_models"]);
        assert_eq!(reading.windows[0].label, "Cursor Models");
        assert_eq!(reading.windows[0].used_percent, 12.5);
        assert_eq!(reading.windows[1].label, "Other Models");
        assert_eq!(reading.windows[1].used_percent, 40.0);
        assert!(reading.windows.iter().all(|w| w.resets_at.is_some()));
    }

    #[test]
    fn skips_disabled_on_demand() {
        let json = serde_json::json!({
            "individualUsage": {
                "plan": {"enabled": true, "totalPercentUsed": 5.0},
                "onDemand": {"enabled": false, "used": 0}
            }
        });
        let reading = parse_usage_summary(&json).expect("reading");
        assert_eq!(reading.windows.len(), 1);
        assert_eq!(reading.windows[0].key, "plan");
    }
}
