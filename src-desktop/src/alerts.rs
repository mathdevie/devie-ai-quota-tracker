use chrono::{DateTime, Duration, Timelike, Utc};
use tauri::AppHandle;

use crate::{
    db::Database,
    messages,
    model::{Provider, ProviderConnection, QuotaReading, QuotaWindow},
    notify,
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
        if notify::show(app, &notice.title, &notice.body).is_err() {
            database.release_notification_claim(&notice.event_key);
        }
    }
}

/// Shows one notification right away so the user sees the feature work and
/// macOS asks for the notification permission at once.
pub fn send_test(
    app: &AppHandle,
    database: &Database,
    connection: &ProviderConnection,
) -> Result<(), String> {
    let locale = database
        .language()
        .ok()
        .flatten()
        .unwrap_or_else(|| messages::DEFAULT_LOCALE.to_string());
    let provider = provider_name(&connection.provider);
    let title = messages::t(
        &locale,
        "Notifications.TestTitle",
        &[("provider", provider)],
    );
    let body = messages::t(
        &locale,
        "Notifications.TestBody",
        &[("account", &account_name(connection))],
    );
    notify::show(app, &title, &body)
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
        Provider::Antigravity => "Antigravity",
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
            hidden_windows: Vec::new(),
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
            unlimited: false,
            amount: None,
            paid: false,
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
                unlimited: false,
                amount: None,
                paid: false,
            }],
            reset_credits: None,
            observed_at: None,
            stale: false,
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
            unlimited: false,
            amount: None,
            paid: false,
        };
        let connection = connection(ConnectionAlerts::default(), window.clone());
        let reading = QuotaReading {
            source: "test".into(),
            identity: None,
            windows: vec![window],
            reset_credits: None,
            observed_at: None,
            stale: false,
        };
        assert!(notices("en-US", &connection, &reading, now).is_empty());
    }

    fn fixed_now() -> DateTime<Utc> {
        parse_time("2026-10-27T12:00:00Z").unwrap()
    }

    fn reading(window: QuotaWindow) -> QuotaReading {
        QuotaReading {
            source: "fixture".into(),
            identity: None,
            windows: vec![window],
            reset_credits: None,
            observed_at: None,
            stale: false,
        }
    }

    #[test]
    fn low_quota_threshold_is_inclusive_and_clamps_overage() {
        let account = connection(
            ConnectionAlerts {
                low_quota: true,
                ..Default::default()
            },
            QuotaWindow::default(),
        );
        for (used_percent, expected) in [(79.9, 0), (80.0, 1), (100.0, 1), (150.0, 1), (-10.0, 0)] {
            let reading = reading(QuotaWindow {
                used_percent,
                key: "session".into(),
                ..Default::default()
            });
            let result = notices("en-US", &account, &reading, fixed_now());
            assert_eq!(result.len(), expected, "used={used_percent}");
            if used_percent > 100.0 {
                assert!(result[0].body.contains("0%"));
            }
        }
    }

    #[test]
    fn reset_soon_requires_a_future_reset_within_thirty_minutes() {
        let account = connection(
            ConnectionAlerts {
                reset_soon: true,
                ..Default::default()
            },
            QuotaWindow::default(),
        );
        for (seconds, expected) in [(-1, 0), (0, 0), (1, 1), (1800, 1), (1801, 0)] {
            let reading = reading(QuotaWindow {
                resets_at: Some((fixed_now() + Duration::seconds(seconds)).to_rfc3339()),
                ..Default::default()
            });
            let result = notices("en-US", &account, &reading, fixed_now());
            assert_eq!(result.len(), expected, "seconds={seconds}");
            if seconds == 1 {
                assert!(result[0].body.contains('1'));
            }
        }
        for resets_at in [None, Some("invalid date".into())] {
            assert!(notices(
                "en-US",
                &account,
                &reading(QuotaWindow {
                    resets_at,
                    ..Default::default()
                }),
                fixed_now()
            )
            .is_empty());
        }
    }

    #[test]
    fn reset_detection_rejects_jitter_and_premature_usage_drops() {
        let mut previous = QuotaWindow {
            used_percent: 80.0,
            resets_at: Some(fixed_now().to_rfc3339()),
            ..Default::default()
        };
        for (moved_seconds, used_percent, expected) in [
            (29, 80.0, false),
            (30, 80.0, true),
            (0, 75.1, false),
            (0, 75.0, true),
        ] {
            let current = QuotaWindow {
                used_percent,
                resets_at: Some((fixed_now() + Duration::seconds(moved_seconds)).to_rfc3339()),
                ..Default::default()
            };
            assert_eq!(reset_happened(&previous, &current, fixed_now()), expected);
        }
        let current = QuotaWindow {
            used_percent: 0.0,
            ..Default::default()
        };
        previous.resets_at = Some((fixed_now() + Duration::seconds(61)).to_rfc3339());
        assert!(!reset_happened(&previous, &current, fixed_now()));
        previous.resets_at = Some((fixed_now() + Duration::seconds(60)).to_rfc3339());
        assert!(reset_happened(&previous, &current, fixed_now()));
        previous.resets_at = Some("invalid".into());
        assert!(!reset_happened(&previous, &current, fixed_now()));
        previous.resets_at = None;
        assert!(!reset_happened(&previous, &current, fixed_now()));
    }

    #[test]
    fn dedupe_keys_ignore_second_jitter_but_separate_accounts_windows_and_reset_cycles() {
        let mut account = connection(
            ConnectionAlerts {
                low_quota: true,
                ..Default::default()
            },
            QuotaWindow::default(),
        );
        let mut reading = reading(QuotaWindow {
            key: "session".into(),
            used_percent: 90.0,
            resets_at: Some("2026-10-27T12:30:01Z".into()),
            ..Default::default()
        });
        let key = notices("en-US", &account, &reading, fixed_now())[0]
            .event_key
            .clone();
        reading.windows[0].resets_at = Some("2026-10-27T14:30:59+02:00".into());
        assert_eq!(
            notices("fr-FR", &account, &reading, fixed_now())[0].event_key,
            key
        );
        reading.windows[0].resets_at = Some("2026-10-27T12:31:00Z".into());
        assert_ne!(
            notices("en-US", &account, &reading, fixed_now())[0].event_key,
            key
        );
        reading.windows[0].resets_at = Some("2026-10-27T12:30:01Z".into());
        reading.windows[0].key = "weekly".into();
        assert_ne!(
            notices("en-US", &account, &reading, fixed_now())[0].event_key,
            key
        );
        reading.windows[0].key = "session".into();
        account.id = "two".into();
        assert_ne!(
            notices("en-US", &account, &reading, fixed_now())[0].event_key,
            key
        );
    }

    #[test]
    fn undated_low_quota_notices_are_deduplicated_per_day() {
        let account = connection(
            ConnectionAlerts {
                low_quota: true,
                ..Default::default()
            },
            QuotaWindow::default(),
        );
        let reading = reading(QuotaWindow {
            used_percent: 90.0,
            ..Default::default()
        });
        let key = notices("en-US", &account, &reading, fixed_now())[0]
            .event_key
            .clone();
        assert_eq!(
            notices(
                "en-US",
                &account,
                &reading,
                fixed_now() + Duration::hours(1)
            )[0]
            .event_key,
            key
        );
        assert_ne!(
            notices("en-US", &account, &reading, fixed_now() + Duration::days(1))[0].event_key,
            key
        );
    }
}
