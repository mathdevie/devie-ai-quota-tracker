//! Community reset news for Codex, from codex-resets.com.
//!
//! The site tracks the reset announcements of OpenAI staff on X and publishes
//! a read-only API: the latest reset, an AI-classified forecast ("watch"),
//! and aggregate statistics. It is not affiliated with OpenAI. The app reads
//! `/api/v1/status` only, caches it for a while, and never sends account data.
//! Spec: https://codex-resets.com/api/openapi.json

use std::{
    sync::Arc,
    time::{Duration, Instant},
};

use chrono::Utc;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::{oauth::USER_AGENT, parse::number};

pub const STATUS_URL: &str = "https://codex-resets.com/api/v1/status";
/// The API allows 30 s client caching; the news changes a few times a week.
const CACHE_FOR: Duration = Duration::from_secs(10 * 60);
/// The status body is about 1 KB. Anything far bigger is not the API.
const MAX_BODY_BYTES: usize = 256 * 1024;

/// One reset announcement.
#[derive(Clone, Debug, Default, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ResetNews {
    /// The source X post id, or an "observed-…" id. Stable across reads.
    pub id: String,
    pub announced_at: String,
    /// "regular" for a reset, "banked" for a granted reset credit.
    pub reset_type: String,
    pub text: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub source_url: Option<String>,
}

/// An active forecast of a coming reset.
#[derive(Clone, Debug, Default, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ResetWatch {
    /// "elevated" or "strong".
    pub level: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub reset_chance_percent: Option<u8>,
    /// Free text from the site, for example "by end of thursday".
    pub forecast_window: String,
    pub observed_at: String,
    pub expires_at: String,
    pub text: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub source_url: Option<String>,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ResetStats {
    pub total: u64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub last_reset_at: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub days_since_last: Option<f64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub avg_interval_days: Option<f64>,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct CodexResetsStatus {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub latest_reset: Option<ResetNews>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub active_watch: Option<ResetWatch>,
    pub stats: ResetStats,
    pub site_url: String,
    pub fetched_at: String,
}

/// The last good answer, shared by every window of the app.
#[derive(Clone, Default)]
pub struct Cache(Arc<tokio::sync::Mutex<Option<(Instant, CodexResetsStatus)>>>);

/// Reads the status, from the cache when it is fresh.
pub async fn status(client: &reqwest::Client, cache: &Cache) -> Result<CodexResetsStatus, String> {
    let mut slot = cache.0.lock().await;
    if let Some((at, value)) = slot.as_ref() {
        if at.elapsed() < CACHE_FOR {
            return Ok(value.clone());
        }
    }
    match fetch(client).await {
        Ok(value) => {
            *slot = Some((Instant::now(), value.clone()));
            Ok(value)
        }
        // A stale answer beats an empty popover.
        Err(error) => slot.as_ref().map(|(_, value)| value.clone()).ok_or(error),
    }
}

/// The shared client follows redirects; this third-party endpoint gets a
/// client that does not, so the answer always comes from codex-resets.com.
async fn fetch(client: &reqwest::Client) -> Result<CodexResetsStatus, String> {
    let strict = reqwest::Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .timeout(Duration::from_secs(20))
        .build()
        .unwrap_or_else(|_| client.clone());
    let mut response = strict
        .get(STATUS_URL)
        .header(reqwest::header::ACCEPT, "application/json")
        .header(reqwest::header::USER_AGENT, USER_AGENT)
        .send()
        .await
        .map_err(|_| "codex-resets.com could not be reached.".to_string())?;
    if !response.status().is_success() {
        return Err(format!(
            "codex-resets.com answered with status {}.",
            response.status().as_u16()
        ));
    }
    let too_big = || "codex-resets.com returned too much data.".to_string();
    if response.content_length().is_some_and(|len| len > MAX_BODY_BYTES as u64) {
        return Err(too_big());
    }
    let mut body = Vec::new();
    while let Some(chunk) = response
        .chunk()
        .await
        .map_err(|_| "codex-resets.com could not be reached.".to_string())?
    {
        if body.len() + chunk.len() > MAX_BODY_BYTES {
            return Err(too_big());
        }
        body.extend_from_slice(&chunk);
    }
    let json: Value = serde_json::from_slice(&body)
        .map_err(|_| "codex-resets.com returned invalid data.".to_string())?;
    parse(&json)
}

pub fn parse(json: &Value) -> Result<CodexResetsStatus, String> {
    let data = json
        .get("data")
        .and_then(Value::as_object)
        .ok_or_else(|| "codex-resets.com returned no status.".to_string())?;
    let stats = data.get("stats").cloned().unwrap_or(Value::Null);
    Ok(CodexResetsStatus {
        latest_reset: data.get("latest_reset").and_then(reset_news),
        active_watch: data.get("active_watch").and_then(reset_watch),
        stats: ResetStats {
            total: number(stats.get("total")).unwrap_or(0.0).max(0.0) as u64,
            last_reset_at: text(stats.get("last_reset_at")),
            days_since_last: number(stats.get("days_since_last")),
            avg_interval_days: number(stats.get("avg_interval_days")),
        },
        site_url: "https://codex-resets.com/".to_string(),
        fetched_at: Utc::now().to_rfc3339(),
    })
}

fn reset_news(value: &Value) -> Option<ResetNews> {
    let object = value.as_object()?;
    Some(ResetNews {
        id: text(object.get("id"))?,
        announced_at: text(object.get("announced_at"))?,
        reset_type: text(object.get("reset_type")).unwrap_or_else(|| "regular".to_string()),
        text: text(object.get("text")).unwrap_or_default(),
        source_url: source_url(object.get("source")),
    })
}

fn reset_watch(value: &Value) -> Option<ResetWatch> {
    let object = value.as_object()?;
    Some(ResetWatch {
        level: text(object.get("level")).unwrap_or_else(|| "elevated".to_string()),
        reset_chance_percent: number(object.get("reset_chance_percent"))
            .map(|value| value.clamp(0.0, 100.0) as u8),
        forecast_window: text(object.get("forecast_window")).unwrap_or_default(),
        observed_at: text(object.get("observed_at"))?,
        expires_at: text(object.get("expires_at"))?,
        text: text(object.get("text")).unwrap_or_default(),
        source_url: source_url(object.get("source")),
    })
}

/// Only web links leave the app; anything else is dropped.
fn source_url(source: Option<&Value>) -> Option<String> {
    text(source?.get("url")).filter(|url| url.starts_with("https://"))
}

fn text(value: Option<&Value>) -> Option<String> {
    value
        .and_then(Value::as_str)
        .filter(|value| !value.is_empty())
        .map(str::to_string)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_the_live_status_shape() {
        let json: Value = serde_json::from_str(
            r#"{"data":{"latest_reset":{"id":"observed-20260825T143200Z","reset_type":"regular",
                "announced_at":"2026-08-25T14:30:00.000Z","text":"Ah yeah, forgot to say",
                "source":{"type":"observed","url":"https://x.com/thsottiaux/status/1"}},
              "active_watch":{"level":"strong","reset_chance_percent":60,"forecast_window":"by end of thursday",
                "observed_at":"2026-08-27T06:31:31.000Z","expires_at":"2026-08-28T07:00:00.000Z",
                "text":"Intrigued to see if I can find it tomorrow","source":{"type":"x_post","author":"thsottiaux","url":"https://x.com/thsottiaux/status/2"}},
              "stats":{"total":46,"last_reset_at":"2026-08-25T14:30:00.000Z","days_since_last":1.8,"avg_interval_days":7.6}},
              "meta":{"api_version":"v1","generated_at":"2026-08-27T09:04:36.405Z"}}"#,
        )
        .expect("json");
        let status = parse(&json).expect("status");
        let watch = status.active_watch.expect("watch");
        assert_eq!(watch.reset_chance_percent, Some(60));
        assert_eq!(watch.forecast_window, "by end of thursday");
        assert_eq!(
            watch.source_url.as_deref(),
            Some("https://x.com/thsottiaux/status/2")
        );
        let reset = status.latest_reset.expect("reset");
        assert_eq!(reset.id, "observed-20260825T143200Z");
        assert_eq!(reset.announced_at, "2026-08-25T14:30:00.000Z");
        assert_eq!(status.stats.total, 46);
        assert_eq!(status.stats.avg_interval_days, Some(7.6));
    }

    #[test]
    fn accepts_a_quiet_period_and_drops_unsafe_links() {
        let json = serde_json::json!({
            "data": {
                "latest_reset": {"id": "1", "announced_at": "2026-08-25T14:30:00Z", "source": {"type": "observed", "url": "javascript:alert(1)"}},
                "active_watch": null,
                "stats": {"total": 0, "last_reset_at": null, "days_since_last": null, "avg_interval_days": null}
            },
            "meta": {"api_version": "v1", "generated_at": "2026-08-27T09:04:36Z"}
        });
        let status = parse(&json).expect("status");
        assert!(status.active_watch.is_none());
        assert!(status.latest_reset.expect("reset").source_url.is_none());
        assert_eq!(status.stats.total, 0);
    }

    #[test]
    fn drops_a_watch_without_times() {
        let json = serde_json::json!({
            "data": {
                "latest_reset": null,
                "active_watch": {"level": "strong", "forecast_window": "soon", "expires_at": "2026-08-28T07:00:00Z"},
                "stats": {"total": 1}
            }
        });
        assert!(parse(&json).expect("status").active_watch.is_none());
    }

    #[test]
    fn rejects_a_body_without_data() {
        assert!(parse(&serde_json::json!({"error": "nope"})).is_err());
    }
}
