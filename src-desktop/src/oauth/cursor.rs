//! Cursor sign-in and quota reading.
//!
//! Cursor has no public OAuth client. The desktop app signs in with a PKCE
//! deep link: it opens `cursor.com/loginDeepControl` and polls
//! `api2.cursor.sh/auth/poll` until the user confirms in the browser. No
//! callback port is needed. Third-party tools (pi-cursor, several write-ups)
//! use the same flow. It is undocumented and can change.
//!
//! Quota comes from the dashboard endpoints on `cursor.com`, with the access
//! token sent as the `WorkosCursorSessionToken` cookie, which is what
//! CodexBar and cursor-stats do.

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
    invalid: &str,
) -> Result<Value, String> {
    let response = client
        .get(url)
        .header(reqwest::header::ACCEPT, "application/json")
        .header(reqwest::header::USER_AGENT, USER_AGENT)
        .header(reqwest::header::COOKIE, cookie)
        .send()
        .await
        .map_err(|_| "Cursor could not be reached.".to_string())?;
    let status = response.status();
    if status.as_u16() == 401 || status.as_u16() == 403 {
        return Err("The Cursor login expired. Sign in again.".to_string());
    }
    let text = response.text().await.unwrap_or_default();
    if !status.is_success() {
        return Err(describe_http_failure("Cursor", status, &text));
    }
    serde_json::from_str(&text).map_err(|_| invalid.to_string())
}

pub async fn usage(
    client: &reqwest::Client,
    credentials: &Credentials,
) -> Result<QuotaReading, String> {
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

/// Turns `/api/usage-summary` into quota windows.
///
/// - `individualUsage.plan`: the included plan usage. Current dashboards
///   split it into two pools, `autoPercentUsed` ("Cursor Models": Composer
///   and Cursor Grok) and `apiPercentUsed` ("Other Models"). Older shapes
///   give one `totalPercentUsed` or cents. Both reset at `billingCycleEnd`.
/// - `individualUsage.onDemand`: usage-based spending in cents. Capped: a
///   paid window with the amount. Uncapped: an unlimited "On-demand" row.
/// - `individualUsage.overall`: a personal cap for team and enterprise seats.
/// - `teamUsage.pooled`: the pool shared by a team, when capped.
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

/// On-demand spending: a capped block is a paid window with the amount; an
/// enabled block without a cap shows as unlimited, so the user sees that
/// usage past the plan is billed.
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
            amount: None,
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
