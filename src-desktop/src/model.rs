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

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum CaptureState {
    Available,
    Installed,
    Unsupported,
}

impl CaptureState {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Available => "available",
            Self::Installed => "installed",
            Self::Unsupported => "unsupported",
        }
    }

    pub fn from_db(value: Option<&str>) -> Option<Self> {
        match value {
            Some("available") => Some(Self::Available),
            Some("installed") => Some(Self::Installed),
            Some("unsupported") => Some(Self::Unsupported),
            _ => None,
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
    pub label: String,
    pub source_locator: String,
    pub enabled: bool,
    pub status: ConnectionStatus,
    pub source: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_updated_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_error: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub capture_state: Option<CaptureState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub identity: Option<RemoteIdentity>,
    pub windows: Vec<QuotaWindow>,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct DashboardState {
    pub mode: String,
    pub connections: Vec<ProviderConnection>,
    pub database_path: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub refreshed_at: Option<String>,
}

#[derive(Clone, Debug)]
pub struct DiscoveredConnection {
    pub id: String,
    pub provider: Provider,
    pub label: String,
    pub source_locator: String,
    pub capture_state: Option<CaptureState>,
    pub identity: Option<RemoteIdentity>,
}

#[derive(Clone, Debug)]
pub struct QuotaReading {
    pub source: String,
    pub identity: Option<RemoteIdentity>,
    pub windows: Vec<QuotaWindow>,
}
