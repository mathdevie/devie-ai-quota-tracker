//! Small JSON helpers shared by the provider quota parsers.

use serde_json::Value;

pub fn number(value: Option<&Value>) -> Option<f64> {
    match value {
        Some(Value::Number(value)) => value.as_f64(),
        Some(Value::String(value)) => value.parse().ok(),
        _ => None,
    }
}

/// Accepts RFC 3339 text, or a Unix timestamp in seconds or milliseconds.
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
