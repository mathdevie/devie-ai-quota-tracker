use std::{
    fs::File,
    io::{Read, Seek, SeekFrom},
    path::{Path, PathBuf},
    time::{Duration, SystemTime},
};

use regex::Regex;
use serde_json::{Map, Value};
use walkdir::WalkDir;

use crate::{
    model::{ProviderConnection, QuotaReading, QuotaWindow, RemoteIdentity},
    providers::{find_object_with_key, number, reset_time},
    pty::run_slash_command,
};

pub async fn refresh(connection: &ProviderConnection) -> Result<QuotaReading, String> {
    let connection = connection.clone();
    tauri::async_runtime::spawn_blocking(move || {
        parse_latest_local(Path::new(&connection.source_locator))
            .or_else(|_| probe_cli(&connection))
    })
    .await
    .map_err(|_| "The Codex quota task stopped early.".to_string())?
}

fn parse_latest_local(config_dir: &Path) -> Result<QuotaReading, String> {
    let session_root = config_dir.join("sessions");
    let latest = newest_jsonl(&session_root)
        .ok_or_else(|| "No Codex session record contains quota data.".to_string())?;
    let text = read_tail(&latest, 2 * 1024 * 1024)?;
    for line in text.lines().rev() {
        let Ok(json) = serde_json::from_str::<Value>(line) else {
            continue;
        };
        let Some(limits) = find_object_with_key(&json, "rate_limits") else {
            continue;
        };
        if let Ok(reading) = parse_rate_limits(limits) {
            return Ok(reading);
        }
    }
    Err("The latest Codex session has no quota snapshot.".to_string())
}

fn newest_jsonl(root: &Path) -> Option<PathBuf> {
    let mut newest: Option<(SystemTime, PathBuf)> = None;
    for entry in WalkDir::new(root).follow_links(false).into_iter().flatten() {
        let path = entry.path();
        if !entry.file_type().is_file()
            || path.extension().and_then(|value| value.to_str()) != Some("jsonl")
        {
            continue;
        }
        let modified = entry.metadata().ok()?.modified().ok()?;
        if newest.as_ref().is_none_or(|(time, _)| modified > *time) {
            newest = Some((modified, path.to_path_buf()));
        }
    }
    newest.map(|(_, path)| path)
}

fn read_tail(path: &Path, maximum: u64) -> Result<String, String> {
    let mut file =
        File::open(path).map_err(|_| "The Codex session record could not open.".to_string())?;
    let length = file.metadata().map_err(|error| error.to_string())?.len();
    let start = length.saturating_sub(maximum);
    file.seek(SeekFrom::Start(start))
        .map_err(|error| error.to_string())?;
    let mut bytes = Vec::new();
    file.read_to_end(&mut bytes)
        .map_err(|error| error.to_string())?;
    let text = String::from_utf8_lossy(&bytes);
    Ok(if start > 0 {
        text.split_once('\n')
            .map(|(_, tail)| tail)
            .unwrap_or_default()
            .to_string()
    } else {
        text.into_owned()
    })
}

fn parse_rate_limits(limits: &Map<String, Value>) -> Result<QuotaReading, String> {
    let mut windows = Vec::new();
    add_window(limits, "primary", "Session (5h)", &mut windows);
    add_window(limits, "secondary", "Weekly", &mut windows);
    if windows.is_empty() {
        return Err("The Codex rate limit record has no quota windows.".to_string());
    }
    let plan = limits
        .get("plan_type")
        .and_then(Value::as_str)
        .map(title_case);
    Ok(QuotaReading {
        source: "Codex local records".to_string(),
        identity: plan.map(|plan| RemoteIdentity {
            provider_user_id: None,
            display_name: None,
            plan: Some(plan),
        }),
        windows,
    })
}

fn add_window(
    limits: &Map<String, Value>,
    key: &str,
    fallback_label: &str,
    windows: &mut Vec<QuotaWindow>,
) {
    let Some(window) = limits.get(key).and_then(Value::as_object) else {
        return;
    };
    let Some(used) = number(
        window
            .get("used_percent")
            .or_else(|| window.get("used_percentage")),
    ) else {
        return;
    };
    let label = number(window.get("window_minutes"))
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
        resets_at: reset_time(window.get("resets_at").or_else(|| window.get("reset_at"))),
    });
}

fn probe_cli(connection: &ProviderConnection) -> Result<QuotaReading, String> {
    let output = run_slash_command(
        "codex",
        &["--no-alt-screen"],
        &[("CODEX_HOME", connection.source_locator.as_str())],
        Path::new(&connection.source_locator),
        "/status",
        &["5h limit", "weekly limit", "data not available yet"],
        Duration::from_secs(10),
    )?;
    parse_cli(&output)
}

fn parse_cli(text: &str) -> Result<QuotaReading, String> {
    let mut windows = Vec::new();
    if let Some(used) = used_near_label(text, "5h limit") {
        windows.push(QuotaWindow {
            key: "primary".into(),
            label: "Session (5h)".into(),
            used_percent: used,
            resets_at: None,
        });
    }
    if let Some(used) = used_near_label(text, "Weekly limit") {
        windows.push(QuotaWindow {
            key: "secondary".into(),
            label: "Weekly".into(),
            used_percent: used,
            resets_at: None,
        });
    }
    if windows.is_empty() {
        return Err("Codex did not show quota data. Run `codex` and check `/status`.".to_string());
    }
    Ok(QuotaReading {
        source: "Codex /status".into(),
        identity: None,
        windows,
    })
}

fn used_near_label(text: &str, label: &str) -> Option<f64> {
    let lower = text.to_lowercase();
    let index = lower.rfind(&label.to_lowercase())?;
    let line = text.get(index..)?.lines().next()?;
    let regex = Regex::new(r"(?i)([0-9]{1,3}(?:\.[0-9]+)?)\s*%\s*(left|remaining|used)?").ok()?;
    let captures = regex.captures(line)?;
    let value = captures
        .get(1)?
        .as_str()
        .parse::<f64>()
        .ok()?
        .clamp(0.0, 100.0);
    let qualifier = captures.get(2).map(|value| value.as_str().to_lowercase());
    if matches!(qualifier.as_deref(), Some("used")) {
        Some(value)
    } else {
        Some(100.0 - value)
    }
}

fn title_case(value: &str) -> String {
    value
        .split(['-', '_'])
        .map(|part| {
            let mut chars = part.chars();
            chars
                .next()
                .map(|first| first.to_uppercase().collect::<String>() + chars.as_str())
                .unwrap_or_default()
        })
        .collect::<Vec<_>>()
        .join(" ")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_local_codex_rate_limits() {
        let json: Value = serde_json::from_str(
            r#"{"primary":{"used_percent":26,"window_minutes":300,"resets_at":1788000000},"secondary":{"used_percent":54,"window_minutes":10080},"plan_type":"plus"}"#,
        )
        .expect("fixture");
        let reading = parse_rate_limits(json.as_object().expect("object")).expect("reading");
        assert_eq!(reading.windows[0].label, "Session (5h)");
        assert_eq!(reading.windows[1].used_percent, 54.0);
        assert_eq!(
            reading.identity.and_then(|value| value.plan),
            Some("Plus".into())
        );
    }

    #[test]
    fn parses_codex_status_percent_left() {
        let reading =
            parse_cli("5h limit 64% left (02:00)\nWeekly limit 21% left").expect("status reading");
        assert_eq!(reading.windows[0].used_percent, 36.0);
        assert_eq!(reading.windows[1].used_percent, 79.0);
    }
}
