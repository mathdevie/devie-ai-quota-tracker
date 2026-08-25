mod credentials;
mod db;
mod discovery;
mod executable;
mod model;
mod oauth;
mod providers;
mod pty;

use std::{path::PathBuf, time::Duration};

use db::Database;
use model::{ConnectionStatus, DashboardState};
use oauth::{LoginSessions, LoginStart};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager, State, WebviewUrl, WebviewWindowBuilder,
};
use tauri_plugin_positioner::{Position, WindowExt};

#[derive(Clone)]
struct Core {
    database: Database,
    app_data_dir: PathBuf,
    client: reqwest::Client,
    logins: LoginSessions,
}

#[tauri::command]
fn get_dashboard_state(core: State<'_, Core>) -> Result<DashboardState, String> {
    core.database.dashboard_state()
}

#[tauri::command]
async fn discover_connections(app: AppHandle) -> Result<DashboardState, String> {
    let core = app.state::<Core>().inner().clone();
    sync_discovery(&core).await?;
    publish_state(&app, &core)
}

#[tauri::command]
async fn start_login(app: AppHandle, provider: String) -> Result<LoginStart, String> {
    let core = app.state::<Core>().inner().clone();
    let provider = model::Provider::from_db(&provider)
        .ok_or_else(|| "This provider is not supported.".to_string())?;
    let (start, pending) = oauth::start(&core.client, provider).await?;
    core.logins.insert(start.session_id.clone(), pending);
    Ok(start)
}

#[tauri::command]
async fn finish_login(
    app: AppHandle,
    session_id: String,
    code: Option<String>,
) -> Result<DashboardState, String> {
    let core = app.state::<Core>().inner().clone();
    let pending = core
        .logins
        .take(&session_id)
        .ok_or_else(|| "The sign-in session ended. Start again.".to_string())?;
    let provider = pending.provider.clone();
    let outcome = oauth::finish(&core.client, pending, code).await?;
    let connection = oauth::connection_for(&provider, &outcome);
    core.database.upsert_discovered(&[connection.clone()])?;
    core.database.set_enabled(&connection.id, true)?;
    credentials::save(&core.app_data_dir, &connection.id, &outcome.credentials)?;
    if let Some(connection) = core.database.connection_by_id(&connection.id)? {
        refresh_one(&core, &connection, true).await;
    }
    publish_state(&app, &core)
}

#[tauri::command]
fn cancel_login(core: State<'_, Core>, session_id: String) {
    drop(core.logins.take(&session_id));
}

#[tauri::command]
fn remove_connection(
    app: AppHandle,
    core: State<'_, Core>,
    connection_id: String,
) -> Result<DashboardState, String> {
    let connection = core
        .database
        .connection_by_id(&connection_id)?
        .ok_or_else(|| "The connection does not exist.".to_string())?;
    if connection.kind != model::ConnectionKind::Oauth {
        return Err(
            "This connection comes from a CLI on this Mac. Disable it instead.".to_string(),
        );
    }
    core.database.delete_connection(&connection_id)?;
    credentials::remove(&core.app_data_dir, &connection_id);
    publish_state(&app, &core)
}

#[tauri::command]
async fn refresh_all(app: AppHandle) -> Result<DashboardState, String> {
    refresh_all_internal(&app, true).await
}

#[tauri::command]
async fn refresh_connection(
    app: AppHandle,
    connection_id: String,
) -> Result<DashboardState, String> {
    let core = app.state::<Core>().inner().clone();
    let connection = core
        .database
        .connection_by_id(&connection_id)?
        .ok_or_else(|| "The connection does not exist.".to_string())?;
    refresh_one(&core, &connection, true).await;
    publish_state(&app, &core)
}

#[tauri::command]
fn set_connection_enabled(
    app: AppHandle,
    core: State<'_, Core>,
    connection_id: String,
    enabled: bool,
) -> Result<DashboardState, String> {
    core.database.set_enabled(&connection_id, enabled)?;
    publish_state(&app, &core)
}

#[tauri::command]
fn rename_connection(
    app: AppHandle,
    core: State<'_, Core>,
    connection_id: String,
    label: Option<String>,
) -> Result<DashboardState, String> {
    core.database
        .set_custom_label(&connection_id, label.as_deref())?;
    publish_state(&app, &core)
}

#[tauri::command]
fn set_menu_bar_item_visible(
    app: AppHandle,
    core: State<'_, Core>,
    visible: bool,
) -> Result<DashboardState, String> {
    core.database.set_show_menu_bar_item(visible)?;
    apply_tray_visibility(&app, visible);
    publish_state(&app, &core)
}

fn apply_tray_visibility(app: &AppHandle, visible: bool) {
    if let Some(tray) = app.tray_by_id("main-tray") {
        let _ = tray.set_visible(visible);
    }
}

#[tauri::command]
fn open_main_window(app: AppHandle) -> Result<(), String> {
    show_main_window(&app)
}

#[tauri::command]
fn hide_popover(app: AppHandle) -> Result<(), String> {
    app.get_webview_window("popover")
        .ok_or_else(|| "The quota popover does not exist.".to_string())?
        .hide()
        .map_err(|error| error.to_string())
}

/// Runs CLI discovery off the main thread and syncs the database with it.
async fn sync_discovery(core: &Core) -> Result<(), String> {
    let discovered = tauri::async_runtime::spawn_blocking(discovery::discover)
        .await
        .map_err(|_| "Discovery stopped early.".to_string())?;
    core.database.upsert_discovered(&discovered)?;
    core.database.prune_missing_local(&discovered)?;
    Ok(())
}

/// Refreshes every enabled connection. `force` skips the short quota cache,
/// which the user expects from a refresh button but not from the timer.
async fn refresh_all_internal(app: &AppHandle, force: bool) -> Result<DashboardState, String> {
    let core = app.state::<Core>().inner().clone();
    sync_discovery(&core).await?;
    let connections = core.database.dashboard_state()?.connections;
    for connection in connections.into_iter().filter(|item| item.enabled) {
        refresh_one(&core, &connection, force).await;
    }
    publish_state(app, &core)
}

async fn refresh_one(core: &Core, connection: &model::ProviderConnection, force: bool) {
    match providers::refresh(connection, &core.app_data_dir, &core.client, force).await {
        Ok(reading) => {
            let _ = core.database.save_reading(&connection.id, &reading);
        }
        Err(message) => {
            let lower = message.to_lowercase();
            let status = if lower.contains("sign in")
                || lower.contains("login")
                || lower.contains("expired")
            {
                ConnectionStatus::NeedsLogin
            } else if !connection.windows.is_empty() {
                ConnectionStatus::Stale
            } else {
                ConnectionStatus::Error
            };
            let _ = core.database.save_failure(&connection.id, status, &message);
        }
    }
}

fn publish_state(app: &AppHandle, core: &Core) -> Result<DashboardState, String> {
    let state = core.database.dashboard_state()?;
    let _ = app.emit("quota:updated", &state);
    update_tray_title(app, &state);
    Ok(state)
}

fn update_tray_title(app: &AppHandle, state: &DashboardState) {
    let minimum = state
        .connections
        .iter()
        .filter(|connection| connection.enabled)
        .flat_map(|connection| connection.windows.iter())
        .map(|window| (100.0 - window.used_percent).clamp(0.0, 100.0))
        .reduce(f64::min);
    if let Some(tray) = app.tray_by_id("main-tray") {
        let title = minimum.map_or_else(|| "QT —".to_string(), |value| format!("QT {:.0}%", value));
        let _ = tray.set_title(Some(title));
    }
}

fn show_main_window(app: &AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| "The main window does not exist.".to_string())?;
    window.show().map_err(|error| error.to_string())?;
    window.unminimize().map_err(|error| error.to_string())?;
    window.set_focus().map_err(|error| error.to_string())
}

fn toggle_popover(app: &AppHandle) {
    let Some(window) = app.get_webview_window("popover") else {
        return;
    };
    if window.is_visible().unwrap_or(false) {
        let _ = window.hide();
        return;
    }
    let _ = window.move_window(Position::TrayCenter);
    let _ = window.show();
    let _ = window.set_focus();
}

fn build_windows(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let main = WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
        .title("Devie QT")
        .inner_size(1120.0, 760.0)
        .min_inner_size(780.0, 560.0)
        .center();
    // The interface draws its own title bar. macOS keeps the native traffic
    // lights, placed inside the sidebar header.
    #[cfg(target_os = "macos")]
    let main = main
        .title_bar_style(tauri::TitleBarStyle::Overlay)
        .hidden_title(true)
        .traffic_light_position(tauri::LogicalPosition::new(18.0, 20.0));
    main.build()?;

    WebviewWindowBuilder::new(app, "popover", WebviewUrl::App("?surface=popover".into()))
        .title("Devie QT Quotas")
        .inner_size(380.0, 480.0)
        .min_inner_size(320.0, 320.0)
        .max_inner_size(480.0, 760.0)
        .resizable(true)
        .decorations(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .shadow(true)
        .visible(false)
        .build()?;
    Ok(())
}

fn build_tray(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let open = MenuItem::with_id(app, "open", "Open Devie QT", true, None::<&str>)?;
    let refresh = MenuItem::with_id(app, "refresh", "Refresh All", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit Devie QT", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&open, &refresh, &quit])?;
    let mut builder = TrayIconBuilder::with_id("main-tray")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .tooltip("Devie QT subscription quotas")
        .title("QT —")
        .icon_as_template(true)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open" => {
                let _ = show_main_window(app);
            }
            "refresh" => {
                let app = app.clone();
                tauri::async_runtime::spawn(async move {
                    let _ = refresh_all_internal(&app, true).await;
                });
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            tauri_plugin_positioner::on_tray_event(tray.app_handle(), &event);
            if matches!(
                event,
                TrayIconEvent::Click {
                    button: MouseButton::Left,
                    button_state: MouseButtonState::Up,
                    ..
                }
            ) {
                toggle_popover(tray.app_handle());
            }
        });
    if let Some(icon) = app.default_window_icon() {
        builder = builder.icon(icon.clone());
    }
    builder.build(app)?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            let app_data_dir = app.path().app_data_dir()?;
            let database = Database::open(app_data_dir.join("devie-qt.sqlite3"))
                .map_err(std::io::Error::other)?;
            let client = reqwest::Client::builder()
                .timeout(Duration::from_secs(20))
                .build()?;
            app.manage(Core {
                database,
                app_data_dir,
                client,
                logins: LoginSessions::default(),
            });
            build_windows(app)?;
            build_tray(app)?;
            let settings = app.state::<Core>().database.settings().unwrap_or_default();
            apply_tray_visibility(app.handle(), settings.show_menu_bar_item);

            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                loop {
                    let _ = refresh_all_internal(&handle, false).await;
                    tokio::time::sleep(Duration::from_secs(300)).await;
                }
            });
            Ok(())
        })
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } if window.label() == "main" => {
                api.prevent_close();
                let _ = window.hide();
            }
            tauri::WindowEvent::Focused(false) if window.label() == "popover" => {
                let _ = window.hide();
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            get_dashboard_state,
            discover_connections,
            start_login,
            finish_login,
            cancel_login,
            remove_connection,
            refresh_all,
            refresh_connection,
            set_connection_enabled,
            rename_connection,
            set_menu_bar_item_visible,
            open_main_window,
            hide_popover,
        ])
        .run(tauri::generate_context!())
        .expect("Devie QT failed to start");
}
