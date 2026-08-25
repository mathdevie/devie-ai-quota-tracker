use std::{fs, path::Path, time::Duration};

use regex::Regex;
use serde_json::{Map, Value};
use uuid::Uuid;

use crate::{
    model::{ProviderConnection, QuotaReading, QuotaWindow, RemoteIdentity},
    providers::{find_object_with_key, number, reset_time},
    pty::run_slash_command,
};

pub async fn refresh(
    connection: &ProviderConnection,
    app_data_dir: &Path,
) -> Result<QuotaReading, String> {
    let capture_path = app_data_dir
        .join("captures")
        .join(format!("{}.json", connection.id));
    if let Ok(data) = fs::read(&capture_path) {
        if let Ok(reading) = parse_passive(&data) {
            return Ok(reading);
        }
    }

    let connection = connection.clone();
    tauri::async_runtime::spawn_blocking(move || probe_cli(&connection))
        .await
        .map_err(|_| "The Claude quota task stopped early.".to_string())?
}

fn parse_passive(data: &[u8]) -> Result<QuotaReading, String> {
    let json: Value = serde_json::from_slice(data)
        .map_err(|_| "The Claude status capture is not valid JSON.".to_string())?;
    let limits = find_object_with_key(&json, "rate_limits")
        .ok_or_else(|| "The Claude status capture has no quota limits.".to_string())?;
    let mut windows = Vec::new();
    add_passive_window(limits, "five_hour", "Current session", &mut windows);
    add_passive_window(limits, "seven_day", "Weekly limit", &mut windows);
    if windows.is_empty() {
        return Err("The Claude status capture has no active quota windows.".to_string());
    }

    let account = find_object_with_key(&json, "account");
    let identity = account.map(|value| RemoteIdentity {
        provider_user_id: string_field(value, &["id", "account_id"]),
        display_name: string_field(value, &["display_name", "email", "organization"]),
        plan: string_field(value, &["plan", "subscription_type"]),
    });
    Ok(QuotaReading {
        source: "Claude Code status line".to_string(),
        identity,
        windows,
    })
}

fn add_passive_window(
    limits: &Map<String, Value>,
    key: &str,
    label: &str,
    windows: &mut Vec<QuotaWindow>,
) {
    let Some(window) = limits.get(key).and_then(Value::as_object) else {
        return;
    };
    let used = number(
        window
            .get("used_percentage")
            .or_else(|| window.get("used_percent")),
    );
    let Some(used) = used else { return };
    windows.push(QuotaWindow {
        key: key.to_string(),
        label: label.to_string(),
        used_percent: used.clamp(0.0, 100.0),
        resets_at: reset_time(window.get("resets_at").or_else(|| window.get("reset_at"))),
    });
}

fn string_field(object: &Map<String, Value>, keys: &[&str]) -> Option<String> {
    keys.iter()
        .find_map(|key| object.get(*key).and_then(Value::as_str))
        .map(str::to_string)
}

fn probe_cli(connection: &ProviderConnection) -> Result<QuotaReading, String> {
    let session_id = Uuid::new_v5(&Uuid::NAMESPACE_URL, connection.id.as_bytes()).to_string();
    let args = [
        "--allowed-tools",
        "",
        "--strict-mcp-config",
        "--session-id",
        session_id.as_str(),
    ];
    let output = run_slash_command(
        "claude",
        &args,
        &[("CLAUDE_CONFIG_DIR", connection.source_locator.as_str())],
        Path::new(&connection.source_locator),
        "/usage",
        &["current session", "current week", "failed to load usage"],
        Duration::from_secs(20),
    )?;
    parse_cli(&output)
}

fn parse_cli(text: &str) -> Result<QuotaReading, String> {
    let session = percent_near_label(text, "Current session");
    let weekly = percent_near_label(text, "Current week (all models)")
        .or_else(|| percent_near_label(text, "Weekly limit"));
    let mut windows = Vec::new();
    if let Some(used) = session {
        windows.push(QuotaWindow {
            key: "five_hour".to_string(),
            label: "Current session".to_string(),
            used_percent: used,
            resets_at: None,
        });
    }
    if let Some(used) = weekly {
        windows.push(QuotaWindow {
            key: "seven_day".to_string(),
            label: "Weekly limit".to_string(),
            used_percent: used,
            resets_at: None,
        });
    }
    if windows.is_empty() {
        return Err(
            "Claude Code did not show subscription quota data. Run `claude` and check `/usage`."
                .to_string(),
        );
    }
    Ok(QuotaReading {
        source: "Claude Code /usage".to_string(),
        identity: None,
        windows,
    })
}

fn percent_near_label(text: &str, label: &str) -> Option<f64> {
    let lower = text.to_lowercase();
    let index = lower.rfind(&label.to_lowercase())?;
    let tail = text
        .get(index..)?
        .lines()
        .take(12)
        .collect::<Vec<_>>()
        .join(" ");
    let regex =
        Regex::new(r"(?i)([0-9]{1,3}(?:\.[0-9]+)?)\s*%\s*(used|left|remaining|available)?").ok()?;
    let captures = regex.captures(&tail)?;
    let percent = captures
        .get(1)?
        .as_str()
        .parse::<f64>()
        .ok()?
        .clamp(0.0, 100.0);
    let qualifier = captures.get(2).map(|value| value.as_str().to_lowercase());
    if matches!(
        qualifier.as_deref(),
        Some("left" | "remaining" | "available")
    ) {
        Some(100.0 - percent)
    } else {
        Some(percent)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_passive_rate_limits() {
        let reading = parse_passive(
            br#"{"rate_limits":{"five_hour":{"used_percentage":37,"resets_at":"2026-08-25T15:00:00Z"},"seven_day":{"used_percentage":61,"resets_at":1788000000}}}"#,
        )
        .expect("Claude reading");
        assert_eq!(reading.windows.len(), 2);
        assert_eq!(reading.windows[0].used_percent, 37.0);
    }

    #[test]
    fn parses_cli_remaining_percent() {
        let reading = parse_cli("Current session\n42% left\nCurrent week (all models)\n70% left")
            .expect("CLI reading");
        assert_eq!(reading.windows[0].used_percent, 58.0);
        assert_eq!(reading.windows[1].used_percent, 30.0);
    }
}
