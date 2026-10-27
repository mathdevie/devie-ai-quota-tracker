//! Provider failures retain their meaning until the UI boundary. Response
//! bodies and tokens are never used as user-facing errors.
use crate::model::ConnectionStatus;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ErrorKind {
    AccessExpired,
    NeedsLogin,
    Forbidden,
    RateLimited,
    Transport,
    InvalidResponse,
    Other,
}

#[derive(Clone, Debug, thiserror::Error)]
#[error("{message}")]
pub struct ProviderError {
    pub kind: ErrorKind,
    pub message: String,
}

impl ProviderError {
    pub fn new(kind: ErrorKind, message: impl Into<String>) -> Self {
        Self {
            kind,
            message: message.into(),
        }
    }
    pub fn invalid(message: impl Into<String>) -> Self {
        Self::new(ErrorKind::InvalidResponse, message)
    }
    pub fn needs_login(message: impl Into<String>) -> Self {
        Self::new(ErrorKind::NeedsLogin, message)
    }
    pub fn status(&self, has_reading: bool) -> ConnectionStatus {
        match self.kind {
            ErrorKind::AccessExpired | ErrorKind::NeedsLogin => ConnectionStatus::NeedsLogin,
            _ if has_reading => ConnectionStatus::Stale,
            _ => ConnectionStatus::Error,
        }
    }
    pub fn transient(&self) -> bool {
        matches!(self.kind, ErrorKind::Transport | ErrorKind::RateLimited)
    }
    pub fn http(provider: &str, status: reqwest::StatusCode, body: &str) -> Self {
        let json: serde_json::Value = serde_json::from_str(body).unwrap_or_default();
        let code = json
            .pointer("/error/code")
            .or_else(|| json.get("error"))
            .and_then(|v| v.as_str())
            .unwrap_or("");
        let kind = if matches!(
            code,
            "invalid_grant"
                | "refresh_token_expired"
                | "refresh_token_reused"
                | "refresh_token_invalidated"
        ) {
            ErrorKind::NeedsLogin
        } else {
            match status.as_u16() {
                401 => ErrorKind::AccessExpired,
                403 => ErrorKind::Forbidden,
                429 => ErrorKind::RateLimited,
                500..=599 => ErrorKind::Transport,
                _ => ErrorKind::Other,
            }
        };
        let message = match kind {
            ErrorKind::NeedsLogin => {
                format!("The {provider} login can no longer be renewed. Sign in again.")
            }
            ErrorKind::AccessExpired => {
                format!("The {provider} access token expired. Sign in again.")
            }
            ErrorKind::Forbidden => {
                format!("{provider} does not allow access to this resource (HTTP 403).")
            }
            ErrorKind::RateLimited => {
                format!("{provider} rate-limited this request. Try again later.")
            }
            _ => format!(
                "{provider} returned HTTP {}. Try again later.",
                status.as_u16()
            ),
        };
        Self::new(kind, message)
    }
}

impl From<String> for ProviderError {
    fn from(message: String) -> Self {
        Self::new(ErrorKind::Other, message)
    }
}
impl From<reqwest::Error> for ProviderError {
    fn from(_: reqwest::Error) -> Self {
        Self::new(
            ErrorKind::Transport,
            "The provider could not be reached. Try again later.",
        )
    }
}
impl From<ProviderError> for String {
    fn from(error: ProviderError) -> Self {
        error.message
    }
}

pub async fn json(
    request: reqwest::RequestBuilder,
    provider: &str,
) -> Result<serde_json::Value, ProviderError> {
    let response = request.send().await?;
    let status = response.status();
    let text = response.text().await?;
    if !status.is_success() {
        return Err(ProviderError::http(provider, status, &text));
    }
    serde_json::from_str(&text)
        .map_err(|_| ProviderError::invalid(format!("{provider} returned invalid data.")))
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn only_authentication_failures_require_sign_in() {
        for (status, kind) in [
            (401, ErrorKind::AccessExpired),
            (403, ErrorKind::Forbidden),
            (429, ErrorKind::RateLimited),
            (503, ErrorKind::Transport),
        ] {
            let error = ProviderError::http(
                "Provider",
                reqwest::StatusCode::from_u16(status).unwrap(),
                "sensitive response",
            );
            assert_eq!(error.kind, kind);
            assert_eq!(
                error.status(true),
                if status == 401 {
                    ConnectionStatus::NeedsLogin
                } else {
                    ConnectionStatus::Stale
                }
            );
            assert!(!error.message.contains("sensitive"));
        }
        let error = ProviderError::http(
            "Provider",
            reqwest::StatusCode::BAD_REQUEST,
            r#"{"error":{"code":"refresh_token_reused"}}"#,
        );
        assert_eq!(error.kind, ErrorKind::NeedsLogin);
    }
}
