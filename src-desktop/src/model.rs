use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Provider {
    Claude,
    Codex,
    Copilot,
}

impl Provider {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Claude => "claude",
            Self::Codex => "codex",
            Self::Copilot => "copilot",
        }
    }

    pub fn from_db(value: &str) -> Option<Self> {
        match value {
            "claude" => Some(Self::Claude),
            "codex" => Some(Self::Codex),
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
    pub windows: Vec<QuotaWindow>,
}

/// User preferences stored in the database.
#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    /// Whether the macOS menu bar item is visible.
    pub show_menu_bar_item: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            show_menu_bar_item: true,
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct DashboardState {
    pub mode: String,
    pub connections: Vec<ProviderConnection>,
    pub database_path: String,
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
