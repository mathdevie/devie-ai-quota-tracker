//! Anonymous usage events and crash reports, sent to PostHog (EU).
//!
//! Every event is gated on the `telemetry_enabled` setting and carries a
//! random id that is unrelated to any account or machine. Events never
//! include account names, tokens, quota numbers, or user labels.
//!
//! The project key comes from `POSTHOG_API_KEY` at build time. A build
//! without a key sends nothing, so local development stays silent.

use std::time::Duration;

use serde_json::{json, Value};

use crate::db::Database;

const API_KEY: Option<&str> = option_env!("POSTHOG_API_KEY");
const CAPTURE_URL: &str = "https://eu.i.posthog.com/i/v0/e/";

#[derive(Clone)]
pub struct Telemetry {
    database: Database,
    client: reqwest::Client,
    version: String,
}

impl Telemetry {
    pub fn new(database: Database, version: String) -> Self {
        // A short timeout: telemetry must never hold up the app.
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(5))
            .build()
            .unwrap_or_default();
        Self {
            database,
            client,
            version,
        }
    }

    /// Whether this build carries a key and the user left telemetry on.
    fn enabled(&self) -> bool {
        API_KEY.is_some()
            && self
                .database
                .settings()
                .map(|settings| settings.telemetry_enabled)
                .unwrap_or(false)
    }

    /// Sends one event in the background. Errors are dropped on purpose.
    pub fn capture(&self, event: &'static str, properties: Value) {
        let Some(payload) = self.payload(event, properties) else {
            return;
        };
        let client = self.client.clone();
        tauri::async_runtime::spawn(async move {
            let _ = client.post(CAPTURE_URL).json(&payload).send().await;
        });
    }

    /// Sends one event and waits for it, for the moments right before the
    /// process ends (a panic). Bounded by the client timeout.
    pub fn capture_blocking(&self, event: &'static str, properties: Value) {
        let Some(payload) = self.payload(event, properties) else {
            return;
        };
        let client = self.client.clone();
        let worker = std::thread::spawn(move || {
            tauri::async_runtime::block_on(async move {
                let _ = client.post(CAPTURE_URL).json(&payload).send().await;
            });
        });
        let _ = worker.join();
    }

    fn payload(&self, event: &str, properties: Value) -> Option<Value> {
        if !self.enabled() {
            return None;
        }
        let api_key = API_KEY?;
        let distinct_id = self.database.telemetry_id().ok()?;
        let mut properties = match properties {
            Value::Object(map) => map,
            _ => serde_json::Map::new(),
        };
        properties.insert("$lib".into(), json!("devie-quota"));
        properties.insert("$app_version".into(), json!(self.version));
        properties.insert("$os".into(), json!(os_name()));
        properties.insert("arch".into(), json!(std::env::consts::ARCH));
        if let Ok(Some(locale)) = self.database.language() {
            properties.insert("$locale".into(), json!(locale));
        }
        // Anonymous events: PostHog keeps no person profile for them.
        properties.insert("$process_person_profile".into(), json!(false));
        Some(json!({
            "api_key": api_key,
            "event": event,
            "distinct_id": distinct_id,
            "timestamp": chrono::Utc::now().to_rfc3339(),
            "properties": properties,
        }))
    }

    /// Reports a panic as a PostHog exception, then lets it continue.
    pub fn install_panic_hook(&self) {
        let telemetry = self.clone();
        let previous = std::panic::take_hook();
        std::panic::set_hook(Box::new(move |info| {
            let message = if let Some(text) = info.payload().downcast_ref::<&str>() {
                (*text).to_string()
            } else if let Some(text) = info.payload().downcast_ref::<String>() {
                text.clone()
            } else {
                "panic".to_string()
            };
            let location = info
                .location()
                .map(|place| format!("{}:{}", place.file(), place.line()));
            telemetry.capture_blocking(
                "$exception",
                json!({
                    "$exception_list": [{
                        "type": "panic",
                        "value": message,
                        "mechanism": { "handled": false, "synthetic": false },
                    }],
                    "$exception_source": location,
                }),
            );
            previous(info);
        }));
    }
}

fn os_name() -> &'static str {
    match std::env::consts::OS {
        "macos" => "Mac OS X",
        "windows" => "Windows",
        "linux" => "Linux",
        other => other,
    }
}
