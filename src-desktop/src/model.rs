use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Provider {
    Claude,
    Codex,
    #[serde(rename = "gemini-cli")]
    Gemini,
    Copilot,
}

impl Provider {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Claude => "claude",
            Self::Codex => "codex",
            Self::Gemini => "gemini-cli",
            Self::Copilot => "copilot",
        }
    }

    pub fn from_db(value: &str) -> Option<Self> {
        match value {
            "claude" => Some(Self::Claude),
            "codex" => Some(Self::Codex),
            "gemini-cli" => Some(Self::Gemini),
            "copilot" => Some(Self::Copilot),
            _ => None,
        }
    }
}

/// How the app reaches a connection's credentials.
#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ConnectionKind {
    /// The app holds OAuth tokens it obtained itself.
    Oauth,
    /// A provider CLI on this Mac owns the credentials.
    Local,
}

impl ConnectionKind {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Oauth => "oauth",
            Self::Local => "local",
        }
    }

    pub fn from_db(value: &str) -> Self {
        match value {
            "oauth" => Self::Oauth,
            _ => Self::Local,
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ConnectionStatus {
    Ready,
    Stale,
    NeedsLogin,
    Error,
}

impl ConnectionStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Ready => "ready",
            Self::Stale => "stale",
            Self::NeedsLogin => "needs_login",
            Self::Error => "error",
        }
    }

    pub fn from_db(value: &str) -> Self {
        match value {
            "ready" => Self::Ready,
            "stale" => Self::Stale,
            "needs_login" => Self::NeedsLogin,
            _ => Self::Error,
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct QuotaWindow {
    pub key: String,
    pub label: String,
    pub used_percent: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub resets_at: Option<String>,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct RemoteIdentity {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub provider_user_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub display_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub plan: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ProviderConnection {
    pub id: String,
    pub provider: Provider,
    pub kind: ConnectionKind,
    pub label: String,
    pub source_locator: String,
    pub enabled: bool,
    pub status: ConnectionStatus,
    pub source: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_updated_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_error: Option<String>,
    /// A name the user typed for this account. Shown instead of the identity.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub custom_label: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub identity: Option<RemoteIdentity>,
    pub alerts: ConnectionAlerts,
    pub auto_ping: AutoPingState,
    pub windows: Vec<QuotaWindow>,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ConnectionAlerts {
    pub low_quota: bool,
    pub reset_soon: bool,
    pub reset_happened: bool,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct AutoPingState {
    pub enabled: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_ping_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_error: Option<String>,
    #[serde(skip)]
    pub last_reset_key: Option<String>,
    #[serde(skip)]
    pub observed_reset_at: Option<String>,
    #[serde(skip)]
    pub last_attempt_at: Option<String>,
}

/// The quota window the menu bar item shows: one provider logo and one percent.
#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct TraySummary {
    pub connection_id: String,
    pub window_key: String,
}

/// User preferences stored in the database.
#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    /// Whether the macOS menu bar item is visible.
    pub show_menu_bar_item: bool,
    /// None: the menu bar shows the window with the least quota left.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub tray_summary: Option<TraySummary>,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            show_menu_bar_item: true,
            tray_summary: None,
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct DashboardState {
    pub mode: String,
    pub connections: Vec<ProviderConnection>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub refreshed_at: Option<String>,
    pub settings: AppSettings,
}

#[derive(Clone, Debug)]
pub struct DiscoveredConnection {
    pub id: String,
    pub provider: Provider,
    pub kind: ConnectionKind,
    pub label: String,
    pub source_locator: String,
    pub identity: Option<RemoteIdentity>,
}

#[derive(Clone, Debug)]
pub struct QuotaReading {
    pub source: String,
    pub identity: Option<RemoteIdentity>,
    pub windows: Vec<QuotaWindow>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn gemini_uses_the_interface_provider_id() {
        assert_eq!(Provider::Gemini.as_str(), "gemini-cli");
        assert_eq!(
            serde_json::to_string(&Provider::Gemini).expect("serialize"),
            "\"gemini-cli\""
        );
        assert_eq!(Provider::from_db("gemini-cli"), Some(Provider::Gemini));
    }
}
