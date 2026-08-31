use std::path::Path;

use chrono::{DateTime, Duration, Timelike, Utc};
use serde_json::json;

use crate::{
    db::Database,
    model::{Provider, ProviderConnection, QuotaReading, QuotaWindow},
    oauth,
};

const CLAUDE_PING_URL: &str = "https://api.anthropic.com/v1/messages?beta=true";
const CODEX_PING_URL: &str = "https://chatgpt.com/backend-api/codex/responses";
const FAILURE_COOLDOWN_MINUTES: i64 = 15;
const MINIMUM_INTERVAL_MINUTES: i64 = 10;
const RESET_DRIFT_SECONDS: i64 = 30;

pub fn supported(connection: &ProviderConnection) -> bool {
    matches!(connection.provider, Provider::Claude | Provider::Codex)
}

/// Claude needs a forced quota read near its fixed reset and while the
/// session is idle, so the ping can restart the timer quickly. Codex needs
/// one each minute because an inactive session reports a reset time that
/// slides.
pub fn refresh_due(connection: &ProviderConnection, now: DateTime<Utc>) -> bool {
    if !connection.enabled || !connection.auto_ping.enabled || !supported(connection) {
        return false;
    }
    if connection.provider == Provider::Codex {
        return true;
    }
    let Some(session) = session_window(&connection.windows) else {
        return false;
    };
    let Some(reset) = reset_time(session) else {
        // An idle session reports no reset time; keep reading so the next
        // `after_reading` can start the timer.
        return true;
    };
    reset - now <= Duration::minutes(5) && now - reset <= Duration::minutes(15)
}

pub async fn after_reading(
    database: &Database,
    app_data_dir: &Path,
    client: &reqwest::Client,
    connection: &ProviderConnection,
    reading: &QuotaReading,
) {
    if !connection.enabled || !connection.auto_ping.enabled || !supported(connection) {
        return;
    }
    let Some(session) = session_window(&reading.windows) else {
        return;
    };
    let now = Utc::now();
    // An idle Claude session reports no reset time: the timer is stopped,
    // which is the exact state the optimizer exists to fix.
    let Some(current_reset) = session.resets_at.as_deref() else {
        if connection.provider == Provider::Claude {
            start_claude_session(
                database,
                app_data_dir,
                client,
                connection,
                reading,
                session,
                now,
            )
            .await;
        }
        return;
    };
    if connection.provider == Provider::Claude {
        // A reported reset time means the timer already runs.
        let _ = database.set_auto_ping_observation(&connection.id, current_reset);
        return;
    }
    // Codex: ping when the reported reset slid forward between readings,
    // because an inactive session keeps pushing its reset into the future.
    let Some(observed_reset) = connection.auto_ping.observed_reset_at.as_deref() else {
        let _ = database.set_auto_ping_observation(&connection.id, current_reset);
        return;
    };
    if in_failure_cooldown(connection, now) {
        return;
    }
    let Some(reset_key) = ping_reset_key(observed_reset, current_reset) else {
        let _ = database.set_auto_ping_observation(&connection.id, current_reset);
        return;
    };
    if connection.auto_ping.last_reset_key.as_deref() == Some(reset_key.as_str())
        || pinged_too_recently(connection, now)
        || session.used_percent >= 100.0
        || has_exhausted_blocking_window(&reading.windows, &session.key)
    {
        let _ = database.set_auto_ping_observation(&connection.id, current_reset);
        return;
    }

    match send(connection, app_data_dir, client).await {
        Ok(()) => {
            let _ = database.save_auto_ping_success(&connection.id, &reset_key, current_reset);
        }
        Err(message) => {
            let _ = database.save_auto_ping_failure(&connection.id, &message);
        }
    }
}

/// Sends the ping that starts an idle Claude session timer.
async fn start_claude_session(
    database: &Database,
    app_data_dir: &Path,
    client: &reqwest::Client,
    connection: &ProviderConnection,
    reading: &QuotaReading,
    session: &QuotaWindow,
    now: DateTime<Utc>,
) {
    if claude_ping_blocked(connection, reading, session, now) {
        return;
    }
    match send(connection, app_data_dir, client).await {
        Ok(()) => {
            let key = minute_key(now);
            let _ = database.save_auto_ping_success(&connection.id, &key, &key);
        }
        Err(message) => {
            let _ = database.save_auto_ping_failure(&connection.id, &message);
        }
    }
}

/// The interval guard also covers the readings right after a successful ping,
/// which can still report an idle session until the API catches up.
fn claude_ping_blocked(
    connection: &ProviderConnection,
    reading: &QuotaReading,
    session: &QuotaWindow,
    now: DateTime<Utc>,
) -> bool {
    in_failure_cooldown(connection, now)
        || pinged_too_recently(connection, now)
        || session.used_percent >= 100.0
        || has_exhausted_blocking_window(&reading.windows, &session.key)
}

fn ping_reset_key(observed_reset: &str, current_reset: &str) -> Option<String> {
    let observed = parse_time(observed_reset)?;
    let current = parse_time(current_reset)?;
    (current - observed >= Duration::seconds(RESET_DRIFT_SECONDS)).then(|| minute_key(current))
}

fn minute_key(time: DateTime<Utc>) -> String {
    time.with_second(0)
        .and_then(|value| value.with_nanosecond(0))
        .unwrap_or(time)
        .to_rfc3339()
}

fn in_failure_cooldown(connection: &ProviderConnection, now: DateTime<Utc>) -> bool {
    connection.auto_ping.last_error.is_some()
        && connection
            .auto_ping
            .last_attempt_at
            .as_deref()
            .and_then(parse_time)
            .is_some_and(|attempt| now - attempt < Duration::minutes(FAILURE_COOLDOWN_MINUTES))
}

fn pinged_too_recently(connection: &ProviderConnection, now: DateTime<Utc>) -> bool {
    connection
        .auto_ping
        .last_ping_at
        .as_deref()
        .and_then(parse_time)
        .is_some_and(|ping| now - ping < Duration::minutes(MINIMUM_INTERVAL_MINUTES))
}

fn has_exhausted_blocking_window(windows: &[QuotaWindow], session_key: &str) -> bool {
    windows
        .iter()
        .any(|window| !window.paid && window.key != session_key && window.used_percent >= 100.0)
}

fn session_window(windows: &[QuotaWindow]) -> Option<&QuotaWindow> {
    windows.iter().find(|window| {
        matches!(window.key.as_str(), "five_hour" | "primary")
            || window.label.to_lowercase().contains("session")
    })
}

fn reset_time(window: &QuotaWindow) -> Option<DateTime<Utc>> {
    window.resets_at.as_deref().and_then(parse_time)
}

fn parse_time(value: &str) -> Option<DateTime<Utc>> {
    DateTime::parse_from_rfc3339(value)
        .ok()
        .map(|value| value.with_timezone(&Utc))
}

async fn send(
    connection: &ProviderConnection,
    app_data_dir: &Path,
    client: &reqwest::Client,
) -> Result<(), String> {
    let credentials = oauth::credentials_for_request(connection, app_data_dir, client).await?;
    match connection.provider {
        Provider::Claude => send_claude(client, &credentials.access_token).await,
        Provider::Codex => send_codex(client, connection, &credentials).await,
        Provider::Gemini => Err("The Quota Optimizer does not support Gemini CLI.".to_string()),
        Provider::Copilot => Err("The Quota Optimizer does not support Copilot.".to_string()),
        Provider::Cursor => Err("The Quota Optimizer does not support Cursor.".to_string()),
    }
}

async fn send_claude(client: &reqwest::Client, access_token: &str) -> Result<(), String> {
    let response = client
        .post(CLAUDE_PING_URL)
        .bearer_auth(access_token)
        .header("anthropic-version", "2023-06-01")
        .header(
            "anthropic-beta",
            "claude-code-20250219,oauth-2025-04-20,interleaved-thinking-2025-05-14",
        )
        .header("anthropic-dangerous-direct-browser-access", "true")
        .header(
            reqwest::header::USER_AGENT,
            "claude-cli/2.1.92 (external, sdk-cli)",
        )
        .header("x-app", "cli")
        .json(&json!({
            "model": "claude-haiku-4-5-20251001",
            "max_tokens": 1,
            "messages": [{ "role": "user", "content": "hi" }],
        }))
        .send()
        .await
        .map_err(|_| "Claude could not receive the Quota Optimizer request.".to_string())?;
    finish_response("Claude", response).await
}

async fn send_codex(
    client: &reqwest::Client,
    connection: &ProviderConnection,
    credentials: &crate::credentials::Credentials,
) -> Result<(), String> {
    let mut request = client
        .post(CODEX_PING_URL)
        .bearer_auth(&credentials.access_token)
        .header(reqwest::header::ACCEPT, "text/event-stream")
        .header(reqwest::header::USER_AGENT, "codex_cli_rs/0.136.0")
        .header("originator", "codex_cli_rs")
        .header("session_id", &connection.id)
        .json(&json!({
            "model": "gpt-5.5",
            "input": [{
                "type": "message",
                "role": "user",
                "content": [{ "type": "input_text", "text": "hi" }],
            }],
            "instructions": "Reply with OK.",
            "reasoning": { "effort": "none", "summary": "auto" },
            "store": false,
            "stream": true,
        }));
    if let Some(account_id) = &credentials.account_id {
        request = request.header("ChatGPT-Account-ID", account_id);
    }
    let response = request
        .send()
        .await
        .map_err(|_| "Codex could not receive the Quota Optimizer request.".to_string())?;
    finish_response("Codex", response).await
}

async fn finish_response(provider: &str, response: reqwest::Response) -> Result<(), String> {
    let status = response.status();
    let body = response.text().await.unwrap_or_default();
    if status.is_success() {
        return Ok(());
    }
    Err(oauth::describe_http_failure(provider, status, &body))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::{AutoPingState, ConnectionAlerts, ConnectionStatus, RemoteIdentity};

    fn connection(provider: Provider) -> ProviderConnection {
        ProviderConnection {
            id: "one".into(),
            provider,
            label: "Account".into(),
            source_locator: "oauth/test".into(),
            enabled: true,
            status: ConnectionStatus::Ready,
            source: "test".into(),
            last_updated_at: None,
            last_error: None,
            custom_label: None,
            identity: Some(RemoteIdentity::default()),
            alerts: ConnectionAlerts::default(),
            auto_ping: AutoPingState {
                enabled: true,
                ..AutoPingState::default()
            },
            windows: Vec::new(),
            reset_credits: Vec::new(),
            hidden_windows: Vec::new(),
        }
    }

    fn session(resets_at: Option<&str>, used_percent: f64) -> QuotaWindow {
        QuotaWindow {
            key: "five_hour".into(),
            label: "Session (5h)".into(),
            used_percent,
            resets_at: resets_at.map(str::to_string),
            unlimited: false,
            amount: None,
            paid: false,
        }
    }

    #[test]
    fn an_idle_claude_session_is_due_for_a_refresh() {
        let mut idle = connection(Provider::Claude);
        idle.windows = vec![session(None, 0.0)];
        assert!(refresh_due(&idle, Utc::now()));
    }

    #[test]
    fn a_running_claude_session_is_due_only_near_its_reset() {
        let now = DateTime::parse_from_rfc3339("2026-08-26T12:00:00Z")
            .unwrap()
            .with_timezone(&Utc);
        let mut running = connection(Provider::Claude);
        running.windows = vec![session(Some("2026-08-26T16:00:00Z"), 40.0)];
        assert!(!refresh_due(&running, now));
        running.windows = vec![session(Some("2026-08-26T12:03:00Z"), 40.0)];
        assert!(refresh_due(&running, now));
    }

    #[test]
    fn an_idle_claude_session_gets_a_ping() {
        let connection = connection(Provider::Claude);
        let reading = QuotaReading {
            source: "test".into(),
            identity: None,
            windows: vec![session(None, 0.0)],
            reset_credits: None,
        };
        assert!(!claude_ping_blocked(
            &connection,
            &reading,
            &reading.windows[0],
            Utc::now()
        ));
    }

    #[test]
    fn a_recent_ping_blocks_the_next_claude_ping() {
        let now = Utc::now();
        let mut connection = connection(Provider::Claude);
        connection.auto_ping.last_ping_at = Some((now - Duration::minutes(5)).to_rfc3339());
        let reading = QuotaReading {
            source: "test".into(),
            identity: None,
            windows: vec![session(None, 0.0)],
            reset_credits: None,
        };
        assert!(claude_ping_blocked(
            &connection,
            &reading,
            &reading.windows[0],
            now
        ));
    }

    #[test]
    fn codex_requires_a_sliding_reset() {
        assert!(ping_reset_key("2026-08-26T17:00:00Z", "2026-08-26T17:00:20Z").is_none());
        assert!(ping_reset_key("2026-08-26T17:00:00Z", "2026-08-26T17:01:00Z").is_some());
    }

    #[test]
    fn a_long_exhausted_window_blocks_the_ping() {
        let windows = vec![
            QuotaWindow {
                key: "primary".into(),
                label: "Session".into(),
                used_percent: 0.0,
                resets_at: None,
                unlimited: false,
                amount: None,
                paid: false,
            },
            QuotaWindow {
                key: "secondary".into(),
                label: "Weekly".into(),
                used_percent: 100.0,
                resets_at: None,
                unlimited: false,
                amount: None,
                paid: false,
            },
        ];
        assert!(has_exhausted_blocking_window(&windows, "primary"));
    }
}
