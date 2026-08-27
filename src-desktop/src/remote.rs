//! The remote dashboard: a small HTTP server that serves the same interface
//! to other devices, for example behind a Cloudflare Tunnel or on the local
//! network. Off by default.
//!
//! The pages come from the frontend that the windows show. The API is read
//! and refresh only, behind one bearer token. Sign-in, rename, alerts, and
//! removal stay in the desktop app.

use std::{
    net::{IpAddr, Ipv4Addr, SocketAddr, UdpSocket},
    sync::{Arc, Mutex},
    time::Duration,
};

use axum::{
    body::Body,
    extract::{Path, State},
    http::{header, HeaderMap, StatusCode, Uri},
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use rand::{distributions::Alphanumeric, Rng};
use serde_json::json;
use tauri::{AppHandle, Manager};
use tokio::sync::oneshot;

use crate::{
    codex_resets,
    model::{DashboardState, RemoteAccess},
    Core,
};

/// The lowest port a user can pick. Lower ports need root on macOS.
pub const MIN_PORT: u16 = 1024;

/// Holds the running listener, so that a settings change can stop it.
#[derive(Clone, Default)]
pub struct Server {
    inner: Arc<Mutex<Inner>>,
}

#[derive(Default)]
struct Inner {
    running: Option<Running>,
    error: Option<String>,
}

struct Running {
    shutdown: oneshot::Sender<()>,
    urls: Vec<String>,
}

impl Server {
    /// Starts, restarts, or stops the server so that it matches `settings`.
    /// A start failure (for example a port in use) is stored for the
    /// interface and returned.
    pub async fn apply(&self, app: &AppHandle, settings: &RemoteAccess) -> Result<(), String> {
        self.stop();
        if !settings.enabled {
            return Ok(());
        }
        match bind(settings).await {
            Ok(listener) => {
                let (shutdown, signal) = oneshot::channel();
                let router = router(app.clone());
                tauri::async_runtime::spawn(async move {
                    let _ = axum::serve(listener, router)
                        .with_graceful_shutdown(async {
                            let _ = signal.await;
                        })
                        .await;
                });
                let mut inner = self.inner.lock().expect("remote server lock");
                inner.running = Some(Running {
                    shutdown,
                    urls: urls(settings),
                });
                inner.error = None;
                Ok(())
            }
            Err(message) => {
                self.inner.lock().expect("remote server lock").error = Some(message.clone());
                Err(message)
            }
        }
    }

    fn stop(&self) {
        let mut inner = self.inner.lock().expect("remote server lock");
        if let Some(running) = inner.running.take() {
            let _ = running.shutdown.send(());
        }
        inner.error = None;
    }

    /// Adds the live addresses and the last start error to the settings.
    pub fn decorate(&self, access: &mut RemoteAccess) {
        let inner = self.inner.lock().expect("remote server lock");
        access.urls = inner
            .running
            .as_ref()
            .map(|running| running.urls.clone())
            .unwrap_or_default();
        access.error = inner.error.clone();
    }
}

/// A new random token. Alphanumeric, so that it fits in a URL fragment.
pub fn new_token() -> String {
    rand::thread_rng()
        .sample_iter(Alphanumeric)
        .take(40)
        .map(char::from)
        .collect()
}

/// Binds the port. The previous listener on the same port closes on a
/// separate task, so a restart tries a few times.
async fn bind(settings: &RemoteAccess) -> Result<tokio::net::TcpListener, String> {
    let ip = if settings.lan {
        Ipv4Addr::UNSPECIFIED
    } else {
        Ipv4Addr::LOCALHOST
    };
    let address = SocketAddr::from((ip, settings.port));
    let mut last_error = None;
    for _ in 0..10 {
        match tokio::net::TcpListener::bind(address).await {
            Ok(listener) => return Ok(listener),
            Err(error) => {
                last_error = Some(error);
                tokio::time::sleep(Duration::from_millis(50)).await;
            }
        }
    }
    let error = last_error.expect("at least one bind attempt");
    Err(match error.kind() {
        std::io::ErrorKind::AddrInUse => {
            format!("Port {} is in use. Pick another port.", settings.port)
        }
        std::io::ErrorKind::PermissionDenied => {
            format!(
                "Port {} needs a system permission. Pick a port above 1023.",
                settings.port
            )
        }
        _ => format!(
            "The server could not listen on port {}: {error}",
            settings.port
        ),
    })
}

/// The addresses to show the user. On the local network, the primary
/// interface address comes first.
fn urls(settings: &RemoteAccess) -> Vec<String> {
    let mut urls = Vec::new();
    if settings.lan {
        if let Some(ip) = primary_ip() {
            urls.push(format!("http://{ip}:{}", settings.port));
        }
    }
    urls.push(format!("http://localhost:{}", settings.port));
    urls
}

/// The address of the interface with the default route. A connected UDP
/// socket sends nothing; the OS only picks the source address.
fn primary_ip() -> Option<IpAddr> {
    let socket = UdpSocket::bind("0.0.0.0:0").ok()?;
    socket.connect("192.0.2.1:9").ok()?;
    socket
        .local_addr()
        .ok()
        .map(|address| address.ip())
        .filter(|ip| !ip.is_unspecified() && !ip.is_loopback())
}

fn router(app: AppHandle) -> Router {
    Router::new()
        .route("/api/state", get(state))
        .route("/api/refresh", post(refresh_all))
        .route("/api/refresh/{id}", post(refresh_one))
        .route("/api/codex-resets", get(codex_resets_status))
        .fallback(get(asset))
        .with_state(app)
}

type ApiError = (StatusCode, Json<serde_json::Value>);

fn api_error(status: StatusCode, message: impl Into<String>) -> ApiError {
    (status, Json(json!({ "error": message.into() })))
}

fn internal(message: String) -> ApiError {
    api_error(StatusCode::INTERNAL_SERVER_ERROR, message)
}

/// Checks the `Authorization: Bearer <token>` header against the stored token.
fn authorize(core: &Core, headers: &HeaderMap) -> Result<(), ApiError> {
    let expected = core
        .database
        .settings()
        .map_err(internal)?
        .remote_access
        .token
        .ok_or_else(|| {
            api_error(
                StatusCode::UNAUTHORIZED,
                "The remote dashboard has no token.",
            )
        })?;
    let presented = headers
        .get(header::AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.strip_prefix("Bearer "))
        .map(str::trim)
        .unwrap_or_default();
    if constant_time_eq(presented.as_bytes(), expected.as_bytes()) {
        Ok(())
    } else {
        Err(api_error(
            StatusCode::UNAUTHORIZED,
            "The access token is wrong.",
        ))
    }
}

/// Compares two byte strings without an early exit on the first difference.
fn constant_time_eq(a: &[u8], b: &[u8]) -> bool {
    if a.len() != b.len() {
        return false;
    }
    a.iter().zip(b).fold(0u8, |acc, (x, y)| acc | (x ^ y)) == 0
}

/// The dashboard state for a remote page: same data, no token.
fn remote_state(state: DashboardState) -> DashboardState {
    let mut state = state;
    state.mode = "remote".to_string();
    state.settings.remote_access.token = None;
    state
}

async fn state(
    State(app): State<AppHandle>,
    headers: HeaderMap,
) -> Result<Json<DashboardState>, ApiError> {
    let core = app.state::<Core>().inner().clone();
    authorize(&core, &headers)?;
    let state = crate::current_state(&core).map_err(internal)?;
    Ok(Json(remote_state(state)))
}

async fn refresh_all(
    State(app): State<AppHandle>,
    headers: HeaderMap,
) -> Result<Json<DashboardState>, ApiError> {
    let core = app.state::<Core>().inner().clone();
    authorize(&core, &headers)?;
    let state = crate::refresh_all_internal(&app, true)
        .await
        .map_err(internal)?;
    Ok(Json(remote_state(state)))
}

async fn refresh_one(
    State(app): State<AppHandle>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<DashboardState>, ApiError> {
    let core = app.state::<Core>().inner().clone();
    authorize(&core, &headers)?;
    let state = crate::refresh_connection_internal(&app, &id)
        .await
        .map_err(|message| api_error(StatusCode::NOT_FOUND, message))?;
    Ok(Json(remote_state(state)))
}

async fn codex_resets_status(
    State(app): State<AppHandle>,
    headers: HeaderMap,
) -> Result<Json<codex_resets::CodexResetsStatus>, ApiError> {
    let core = app.state::<Core>().inner().clone();
    authorize(&core, &headers)?;
    let status = codex_resets::status(&core.client, &core.codex_resets)
        .await
        .map_err(|message| api_error(StatusCode::BAD_GATEWAY, message))?;
    Ok(Json(status))
}

/// Serves the frontend files the app windows use. In a packaged app they
/// are embedded in the binary; `tauri dev` reads the `out/` export.
async fn asset(State(app): State<AppHandle>, uri: Uri) -> Response {
    let path = uri.path().to_string();
    let Some(asset) = resolve_asset(&app, &path) else {
        return (StatusCode::NOT_FOUND, "Not found").into_response();
    };
    // Next.js puts a content hash in every `_next/static` file name.
    let cache = if path.starts_with("/_next/static/") {
        "public, max-age=31536000, immutable"
    } else {
        "no-cache"
    };
    let mut response = Response::builder()
        .header(header::CONTENT_TYPE, asset.mime_type)
        .header(header::CACHE_CONTROL, cache);
    if let Some(csp) = asset.csp_header {
        response = response.header(header::CONTENT_SECURITY_POLICY, csp);
    }
    response
        .body(Body::from(asset.bytes))
        .unwrap_or_else(|_| StatusCode::INTERNAL_SERVER_ERROR.into_response())
}

/// Looks the path up like the app windows do: a folder gives its
/// `index.html`, a page name gives its `.html` file, and every other path
/// gives the single-page app. The embedded assets do this on their own; the
/// `tauri dev` fallback reads files by their exact name only.
fn resolve_asset(app: &AppHandle, path: &str) -> Option<tauri::Asset> {
    // The `tauri dev` resolver reads files by path, so a `..` segment must
    // never reach it.
    if path.split('/').any(|segment| segment == "..") {
        return None;
    }
    let resolver = app.asset_resolver();
    asset_candidates(path)
        .into_iter()
        .find_map(|candidate| resolver.get(candidate))
}

fn asset_candidates(path: &str) -> Vec<String> {
    let mut candidates = Vec::new();
    if path.ends_with('/') {
        candidates.push(format!("{path}index.html"));
    } else {
        candidates.push(path.to_string());
        candidates.push(format!("{path}.html"));
    }
    if !candidates
        .iter()
        .any(|candidate| candidate == "/index.html")
    {
        candidates.push("/index.html".to_string());
    }
    candidates
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn asset_lookup_falls_back_to_the_page() {
        assert_eq!(asset_candidates("/"), vec!["/index.html"]);
        assert_eq!(
            asset_candidates("/_next/static/a.js"),
            vec![
                "/_next/static/a.js",
                "/_next/static/a.js.html",
                "/index.html"
            ]
        );
        assert_eq!(
            asset_candidates("/quota/"),
            vec!["/quota/index.html", "/index.html"]
        );
    }

    #[test]
    fn tokens_are_long_and_url_safe() {
        let token = new_token();
        assert_eq!(token.len(), 40);
        assert!(token.chars().all(|c| c.is_ascii_alphanumeric()));
        assert_ne!(token, new_token());
    }

    #[test]
    fn compares_tokens_by_content() {
        assert!(constant_time_eq(b"abc", b"abc"));
        assert!(!constant_time_eq(b"abc", b"abd"));
        assert!(!constant_time_eq(b"abc", b"abcd"));
        assert!(!constant_time_eq(b"", b"a"));
    }

    #[test]
    fn remote_state_hides_the_token() {
        let mut state = DashboardState {
            mode: "native".into(),
            connections: Vec::new(),
            refreshed_at: None,
            settings: Default::default(),
        };
        state.settings.remote_access.token = Some("secret".into());
        let state = remote_state(state);
        assert_eq!(state.mode, "remote");
        assert_eq!(state.settings.remote_access.token, None);
    }

    #[test]
    fn urls_always_include_localhost() {
        let settings = RemoteAccess {
            port: 5000,
            lan: false,
            ..RemoteAccess::default()
        };
        assert_eq!(urls(&settings), vec!["http://localhost:5000".to_string()]);
        let settings = RemoteAccess {
            lan: true,
            ..settings
        };
        let urls = urls(&settings);
        assert_eq!(
            urls.last().map(String::as_str),
            Some("http://localhost:5000")
        );
        assert!(urls.len() <= 2);
    }
}
