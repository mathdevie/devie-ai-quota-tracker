mod claude;
mod codex;
pub mod copilot;

use std::path::Path;

use serde_json::{Map, Value};

use crate::model::{ConnectionKind, Provider, ProviderConnection, QuotaReading};

pub async fn refresh(
    connection: &ProviderConnection,
    app_data_dir: &Path,
    client: &reqwest::Client,
) -> Result<QuotaReading, String> {
    if connection.kind == ConnectionKind::Oauth {
        return crate::oauth::refresh_quota(connection, app_data_dir, client).await;
    }
    match connection.provider {
        Provider::Claude => claude::refresh(connection, app_data_dir).await,
        Provider::Codex => codex::refresh(connection).await,
        Provider::Copilot => copilot::refresh(connection, client).await,
    }
}

pub fn number(value: Option<&Value>) -> Option<f64> {
    match value {
        Some(Value::Number(value)) => value.as_f64(),
        Some(Value::String(value)) => value.parse().ok(),
        _ => None,
    }
}

pub fn reset_time(value: Option<&Value>) -> Option<String> {
    let value = value?;
    if let Some(text) = value.as_str() {
        if chrono::DateTime::parse_from_rfc3339(text).is_ok() {
            return Some(text.to_string());
        }
        if let Ok(timestamp) = text.parse::<f64>() {
            return timestamp_string(timestamp);
        }
        return Some(text.to_string());
    }
    value.as_f64().and_then(timestamp_string)
}

fn timestamp_string(timestamp: f64) -> Option<String> {
    let seconds = if timestamp > 1_000_000_000_000.0 {
        timestamp / 1000.0
    } else {
        timestamp
    };
    chrono::DateTime::from_timestamp(seconds as i64, 0).map(|date| date.to_rfc3339())
}

fn find_object_with_key<'a>(value: &'a Value, key: &str) -> Option<&'a Map<String, Value>> {
    match value {
        Value::Object(object) => {
            if let Some(found) = object.get(key).and_then(Value::as_object) {
                return Some(found);
            }
            object
                .values()
                .find_map(|child| find_object_with_key(child, key))
        }
        Value::Array(array) => array
            .iter()
            .find_map(|child| find_object_with_key(child, key)),
        _ => None,
    }
}
