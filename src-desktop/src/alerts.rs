use chrono::{DateTime, Duration, Timelike, Utc};
use tauri::AppHandle;
use tauri_plugin_notification::NotificationExt;

use crate::{
    db::Database,
    messages,
    model::{Provider, ProviderConnection, QuotaReading, QuotaWindow},
};

const LOW_QUOTA_REMAINING_PERCENT: f64 = 20.0;
const RESET_SOON_MINUTES: i64 = 30;

#[derive(Debug, PartialEq, Eq)]
struct Notice {
    event_key: String,
    kind: &'static str,
    title: String,
    body: String,
}

pub fn after_reading(
    app: &AppHandle,
    database: &Database,
    connection: &ProviderConnection,
    reading: &QuotaReading,
) {
    let locale = database
        .language()
        .ok()
        .flatten()
        .unwrap_or_else(|| messages::DEFAULT_LOCALE.to_string());
    for notice in notices(&locale, connection, reading, Utc::now()) {
        let Ok(true) = database.claim_notification(&notice.event_key, &connection.id, notice.kind)
        else {
            continue;
        };
        if app
            .notification()
            .builder()
            .title(&notice.title)
            .body(&notice.body)
            .show()
            .is_err()
        {
            database.release_notification_claim(&notice.event_key);
        }
    }
}

fn notices(
    locale: &str,
    connection: &ProviderConnection,
    reading: &QuotaReading,
    now: DateTime<Utc>,
) -> Vec<Notice> {
    let mut notices = Vec::new();
    let account = account_name(connection);
    let provider = provider_name(&connection.provider);

    for window in &reading.windows {
        let reset_scope = window
            .resets_at
            .as_deref()
            .and_then(parse_time)
            .map(minute_key)
            .unwrap_or_else(|| now.date_naive().to_string());
        let remaining = (100.0 - window.used_percent).clamp(0.0, 100.0);

        if connection.alerts.low_quota && remaining <= LOW_QUOTA_REMAINING_PERCENT {
            notices.push(Notice {
                event_key: format!(
                    "low:{}:{}:{}:{}",
                    connection.id, window.key, reset_scope, LOW_QUOTA_REMAINING_PERCENT
                ),
                kind: "low_quota",
                title: messages::t(
                    locale,
                    "Notifications.LowQuotaTitle",
                    &[("provider", provider)],
                ),
                body: messages::t(
                    locale,
                    "Notifications.LowQuotaBody",
                    &[
                        ("account", &account),
                        ("percent", &format!("{remaining:.0}")),
                        ("window", &window.label),
                    ],
                ),
            });
        }

        if connection.alerts.reset_soon {
            if let Some(reset) = window.resets_at.as_deref().and_then(parse_time) {
                let until = reset - now;
                if until > Duration::zero() && until <= Duration::minutes(RESET_SOON_MINUTES) {
                    notices.push(Notice {
                        event_key: format!(
                            "reset_soon:{}:{}:{}",
                            connection.id, window.key, reset_scope
                        ),
                        kind: "reset_soon",
                        title: messages::t(
                            locale,
                            "Notifications.ResetSoonTitle",
                            &[("provider", provider)],
                        ),
                        body: messages::t(
                            locale,
                            "Notifications.ResetSoonBody",
                            &[
                                ("window", &window.label),
                                ("account", &account),
                                ("minutes", &until.num_minutes().max(1).to_string()),
                            ],
                        ),
                    });
                }
            }
        }

        if connection.alerts.reset_happened {
            if let Some(previous) = connection
                .windows
                .iter()
                .find(|previous| previous.key == window.key)
            {
                if reset_happened(previous, window, now) {
                    let previous_scope = previous
                        .resets_at
                        .as_deref()
                        .and_then(parse_time)
                        .map(minute_key)
                        .unwrap_or(reset_scope.clone());
                    notices.push(Notice {
                        event_key: format!(
                            "reset_happened:{}:{}:{}",
                            connection.id, window.key, previous_scope
                        ),
                        kind: "reset_happened",
                        title: messages::t(
                            locale,
                            "Notifications.ResetHappenedTitle",
                            &[("provider", provider)],
                        ),
                        body: messages::t(
                            locale,
                            "Notifications.ResetHappenedBody",
                            &[("window", &window.label), ("account", &account)],
                        ),
                    });
                }
            }
        }
    }
    notices
}

fn reset_happened(previous: &QuotaWindow, current: &QuotaWindow, now: DateTime<Utc>) -> bool {
    let Some(previous_reset) = previous.resets_at.as_deref().and_then(parse_time) else {
        return false;
    };
    if previous_reset > now + Duration::minutes(1) {
        return false;
    }
    let reset_moved = current
        .resets_at
        .as_deref()
        .and_then(parse_time)
        .is_some_and(|current_reset| current_reset - previous_reset >= Duration::seconds(30));
    reset_moved || current.used_percent + 5.0 <= previous.used_percent
}

fn parse_time(value: &str) -> Option<DateTime<Utc>> {
    DateTime::parse_from_rfc3339(value)
        .ok()
        .map(|value| value.with_timezone(&Utc))
}

fn minute_key(value: DateTime<Utc>) -> String {
    value
        .with_second(0)
        .and_then(|value| value.with_nanosecond(0))
        .unwrap_or(value)
        .to_rfc3339()
}

fn account_name(connection: &ProviderConnection) -> String {
    connection
        .custom_label
        .clone()
        .or_else(|| {
            connection
                .identity
                .as_ref()
                .and_then(|identity| identity.display_name.clone())
        })
        .unwrap_or_else(|| connection.label.clone())
}

fn provider_name(provider: &Provider) -> &'static str {
    match provider {
        Provider::Claude => "Claude",
        Provider::Codex => "Codex",
        Provider::Gemini => "Gemini",
        Provider::Copilot => "Copilot",
        Provider::Cursor => "Cursor",
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::{AutoPingState, ConnectionAlerts, ConnectionStatus, RemoteIdentity};

    fn connection(alerts: ConnectionAlerts, previous: QuotaWindow) -> ProviderConnection {
        ProviderConnection {
            id: "one".into(),
            provider: Provider::Claude,
            label: "Claude account".into(),
            source_locator: "oauth/claude/one".into(),
            enabled: true,
            status: ConnectionStatus::Ready,
            source: "test".into(),
            last_updated_at: None,
            last_error: None,
            custom_label: Some("Work".into()),
            identity: Some(RemoteIdentity::default()),
            alerts,
            auto_ping: AutoPingState::default(),
            windows: vec![previous],
            reset_credits: Vec::new(),
        }
    }

    #[test]
    fn creates_each_selected_alert() {
        let now = DateTime::parse_from_rfc3339("2026-08-26T12:00:00Z")
            .unwrap()
            .with_timezone(&Utc);
        let previous = QuotaWindow {
            key: "five_hour".into(),
            label: "Session (5h)".into(),
            used_percent: 90.0,
            resets_at: Some("2026-08-26T11:59:00Z".into()),
        };
        let connection = connection(
            ConnectionAlerts {
                low_quota: true,
                reset_soon: true,
                reset_happened: true,
            },
            previous,
        );
        let reading = QuotaReading {
            source: "test".into(),
            identity: None,
            windows: vec![QuotaWindow {
                key: "five_hour".into(),
                label: "Session (5h)".into(),
                used_percent: 85.0,
                resets_at: Some("2026-08-26T12:20:00Z".into()),
            }],
            reset_credits: None,
        };
        let notices = notices("fr-FR", &connection, &reading, now);
        assert_eq!(notices.len(), 3);
        assert!(notices
            .iter()
            .any(|notice| notice.title == "Le quota Claude est faible"));
        assert!(notices.iter().any(|notice| notice.kind == "low_quota"));
        assert!(notices.iter().any(|notice| notice.kind == "reset_soon"));
        assert!(notices.iter().any(|notice| notice.kind == "reset_happened"));
    }

    #[test]
    fn skips_unselected_alerts() {
        let now = Utc::now();
        let window = QuotaWindow {
            key: "five_hour".into(),
            label: "Session".into(),
            used_percent: 99.0,
            resets_at: Some((now + Duration::minutes(5)).to_rfc3339()),
        };
        let connection = connection(ConnectionAlerts::default(), window.clone());
        let reading = QuotaReading {
            source: "test".into(),
            identity: None,
            windows: vec![window],
            reset_credits: None,
        };
        assert!(notices("en-US", &connection, &reading, now).is_empty());
    }
}
