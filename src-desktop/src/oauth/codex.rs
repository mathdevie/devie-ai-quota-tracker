//! Codex (ChatGPT subscription) sign-in and quota reading, with the public
//! Codex CLI OAuth client and its fixed `localhost:1455/auth/callback`.

use super::{error, ErrorKind, ProviderError};

use chrono::{Duration, Utc};
use serde_json::Value;

use crate::{
    credentials::Credentials,
    model::{QuotaAmount, QuotaReading, QuotaWindow, RemoteIdentity, ResetCredit},
    oauth::{
        claude::{encode_query, title_case},
        decode_jwt_claims, LoginOutcome, Pkce, USER_AGENT,
    },
    parse::{number, reset_time},
};

/// Public OAuth client ID of OpenAI's Codex CLI.
pub const CLIENT_ID: &str = "app_EMoamEEZ73f0CkXaXp7hrann";
pub const AUTHORIZE_URL: &str = "https://auth.openai.com/oauth/authorize";
pub const TOKEN_URL: &str = "https://auth.openai.com/oauth/token";
pub const USAGE_URL: &str = "https://chatgpt.com/backend-api/wham/usage";
/// Banked rate-limit reset credits. Undocumented; the Codex VS Code
/// extension and 9router use the same route.
pub const RESET_CREDITS_URL: &str = "https://chatgpt.com/backend-api/wham/rate-limit-reset-credits";
pub const SCOPE: &str = "openid profile email offline_access";
pub const CALLBACK_PORT: u16 = 1455;
pub const CALLBACK_PATH: &str = "/auth/callback";
/// Codex access tokens last hours; renew early like the CLI does.
pub const REFRESH_LEAD: Duration = Duration::minutes(10);
pub const CLIENT_VERSION: &str = "0.159.0";
pub const PING_MODEL: &str = "gpt-6.1-sol";

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
) -> Result<Credentials, ProviderError> {
    let refresh_token = current
        .refresh_token
        .as_deref()
        .ok_or_else(|| "This Codex login cannot be renewed. Sign in again.".to_string())?;
    let tokens = error::json(
        client.post(TOKEN_URL).json(&serde_json::json!({
            "grant_type":"refresh_token", "client_id":CLIENT_ID, "refresh_token":refresh_token
        })),
        "Codex",
    )
    .await?;
    let (mut credentials, _, _) = interpret(&tokens, current.refresh_token.clone())?;
    if credentials.account_id.is_none() {
        credentials.account_id = current.account_id.clone();
    }
    Ok(credentials)
}

async fn post_form(
    client: &reqwest::Client,
    form: &[(&str, &str)],
) -> Result<Value, ProviderError> {
    error::json(
        client
            .post(TOKEN_URL)
            .header(reqwest::header::USER_AGENT, USER_AGENT)
            .form(form),
        "Codex",
    )
    .await
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
        .map(|plan| plan_label(&plan));
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
            project_id: None,
            last_refresh_at: None,
        },
        RemoteIdentity {
            provider_user_id: account_id,
            display_name: email,
            plan,
        },
        account_key,
    ))
}

/// A request to the ChatGPT backend with the headers the Codex CLI sends.
fn backend_request(
    request: reqwest::RequestBuilder,
    credentials: &Credentials,
) -> reqwest::RequestBuilder {
    let mut request = request
        .bearer_auth(&credentials.access_token)
        .header(reqwest::header::ACCEPT, "application/json")
        .header(
            reqwest::header::USER_AGENT,
            format!("codex_cli_rs/{CLIENT_VERSION}"),
        )
        .header("version", CLIENT_VERSION)
        .header("originator", "codex_cli_rs");
    if let Some(account_id) = &credentials.account_id {
        request = request.header("ChatGPT-Account-ID", account_id);
    }
    request
}

/// Sends the request and returns the JSON body, or a user-facing error.
async fn backend_json(
    request: reqwest::RequestBuilder,
    _invalid: &str,
) -> Result<Value, ProviderError> {
    error::json(request, "Codex").await
}

pub async fn usage(
    client: &reqwest::Client,
    credentials: &Credentials,
) -> Result<QuotaReading, ProviderError> {
    let json = backend_json(
        backend_request(client.get(USAGE_URL), credentials),
        "Codex returned invalid quota data.",
    )
    .await?;
    let mut reading = parse_usage(&json)?;
    // The credits list is a bonus. A failure must not hide the quota.
    reading.reset_credits = reset_credits(client, credentials).await.ok();
    Ok(reading)
}

/// Lists the reset credits the account can still spend.
pub async fn reset_credits(
    client: &reqwest::Client,
    credentials: &Credentials,
) -> Result<Vec<ResetCredit>, ProviderError> {
    let json = backend_json(
        backend_request(client.get(RESET_CREDITS_URL), credentials),
        "Codex returned invalid reset credit data.",
    )
    .await?;
    Ok(parse_reset_credits(&json))
}

/// Keeps the credits with status `available`, soonest to expire first.
pub fn parse_reset_credits(json: &Value) -> Vec<ResetCredit> {
    let text =
        |value: &Value, key: &str| value.get(key).and_then(Value::as_str).map(str::to_string);
    let mut credits: Vec<ResetCredit> = json
        .get("credits")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
        .enumerate()
        .filter(|(_, credit)| credit.get("status").and_then(Value::as_str) == Some("available"))
        .map(|(index, credit)| ResetCredit {
            // UI identity only: redemption spends the next available credit, not an ID.
            id: text(credit, "id").unwrap_or_else(|| format!("available-{index}")),
            title: text(credit, "title"),
            granted_at: reset_time(credit.get("granted_at")),
            expires_at: reset_time(credit.get("expires_at")),
        })
        .collect();
    if let Some(count) = json.get("available_count").and_then(Value::as_u64) {
        let count = count.min(1000) as usize;
        credits.truncate(count);
        while credits.len() < count {
            let index = credits.len();
            credits.push(ResetCredit {
                id: format!("count-only-{index}"),
                title: None,
                granted_at: None,
                expires_at: None,
            });
        }
    }
    credits.sort_by(|a, b| match (&a.expires_at, &b.expires_at) {
        (Some(a), Some(b)) => a.cmp(b),
        (Some(_), None) => std::cmp::Ordering::Less,
        (None, Some(_)) => std::cmp::Ordering::Greater,
        _ => std::cmp::Ordering::Equal,
    });
    credits
}

/// Spends one reset credit. Every quota window of the account resets.
pub async fn consume_reset_credit(
    client: &reqwest::Client,
    credentials: &Credentials,
    redeem_request_id: &str,
) -> Result<(), ProviderError> {
    let body = serde_json::json!({
        "redeem_request_id": redeem_request_id,
    });
    let json = backend_json(
        backend_request(
            client
                .post(format!("{RESET_CREDITS_URL}/consume"))
                .json(&body),
            credentials,
        ),
        "Codex returned an invalid reset response.",
    )
    .await?;
    reset_result(&json)
}

fn reset_result(json: &Value) -> Result<(), ProviderError> {
    if json.get("code").and_then(Value::as_str) == Some("no_credit") {
        return Err(ProviderError::new(
            ErrorKind::Other,
            "No Codex reset credits are available.",
        ));
    }
    if json.get("code").and_then(Value::as_str) == Some("reset")
        || number(json.get("windows_reset")).is_some_and(|n| n > 0.0)
        || json.pointer("/credit/status").and_then(Value::as_str) == Some("redeemed")
    {
        Ok(())
    } else {
        Err(ProviderError::invalid(
            "Codex did not accept the reset credit.",
        ))
    }
}

pub fn parse_usage(json: &Value) -> Result<QuotaReading, String> {
    let mut windows = Vec::new();
    let normal = json
        .get("rate_limit")
        .filter(|v| v.is_object())
        .or_else(|| json.get("rate_limits").filter(|v| v.is_object()))
        .or_else(|| json.pointer("/rate_limits_by_limit_id/codex"));
    if let Some(normal) = normal {
        add_family(normal, "", "", &mut windows);
    }
    for (keys, family, label) in [
        (
            &["code_review_rate_limit", "review_rate_limit"][..],
            "review",
            "Review",
        ),
        (
            &["spark_rate_limit", "gpt_5_3_codex_spark_rate_limit"][..],
            "spark",
            "Spark",
        ),
    ] {
        if let Some(value) = keys
            .iter()
            .find_map(|key| json.get(*key).filter(|v| v.is_object()))
        {
            add_family(value, family, label, &mut windows);
        }
    }
    if let Some(families) = json
        .get("rate_limits_by_limit_id")
        .and_then(Value::as_object)
    {
        for (name, value) in families {
            if name != "codex" {
                add_named_family(value, name, &mut windows);
            }
        }
    }
    if let Some(families) = json.get("additional_rate_limits").and_then(Value::as_array) {
        for value in families {
            if let Some(name) = ["limit_name", "metered_feature", "id"]
                .iter()
                .find_map(|key| value.get(*key).and_then(Value::as_str))
            {
                add_named_family(value, name, &mut windows);
            }
        }
    }
    add_credits(json, &mut windows);
    if windows.is_empty() {
        return Err("Codex returned no active quota windows.".to_string());
    }
    let plan = json
        .get("plan_type")
        .and_then(Value::as_str)
        .map(plan_label);
    Ok(QuotaReading {
        source: "ChatGPT subscription API".to_string(),
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

fn add_named_family(value: &Value, name: &str, windows: &mut Vec<QuotaWindow>) {
    let lower = name.to_lowercase();
    let family = if lower.contains("review") {
        "review".to_string()
    } else if lower.contains("spark") {
        "spark".to_string()
    } else {
        lower
            .chars()
            .map(|c| if c.is_ascii_alphanumeric() { c } else { '_' })
            .collect()
    };
    if !family.is_empty() {
        add_family(value, &family, &title_case(name), windows);
    }
}

fn add_family(value: &Value, family: &str, label: &str, windows: &mut Vec<QuotaWindow>) {
    let value = value
        .get("rate_limit")
        .filter(|v| v.is_object())
        .unwrap_or(value);
    let Some(limits) = value.as_object() else {
        return;
    };
    for (aliases, key, fallback) in [
        (
            &["primary_window", "primary"][..],
            "primary",
            "Session (5h)",
        ),
        (
            &["secondary_window", "secondary"][..],
            "secondary",
            "Weekly",
        ),
    ] {
        let key = if family.is_empty() {
            key.to_string()
        } else {
            format!("{family}_{key}")
        };
        if windows.iter().any(|w| w.key == key) {
            continue;
        }
        let before = windows.len();
        add_window(limits, aliases, &key, fallback, windows);
        if !family.is_empty() && windows.len() > before {
            let window = windows.last_mut().unwrap();
            window.label = format!("{label} · {}", window.label);
        }
    }
}

/// The effective monthly limit and the credit balance are separate values.
/// Workspace members can have available credits without a visible balance.
fn add_credits(json: &Value, windows: &mut Vec<QuotaWindow>) {
    let monthly = monthly_credit_limit(json);
    let has_monthly_limit = monthly.is_some();
    windows.extend(monthly);
    let Some(credits) = json.get("credits").and_then(Value::as_object) else {
        return;
    };
    let flag = |key: &str| credits.get(key).and_then(Value::as_bool).unwrap_or(false);
    if flag("unlimited") {
        windows.push(QuotaWindow {
            key: "credits".to_string(),
            label: "Credits".to_string(),
            used_percent: 0.0,
            resets_at: None,
            unlimited: true,
            amount: None,
            paid: true,
        });
        return;
    }
    if !flag("has_credits") {
        return;
    }
    // A zero, missing, or invalid balance can mean the workspace hides it.
    // `has_credits` and the explicit reached flags determine availability.
    let balance = number(credits.get("balance")).filter(|value| value.is_finite() && *value > 0.0);
    let reached = flag("overage_limit_reached")
        || json
            .get("spend_control")
            .and_then(|control| control.get("reached"))
            .and_then(Value::as_bool)
            .unwrap_or(false);
    // The monthly row already describes the available allowance. Preserve
    // a real balance or an explicit block, without adding a redundant status.
    if has_monthly_limit && balance.is_none() && !reached {
        return;
    }
    // Without a balance the row is availability only: 0 or 100 marks the
    // state, not usage, so it cannot be pinned as a menu bar percentage.
    windows.push(QuotaWindow {
        key: "credits".to_string(),
        label: "Credits".to_string(),
        used_percent: if reached { 100.0 } else { 0.0 },
        resets_at: None,
        unlimited: false,
        amount: balance.map(|balance| QuotaAmount {
            used: None,
            total: balance,
            unit: Some("credits".to_string()),
            overage: None,
        }),
        paid: true,
    });
}

/// "8,000 of 25,000 credits used, resets in 23d": the effective monthly cap
/// of a workspace member. The field names follow the Codex CLI's
/// `SpendControlLimitDetails`; the amounts are decimal strings.
fn monthly_credit_limit(json: &Value) -> Option<QuotaWindow> {
    let limit = json
        .get("spend_control")?
        .get("individual_limit")?
        .as_object()?;
    let total = number(limit.get("limit"))?;
    let used = number(limit.get("used"))
        .or_else(|| number(limit.get("remaining")).map(|left| total - left))
        .unwrap_or(0.0)
        .max(0.0);
    let used_percent = number(limit.get("used_percent"))
        .or_else(|| number(limit.get("remaining_percent")).map(|left| 100.0 - left))
        .or_else(|| (total > 0.0).then(|| used / total * 100.0))
        .unwrap_or(0.0);
    let resets_at =
        reset_time(limit.get("reset_at").filter(|value| !value.is_null())).or_else(|| {
            number(limit.get("reset_after_seconds"))
                .map(|seconds| (Utc::now() + Duration::seconds(seconds as i64)).to_rfc3339())
        });
    Some(QuotaWindow {
        key: "monthly_credits".to_string(),
        label: "Monthly credits".to_string(),
        used_percent: used_percent.clamp(0.0, 100.0),
        resets_at,
        unlimited: false,
        amount: Some(QuotaAmount {
            used: Some(used),
            total,
            unit: Some("credits".to_string()),
            overage: None,
        }),
        paid: true,
    })
}

/// The marketing name of a ChatGPT `plan_type`. `prolite` is the cheaper Pro
/// plan of April 2026 (internally "Pro Lite").
pub fn plan_label(plan: &str) -> String {
    match plan.to_lowercase().as_str() {
        "free" => "Free".to_string(),
        "go" => "Go".to_string(),
        "plus" => "Plus".to_string(),
        "prolite" => "Pro Lite".to_string(),
        "pro" => "Pro".to_string(),
        "team" => "Team".to_string(),
        "business" | "self_serve_business_usage_based" => "Business".to_string(),
        "self_serve_business_prolite" => "Business Premium".to_string(),
        "enterprise" | "ent26" | "enterprise_cbp_automation" | "enterprise_cbp_usage_based" => {
            "Enterprise".to_string()
        }
        "edu" | "edu_plus" => "Edu".to_string(),
        "edu_pro" => "Edu Pro".to_string(),
        other => title_case(other),
    }
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
                "Weekly".to_string()
            } else if minutes >= 60.0 {
                format!("Session ({}h)", (minutes / 60.0).round())
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
        unlimited: false,
        amount: None,
        paid: false,
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
    #[test]
    fn accepts_reset_credits_without_provider_ids() {
        let credits = parse_reset_credits(&serde_json::json!({"available_count": 2, "credits": [
            {"status":"available", "expires_at":"2026-12-01T00:00:00Z"},
            {"status":"available", "expires_at":"2026-12-02T00:00:00Z"}
        ]}));
        assert_eq!(credits.len(), 2);
    }

    #[test]
    fn reads_review_and_named_rate_limit_families() {
        let reading = parse_usage(&serde_json::json!({
            "rate_limits_by_limit_id": {
                "codex": {"primary_window":{"used_percent":12}},
                "code_review": {"primary_window":{"used_percent":34}}
            },
            "additional_rate_limits": [{"limit_name":"spark", "rate_limit":{
                "secondary_window":{"used_percent":56}
            }}]
        }))
        .unwrap();
        assert_eq!(reading.windows.len(), 3);
        assert!(reading
            .windows
            .iter()
            .any(|w| w.key == "review_primary" && w.used_percent == 34.0));
    }

    #[test]
    fn no_credit_or_zero_windows_is_not_a_success() {
        assert!(reset_result(&serde_json::json!({"code":"no_credit", "windows_reset":0})).is_err());
        assert!(reset_result(&serde_json::json!({"windows_reset":0})).is_err());
        assert!(reset_result(&serde_json::json!({"code":"reset", "windows_reset":2})).is_ok());
    }

    fn workspace_usage() -> Value {
        serde_json::from_str(include_str!("fixtures/codex-workspace-usage.json"))
            .expect("workspace fixture")
    }

    #[test]
    fn monthly_limits_do_not_require_rolling_windows() {
        for limits in [
            None,
            Some(Value::Null),
            Some(serde_json::json!({})),
            Some(serde_json::json!({"primary_window":null,"secondary_window":null})),
        ] {
            let mut json = workspace_usage();
            json["credits"] = Value::Null;
            json.as_object_mut().unwrap().remove("rate_limit");
            if let Some(limits) = limits {
                json["rate_limit"] = limits;
            }
            let reading = parse_usage(&json).expect("monthly-only reading");
            assert_eq!(reading.windows.len(), 1);
            let monthly = &reading.windows[0];
            assert_eq!(monthly.key, "monthly_credits");
            assert_eq!(monthly.used_percent, 32.0);
            assert_eq!(
                monthly.resets_at.as_deref(),
                Some("2026-10-01T00:00:00+00:00")
            );
            let amount = monthly.amount.as_ref().unwrap();
            assert_eq!((amount.used, amount.total), (Some(8000.0), 25000.0));
        }
    }

    #[test]
    fn monthly_limits_preserve_positive_and_unlimited_credits() {
        let mut json = workspace_usage();
        let reading = parse_usage(&json).expect("monthly and balance");
        assert_eq!(reading.windows.len(), 2);
        let credits = reading.windows.iter().find(|w| w.key == "credits").unwrap();
        assert_eq!(credits.amount.as_ref().unwrap().total, 9.99);
        assert_eq!(credits.used_percent, 0.0);

        json["credits"] = serde_json::json!({"has_credits":false,"unlimited":true});
        let reading = parse_usage(&json).expect("monthly and unlimited credits");
        assert_eq!(reading.windows.len(), 2);
        assert!(reading
            .windows
            .iter()
            .any(|w| w.key == "credits" && w.unlimited));
    }

    #[test]
    fn hidden_balances_report_availability_without_an_amount() {
        for balance in [None, Some(Value::Null)].into_iter().chain(
            ["0", "0.00", "", "not-a-number", "NaN", "inf", "-1"]
                .into_iter()
                .map(|value| Some(Value::String(value.into()))),
        ) {
            let mut json = workspace_usage();
            json["spend_control"]["individual_limit"] = Value::Null;
            json["credits"].as_object_mut().unwrap().remove("balance");
            if let Some(balance) = balance {
                json["credits"]["balance"] = balance;
            }
            let reading = parse_usage(&json).expect("available credits without rolling windows");
            assert_eq!(reading.windows.len(), 1);
            let credits = &reading.windows[0];
            assert!(credits.is_credit_status());
            assert_eq!(credits.used_percent, 0.0);
            assert!(credits.amount.is_none());
            assert!(!credits.unlimited);
        }
    }

    #[test]
    fn explicit_spend_blocks_are_preserved_with_a_hidden_balance() {
        for monthly in [false, true] {
            for overage in [false, true] {
                let mut json = workspace_usage();
                if !monthly {
                    json["spend_control"]["individual_limit"] = Value::Null;
                }
                json["credits"]["balance"] = Value::Null;
                if overage {
                    json["credits"]["overage_limit_reached"] = Value::Bool(true);
                } else {
                    json["spend_control"]["reached"] = Value::Bool(true);
                }
                let reading = parse_usage(&json).expect("blocked credits");
                let credits = reading.windows.iter().find(|w| w.key == "credits").unwrap();
                assert!(credits.is_credit_status());
                assert_eq!(credits.used_percent, 100.0);
                assert!(credits.amount.is_none());
            }
        }
    }

    #[test]
    fn empty_usage_is_still_rejected() {
        for json in [
            serde_json::json!({}),
            serde_json::json!({"rate_limit":null,"credits":null,"spend_control":null}),
            serde_json::json!({"rate_limit":{},"credits":{"has_credits":false,"unlimited":false},"spend_control":{"reached":false,"individual_limit":null}}),
        ] {
            assert!(parse_usage(&json).is_err());
        }
    }

    #[test]
    fn adds_a_credits_balance_window() {
        let json: Value = serde_json::from_str(
            r#"{"plan_type":"plus","rate_limit":{"primary_window":{"used_percent":24,"limit_window_seconds":18000,"reset_after_seconds":100}},
            "credits":{"has_credits":true,"unlimited":false,"overage_limit_reached":false,"balance":"12.5"},
            "spend_control":{"reached":false}}"#,
        )
        .expect("fixture");
        let reading = parse_usage(&json).expect("reading");
        let credits = reading
            .windows
            .iter()
            .find(|w| w.key == "credits")
            .expect("credits");
        assert!(credits.paid);
        assert_eq!(credits.used_percent, 0.0);
        let amount = credits.amount.clone().expect("amount");
        assert_eq!((amount.used, amount.total), (None, 12.5));
        assert_eq!(amount.unit.as_deref(), Some("credits"));

        let none: Value = serde_json::from_str(
            r#"{"rate_limit":{"primary_window":{"used_percent":24,"limit_window_seconds":18000,"reset_after_seconds":100}},"credits":{"has_credits":false,"balance":"0"}}"#,
        )
        .expect("fixture");
        assert!(parse_usage(&none)
            .expect("reading")
            .windows
            .iter()
            .all(|w| w.key != "credits"));
    }

    #[test]
    fn team_monthly_credit_limit_replaces_a_hidden_balance() {
        // Constructed Team response using the upstream monthly-limit schema.
        // A real Team response is still needed to verify account availability.
        let json: Value = serde_json::from_str(
            r#"{"plan_type":"team","rate_limit":{"primary_window":{"used_percent":0,"limit_window_seconds":18000,"reset_at":1788802743},
                "secondary_window":{"used_percent":0,"limit_window_seconds":604800,"reset_at":1789389543}},
            "credits":{"has_credits":true,"unlimited":false,"overage_limit_reached":false,"balance":"0"},
            "spend_control":{"reached":false,"individual_limit":{"source":"workspace","limit":"25000","used":"8000",
                "remaining":"17000","used_percent":32,"remaining_percent":68,"reset_after_seconds":3600,"reset_at":1790828400}}}"#,
        )
        .expect("fixture");
        let reading = parse_usage(&json).expect("reading");
        assert!(reading.windows.iter().all(|w| w.key != "credits"));
        let monthly = reading
            .windows
            .iter()
            .find(|w| w.key == "monthly_credits")
            .expect("monthly credits");
        assert!(monthly.paid);
        assert_eq!(monthly.label, "Monthly credits");
        assert_eq!(monthly.used_percent, 32.0);
        assert_eq!(
            monthly.resets_at.as_deref(),
            Some("2026-10-01T04:20:00+00:00")
        );
        let amount = monthly.amount.clone().expect("amount");
        assert_eq!((amount.used, amount.total), (Some(8000.0), 25000.0));
        assert_eq!(amount.unit.as_deref(), Some("credits"));
        assert_eq!(
            reading.identity.and_then(|value| value.plan).as_deref(),
            Some("Team")
        );
    }

    #[test]
    fn monthly_credit_limit_falls_back_to_the_remaining_percent() {
        let json: Value = serde_json::from_str(
            r#"{"rate_limit":{"primary_window":{"used_percent":5,"limit_window_seconds":18000,"reset_after_seconds":100}},
            "spend_control":{"reached":true,"individual_limit":{"limit":"2000","remaining":"0","remaining_percent":0,"reset_after_seconds":60}}}"#,
        )
        .expect("fixture");
        let reading = parse_usage(&json).expect("reading");
        let monthly = reading
            .windows
            .iter()
            .find(|w| w.key == "monthly_credits")
            .expect("monthly credits");
        assert_eq!(monthly.used_percent, 100.0);
        assert!(monthly.resets_at.is_some());
        let amount = monthly.amount.clone().expect("amount");
        assert_eq!((amount.used, amount.total), (Some(2000.0), 2000.0));
    }

    #[test]
    fn unlimited_credits_show_as_unlimited() {
        let json: Value = serde_json::from_str(
            r#"{"rate_limit":{"primary_window":{"used_percent":5,"limit_window_seconds":18000,"reset_after_seconds":100}},
            "credits":{"has_credits":true,"unlimited":true,"balance":null}}"#,
        )
        .expect("fixture");
        let reading = parse_usage(&json).expect("reading");
        let credits = reading
            .windows
            .iter()
            .find(|w| w.key == "credits")
            .expect("credits");
        assert!(credits.unlimited && credits.paid);
        assert!(credits.amount.is_none());
    }

    #[tokio::test]
    async fn exchange_rejects_a_wrong_state() {
        let pkce = Pkce {
            verifier: "v".into(),
            challenge: "c".into(),
            state: "expected".into(),
        };
        let client = reqwest::Client::new();
        let err = exchange(&client, &pkce, &redirect_uri(), "code", Some("wrong"))
            .await
            .expect_err("mismatched state must fail");
        assert!(err.contains("does not match"));
    }

    #[test]
    fn maps_plan_types() {
        assert_eq!(plan_label("prolite"), "Pro Lite");
        assert_eq!(plan_label("pro"), "Pro");
        assert_eq!(plan_label("go"), "Go");
        assert_eq!(plan_label("new_thing"), "New Thing");
    }
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
    fn parses_available_reset_credits_soonest_first() {
        let json: Value = serde_json::json!({
            "available_count": 2,
            "credits": [
                {"id": "b", "status": "available", "title": "Weekly reset",
                 "granted_at": "2026-08-01T00:00:00Z", "expires_at": "2026-09-30T00:00:00Z"},
                {"id": "used", "status": "redeemed", "expires_at": "2026-09-01T00:00:00Z"},
                {"id": "a", "status": "available", "expires_at": "2026-09-04T16:00:00Z"}
            ]
        });
        let credits = parse_reset_credits(&json);
        assert_eq!(credits.len(), 2);
        assert_eq!(credits[0].id, "a");
        assert_eq!(credits[1].title.as_deref(), Some("Weekly reset"));
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
        assert_eq!(reading.windows[0].label, "Session (5h)");
        assert_eq!(reading.windows[1].used_percent, 71.0);
        assert_eq!(
            reading.identity.and_then(|value| value.plan).as_deref(),
            Some("Pro")
        );
    }
}
