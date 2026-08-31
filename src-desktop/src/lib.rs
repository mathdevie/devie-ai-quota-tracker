mod alerts;
mod auto_ping;
mod codex_resets;
mod credentials;
mod db;
mod messages;
mod model;
mod notify;
mod oauth;
mod parse;
mod telemetry;
mod tray_icons;
mod updater;

use std::{path::PathBuf, sync::Arc, time::Duration};

use db::Database;
use model::{ConnectionAlerts, ConnectionStatus, DashboardState, TraySummary, UpdateChannel};
use oauth::{LoginSessions, LoginStart};
#[cfg(target_os = "macos")]
use tauri::window::{Effect, EffectState, EffectsBuilder};
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
    refresh_gate: Arc<tokio::sync::Mutex<()>>,
    /// The cached codex-resets.com news, shared by every window.
    codex_resets: codex_resets::Cache,
    telemetry: telemetry::Telemetry,
}

#[tauri::command]
fn get_dashboard_state(core: State<'_, Core>) -> Result<DashboardState, String> {
    core.database.dashboard_state()
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
    let outcome = oauth::finish(&core.client, pending, code).await;
    core.logins.finish(&session_id);
    let outcome = outcome?;
    let connection = oauth::connection_for(&provider, &outcome);
    core.database.upsert_connections(&[connection.clone()])?;
    core.database.set_enabled(&connection.id, true)?;
    credentials::save(&core.app_data_dir, &connection.id, &outcome.credentials)?;
    core.telemetry.capture(
        "provider_connected",
        serde_json::json!({ "provider": provider.as_str() }),
    );
    if let Some(connection) = core.database.connection_by_id(&connection.id)? {
        refresh_one(&app, &core, &connection, true).await;
    }
    publish_state(&app, &core)
}

#[tauri::command]
fn cancel_login(core: State<'_, Core>, session_id: String) {
    core.logins.cancel(&session_id);
}

#[tauri::command]
fn remove_connection(
    app: AppHandle,
    core: State<'_, Core>,
    connection_id: String,
) -> Result<DashboardState, String> {
    let provider = core
        .database
        .connection_by_id(&connection_id)?
        .map(|connection| connection.provider.as_str());
    core.database.delete_connection(&connection_id)?;
    credentials::remove(&core.app_data_dir, &connection_id);
    core.telemetry.capture(
        "provider_removed",
        serde_json::json!({ "provider": provider }),
    );
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
    refresh_connection_internal(&app, &connection_id).await
}

async fn refresh_connection_internal(
    app: &AppHandle,
    connection_id: &str,
) -> Result<DashboardState, String> {
    let core = app.state::<Core>().inner().clone();
    let connection = core
        .database
        .connection_by_id(connection_id)?
        .ok_or_else(|| "The connection does not exist.".to_string())?;
    refresh_one(app, &core, &connection, true).await;
    publish_state(app, &core)
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
fn set_connection_alerts(
    app: AppHandle,
    core: State<'_, Core>,
    connection_id: String,
    alerts: ConnectionAlerts,
) -> Result<DashboardState, String> {
    core.database
        .set_connection_alerts(&connection_id, &alerts)?;
    publish_state(&app, &core)
}

/// Runs on the async pool: the native calls wait for the notification daemon.
#[tauri::command]
async fn notification_permission_state() -> String {
    notify::permission_state()
}

#[tauri::command]
async fn request_notification_permission() -> Result<bool, String> {
    notify::request_permission()
}

#[tauri::command]
async fn send_test_notification(
    app: AppHandle,
    core: State<'_, Core>,
    connection_id: String,
) -> Result<(), String> {
    let connection = core
        .database
        .connection_by_id(&connection_id)?
        .ok_or_else(|| "Unknown account".to_string())?;
    alerts::send_test(&app, &core.database, &connection)
}

#[tauri::command]
fn set_hidden_windows(
    app: AppHandle,
    core: State<'_, Core>,
    connection_id: String,
    window_keys: Vec<String>,
) -> Result<DashboardState, String> {
    core.database
        .set_hidden_windows(&connection_id, &window_keys)?;
    publish_state(&app, &core)
}

#[tauri::command]
fn set_auto_ping(
    app: AppHandle,
    core: State<'_, Core>,
    connection_id: String,
    enabled: bool,
) -> Result<DashboardState, String> {
    let connection = core
        .database
        .connection_by_id(&connection_id)?
        .ok_or_else(|| "The connection does not exist.".to_string())?;
    if enabled && !auto_ping::supported(&connection) {
        return Err("The Quota Optimizer supports Claude and Codex accounts only.".to_string());
    }
    core.database
        .set_auto_ping_enabled(&connection_id, enabled)?;
    publish_state(&app, &core)
}

/// Spends one Codex reset credit, then reads the quota again.
#[tauri::command]
async fn use_reset_credit(
    app: AppHandle,
    connection_id: String,
    credit_id: String,
) -> Result<DashboardState, String> {
    let core = app.state::<Core>().inner().clone();
    let connection = core
        .database
        .connection_by_id(&connection_id)?
        .ok_or_else(|| "The connection does not exist.".to_string())?;
    if connection.provider != model::Provider::Codex {
        return Err("Reset credits exist for Codex accounts only.".to_string());
    }
    if !connection
        .reset_credits
        .iter()
        .any(|credit| credit.id == credit_id)
    {
        return Err("This reset credit is not available any more.".to_string());
    }
    let credentials =
        oauth::credentials_for_request(&connection, &core.app_data_dir, &core.client).await?;
    oauth::codex::consume_reset_credit(&core.client, &credentials, &credit_id).await?;
    refresh_one(&app, &core, &connection, true).await;
    publish_state(&app, &core)
}

#[tauri::command]
fn set_tray_summary(
    app: AppHandle,
    core: State<'_, Core>,
    summary: Option<TraySummary>,
) -> Result<DashboardState, String> {
    core.database.set_tray_summary(summary.as_ref())?;
    core.telemetry.capture(
        "setting_changed",
        serde_json::json!({ "setting": "tray_summary", "custom": summary.is_some() }),
    );
    publish_state(&app, &core)
}

#[tauri::command]
fn set_menu_bar_item_visible(
    app: AppHandle,
    core: State<'_, Core>,
    visible: bool,
) -> Result<DashboardState, String> {
    core.database.set_show_menu_bar_item(visible)?;
    core.telemetry.capture(
        "setting_changed",
        serde_json::json!({ "setting": "show_menu_bar_item", "value": visible }),
    );
    apply_tray_visibility(&app, visible);
    publish_state(&app, &core)
}

/// Picks which release channel updates come from.
#[tauri::command]
fn set_update_channel(
    app: AppHandle,
    core: State<'_, Core>,
    pending: State<'_, updater::PendingUpdate>,
    channel: UpdateChannel,
) -> Result<DashboardState, String> {
    core.database.set_update_channel(channel)?;
    core.telemetry.capture(
        "setting_changed",
        serde_json::json!({ "setting": "update_channel", "value": channel.as_str() }),
    );
    // An update found on the old channel must not install any more.
    pending.clear();
    publish_state(&app, &core)
}

/// Turns anonymous usage events and crash reports on or off.
#[tauri::command]
fn set_telemetry_enabled(
    app: AppHandle,
    core: State<'_, Core>,
    enabled: bool,
) -> Result<DashboardState, String> {
    if !enabled {
        // The last event goes out while the setting still allows it.
        core.telemetry.capture(
            "setting_changed",
            serde_json::json!({ "setting": "telemetry_enabled", "value": false }),
        );
    }
    core.database.set_telemetry_enabled(enabled)?;
    if enabled {
        core.telemetry.capture(
            "setting_changed",
            serde_json::json!({ "setting": "telemetry_enabled", "value": true }),
        );
    }
    publish_state(&app, &core)
}

/// Stores the interface language and relabels the tray menu.
#[tauri::command]
fn set_language(app: AppHandle, core: State<'_, Core>, locale: String) -> Result<(), String> {
    if !messages::is_supported(&locale) {
        return Err("This language is not supported.".to_string());
    }
    core.database.set_language(&locale)?;
    core.telemetry.capture(
        "setting_changed",
        serde_json::json!({ "setting": "language", "value": locale }),
    );
    apply_tray_language(&app, &locale).map_err(|error| error.to_string())
}

/// The saved language, else the closest supported system language.
fn current_language(core: &Core) -> String {
    core.database
        .language()
        .ok()
        .flatten()
        .filter(|locale| messages::is_supported(locale))
        .or_else(|| {
            sys_locale::get_locale().and_then(|tag| messages::closest(&tag).map(str::to_string))
        })
        .unwrap_or_else(|| messages::DEFAULT_LOCALE.to_string())
}

fn tray_menu<M: Manager<tauri::Wry>>(manager: &M, locale: &str) -> tauri::Result<Menu<tauri::Wry>> {
    let open = MenuItem::with_id(
        manager,
        "open",
        messages::t(locale, "Tray.Open", &[]),
        true,
        None::<&str>,
    )?;
    let refresh = MenuItem::with_id(
        manager,
        "refresh",
        messages::t(locale, "Tray.RefreshAll", &[]),
        true,
        None::<&str>,
    )?;
    let quit = MenuItem::with_id(
        manager,
        "quit",
        messages::t(locale, "Tray.Quit", &[]),
        true,
        None::<&str>,
    )?;
    Menu::with_items(manager, &[&open, &refresh, &quit])
}

fn apply_tray_language(app: &AppHandle, locale: &str) -> tauri::Result<()> {
    let Some(tray) = app.tray_by_id("main-tray") else {
        return Ok(());
    };
    tray.set_menu(Some(tray_menu(app, locale)?))?;
    tray.set_tooltip(Some(messages::t(locale, "Tray.Tooltip", &[])))
}

fn apply_tray_visibility(app: &AppHandle, visible: bool) {
    if let Some(tray) = app.tray_by_id("main-tray") {
        let _ = tray.set_visible(visible);
    }
}

/// The community reset news shown in the Codex cards.
#[tauri::command]
async fn get_codex_resets_status(
    app: AppHandle,
) -> Result<codex_resets::CodexResetsStatus, String> {
    let core = app.state::<Core>().inner().clone();
    codex_resets::status(&core.client, &core.codex_resets).await
}

/// The sites the reset news links to. Nothing else opens from the app.
const EXTERNAL_HOSTS: &[&str] = &["codex-resets.com", "x.com", "twitter.com"];

/// Opens a web link in the default browser: `https` only, no credentials,
/// a known host, and a sane length.
#[tauri::command]
fn open_external_url(url: String) -> Result<(), String> {
    let parsed = reqwest::Url::parse(&url).map_err(|_| "The link is not valid.".to_string())?;
    let host = parsed.host_str().unwrap_or_default();
    let known = EXTERNAL_HOSTS
        .iter()
        .any(|allowed| host == *allowed || host.ends_with(&format!(".{allowed}")));
    if url.len() > 2048
        || parsed.scheme() != "https"
        || !parsed.username().is_empty()
        || parsed.password().is_some()
        || !known
    {
        return Err("The link cannot open from the app.".to_string());
    }
    open::that_detached(parsed.as_str()).map_err(|_| "The browser could not open.".to_string())
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

/// Refreshes every enabled connection. `force` skips the short quota cache,
/// which the user expects from a refresh button but not from the timer.
async fn refresh_all_internal(app: &AppHandle, force: bool) -> Result<DashboardState, String> {
    let core = app.state::<Core>().inner().clone();
    let connections = core.database.dashboard_state()?.connections;
    for connection in connections.into_iter().filter(|item| item.enabled) {
        refresh_one(app, &core, &connection, force).await;
    }
    publish_state(app, &core)
}

async fn refresh_one(
    app: &AppHandle,
    core: &Core,
    connection: &model::ProviderConnection,
    force: bool,
) {
    let _guard = core.refresh_gate.lock().await;
    let current = core
        .database
        .connection_by_id(&connection.id)
        .ok()
        .flatten()
        .unwrap_or_else(|| connection.clone());
    match oauth::refresh_quota(&current, &core.app_data_dir, &core.client, force).await {
        Ok(reading) => {
            let _ = core.database.save_reading(&current.id, &reading);
            alerts::after_reading(app, &core.database, &current, &reading);
            auto_ping::after_reading(
                &core.database,
                &core.app_data_dir,
                &core.client,
                &current,
                &reading,
            )
            .await;
        }
        Err(message) => {
            let lower = message.to_lowercase();
            let status = if lower.contains("sign in")
                || lower.contains("login")
                || lower.contains("expired")
            {
                ConnectionStatus::NeedsLogin
            } else if !current.windows.is_empty() {
                ConnectionStatus::Stale
            } else {
                ConnectionStatus::Error
            };
            core.telemetry.capture(
                "quota_refresh_failed",
                serde_json::json!({
                    "provider": current.provider.as_str(),
                    "status": status.as_str(),
                    "error_kind": telemetry_error_kind(&message),
                }),
            );
            let _ = core.database.save_failure(&current.id, status, &message);
        }
    }
}

async fn auto_ping_tick(app: &AppHandle) {
    let core = app.state::<Core>().inner().clone();
    let Ok(state) = core.database.dashboard_state() else {
        return;
    };
    let now = chrono::Utc::now();
    let mut refreshed = false;
    for connection in state
        .connections
        .into_iter()
        .filter(|connection| auto_ping::refresh_due(connection, now))
    {
        refresh_one(app, &core, &connection, true).await;
        refreshed = true;
    }
    if refreshed {
        let _ = publish_state(app, &core);
    }
}

/// A coarse class for a refresh error. The message itself may name an
/// account, so it never leaves the machine.
fn telemetry_error_kind(message: &str) -> &'static str {
    let lower = message.to_lowercase();
    if lower.contains("sign in") || lower.contains("login") || lower.contains("expired") {
        "auth"
    } else if lower.contains("timed out") || lower.contains("timeout") {
        "timeout"
    } else if lower.contains("connect") || lower.contains("dns") || lower.contains("network") {
        "network"
    } else if lower.contains("429") || lower.contains("rate limit") {
        "rate_limited"
    } else if lower.contains("500") || lower.contains("502") || lower.contains("503") {
        "server"
    } else if lower.contains("parse") || lower.contains("json") || lower.contains("unexpected") {
        "parse"
    } else {
        "other"
    }
}

fn publish_state(app: &AppHandle, core: &Core) -> Result<DashboardState, String> {
    let state = core.database.dashboard_state()?;
    let _ = app.emit("quota:updated", &state);
    update_tray_title(app, &state);
    Ok(state)
}

/// The window the menu bar summarizes: the user's pick when it still exists,
/// is enabled and is not hidden, else the enabled, visible window with the
/// least quota left.
fn tray_window<'a>(
    state: &'a DashboardState,
) -> Option<(&'a model::ProviderConnection, &'a model::QuotaWindow)> {
    let enabled = || {
        state
            .connections
            .iter()
            .filter(|connection| connection.enabled)
    };
    let picked = state.settings.tray_summary.as_ref().and_then(|summary| {
        let connection = enabled().find(|connection| connection.id == summary.connection_id)?;
        let window = connection
            .windows
            .iter()
            .filter(|window| !connection.hidden_windows.contains(&window.key))
            .find(|window| window.key == summary.window_key)?;
        Some((connection, window))
    });
    picked.or_else(|| {
        enabled()
            .flat_map(|connection| connection.windows.iter().map(move |w| (connection, w)))
            .filter(|(connection, window)| !connection.hidden_windows.contains(&window.key))
            .filter(|(_, window)| !window.paid && !window.unlimited)
            .min_by(|(_, a), (_, b)| a.used_percent.total_cmp(&b.used_percent).reverse())
    })
}

/// Shows one provider logo and its percent left in the menu bar.
fn update_tray_title(app: &AppHandle, state: &DashboardState) {
    let Some(tray) = app.tray_by_id("main-tray") else {
        return;
    };
    match tray_window(state) {
        Some((connection, window)) => {
            let left = (100.0 - window.used_percent).clamp(0.0, 100.0);
            let _ = tray.set_title(Some(format!("{left:.0}%")));
            if let Some(icon) = tray_icons::provider_icon(&connection.provider) {
                let _ = tray.set_icon(Some(icon));
            }
        }
        None => {
            let _ = tray.set_title(Some("—"));
            if let Some(icon) = app.default_window_icon() {
                let _ = tray.set_icon(Some(icon.clone()));
            }
        }
    }
}

fn show_main_window(app: &AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| "The main window does not exist.".to_string())?;
    // The app is a regular app while the main window is open, and a menu
    // bar app once the window is closed. The Dock icon follows the window.
    #[cfg(target_os = "macos")]
    let _ = app.set_dock_visibility(true);
    window.show().map_err(|error| error.to_string())?;
    window.unminimize().map_err(|error| error.to_string())?;
    #[cfg(target_os = "macos")]
    activate_app();
    window.set_focus().map_err(|error| error.to_string())
}

/// Brings the app to the front. A relaunch after an update starts the new
/// process from the old one, not from Finder or Launch Services, so macOS
/// does not activate it. An inactive app gets no clicks: each click only
/// tries to activate the app, and the buttons never react. Menu bar apps
/// (`ActivationPolicy::Accessory`) never activate on their own.
#[cfg(target_os = "macos")]
fn activate_app() {
    use objc2_app_kit::NSApplication;
    // SAFETY: Tauri runs setup and commands on the main thread.
    let mtm = unsafe { objc2::MainThreadMarker::new_unchecked() };
    let app = NSApplication::sharedApplication(mtm);
    #[allow(deprecated)]
    app.activateIgnoringOtherApps(true);
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
    // The panel is non-activating: it becomes key without activating the
    // app, so the main window stays where it is. It must be key so that a
    // click elsewhere makes it lose focus and hide.
    let _ = window.show();
    let _ = window.set_focus();
}

fn build_windows(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let main = WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
        .title("Devie Quota")
        .inner_size(1120.0, 760.0)
        .min_inner_size(780.0, 560.0)
        .center();
    // The interface draws its own title bar. macOS keeps the native traffic
    // lights, placed inside the sidebar header.
    #[cfg(target_os = "macos")]
    let main = main
        .title_bar_style(tauri::TitleBarStyle::Overlay)
        .hidden_title(true)
        .traffic_light_position(tauri::LogicalPosition::new(20.0, 35.0));
    main.build()?;

    let popover =
        WebviewWindowBuilder::new(app, "popover", WebviewUrl::App("?surface=popover".into()))
            .title("Devie Quota Quotas")
            .inner_size(POPOVER_WIDTH, 480.0)
            // The popover resizes itself to its content, down to one short
            // list. The user cannot resize or move it.
            .min_inner_size(POPOVER_WIDTH, 120.0)
            .max_inner_size(POPOVER_WIDTH, 760.0)
            .resizable(false)
            .decorations(false)
            // The interface draws a rounded frame on a transparent window.
            .transparent(true);
    #[cfg(target_os = "macos")]
    let popover = popover.effects(
        EffectsBuilder::new()
            .effect(Effect::Popover)
            .radius(12.0)
            .state(EffectState::FollowsWindowActiveState)
            .build(),
    );
    let popover = popover
        .always_on_top(true)
        .skip_taskbar(true)
        .shadow(true)
        .visible(false)
        .build()?;
    #[cfg(target_os = "macos")]
    make_non_activating_panel(&popover);
    #[cfg(target_os = "macos")]
    hide_popover_on_outside_click(app.handle().clone(), &popover);
    Ok(())
}

const POPOVER_WIDTH: f64 = 440.0;

/// Turns the popover into a non-activating panel: it opens over other apps
/// without bringing the main window forward, like a native menu bar popover.
#[cfg(target_os = "macos")]
fn make_non_activating_panel(window: &tauri::WebviewWindow) {
    use objc2::{define_class, runtime::AnyObject, ClassType, MainThreadOnly};
    use objc2_app_kit::{NSPanel, NSWindowCollectionBehavior, NSWindowStyleMask};

    define_class!(
        // A borderless NSPanel refuses to become key, so the webview gets no
        // hover, no tooltips, and no focus-lost event. This subclass accepts.
        #[unsafe(super(NSPanel))]
        #[thread_kind = MainThreadOnly]
        #[name = "DevieQuotaPopoverPanel"]
        struct PopoverPanel;

        impl PopoverPanel {
            #[unsafe(method(canBecomeKeyWindow))]
            fn can_become_key_window(&self) -> bool {
                true
            }
        }
    );

    let Ok(pointer) = window.ns_window() else {
        return;
    };
    // SAFETY: the pointer is the live NSWindow of this webview window, and
    // NSPanel only adds behavior on top of NSWindow.
    unsafe {
        let object = &*(pointer as *const AnyObject);
        AnyObject::set_class(object, PopoverPanel::class());
        let panel = &*(pointer as *const NSPanel);
        panel.setStyleMask(panel.styleMask() | NSWindowStyleMask::NonactivatingPanel);
        panel.setFloatingPanel(true);
        panel.setHidesOnDeactivate(false);
        // A window that is not key gets no mouse-moved events by default, so
        // hover tooltips in the webview never open. Ask for them.
        panel.setAcceptsMouseMovedEvents(true);
        // Like a native menu bar menu: it shows on every Space, also over an
        // app in full screen. The window level stays "floating" (from
        // always_on_top): a higher level is not kept out of the menu bar and
        // ends up under the notch.
        panel.setCollectionBehavior(
            NSWindowCollectionBehavior::CanJoinAllSpaces
                | NSWindowCollectionBehavior::FullScreenAuxiliary
                | NSWindowCollectionBehavior::Stationary,
        );
    }
}

/// A non-activating panel does not always resign key focus when the user
/// clicks elsewhere, so the focus-lost event is not enough. Native mouse
/// monitors hide the popover on any click outside it: in another app
/// (global monitor) or in another window of this app (local monitor).
#[cfg(target_os = "macos")]
fn hide_popover_on_outside_click(app: AppHandle, popover: &tauri::WebviewWindow) {
    use objc2_app_kit::{NSEvent, NSEventMask};

    let Ok(panel_pointer) = popover.ns_window() else {
        return;
    };
    let panel_pointer = panel_pointer as usize;
    let mask =
        NSEventMask::LeftMouseDown | NSEventMask::RightMouseDown | NSEventMask::OtherMouseDown;

    let hide = {
        let app = app.clone();
        move || {
            if let Some(window) = app.get_webview_window("popover") {
                if window.is_visible().unwrap_or(false) {
                    let _ = window.hide();
                }
            }
        }
    };

    let global_hide = hide.clone();
    let global = block2::RcBlock::new(move |_event: std::ptr::NonNull<NSEvent>| {
        global_hide();
    });
    let local = block2::RcBlock::new(move |event: std::ptr::NonNull<NSEvent>| {
        // SAFETY: AppKit hands the monitor a live event for the duration of the call.
        let event_window = unsafe {
            event
                .as_ref()
                .window(objc2::MainThreadMarker::new_unchecked())
        };
        let inside = event_window
            .map(|window| objc2::rc::Retained::as_ptr(&window) as usize == panel_pointer)
            .unwrap_or(false);
        if !inside {
            hide();
        }
        event.as_ptr()
    });
    // The monitors live as long as the app.
    if let Some(monitor) = NSEvent::addGlobalMonitorForEventsMatchingMask_handler(mask, &global) {
        std::mem::forget(monitor);
    }
    // SAFETY: the block returns the event it received, unchanged.
    if let Some(monitor) =
        unsafe { NSEvent::addLocalMonitorForEventsMatchingMask_handler(mask, &local) }
    {
        std::mem::forget(monitor);
    }
}

fn build_tray(app: &tauri::App, locale: &str) -> Result<(), Box<dyn std::error::Error>> {
    let menu = tray_menu(app, locale)?;
    let mut builder = TrayIconBuilder::with_id("main-tray")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .tooltip(messages::t(locale, "Tray.Tooltip", &[]))
        .title("—")
        // Provider logos keep their colors; a template icon would be a flat square.
        .icon_as_template(false)
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
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir()?;
            let database = Database::open(app_data_dir.join("devie-quota.sqlite3"))
                .map_err(std::io::Error::other)?;
            let client = reqwest::Client::builder()
                .timeout(Duration::from_secs(20))
                .build()?;
            let version = app.package_info().version.to_string();
            let telemetry = telemetry::Telemetry::new(database.clone(), version.clone());
            telemetry.install_panic_hook();
            let previous_version = database.record_run_version(&version).unwrap_or_default();
            app.manage(Core {
                database,
                app_data_dir,
                client,
                logins: LoginSessions::default(),
                refresh_gate: Arc::new(tokio::sync::Mutex::new(())),
                codex_resets: codex_resets::Cache::default(),
                telemetry: telemetry.clone(),
            });
            app.manage(updater::PendingUpdate::default());
            build_windows(app)?;
            #[cfg(target_os = "macos")]
            activate_app();
            let locale = current_language(&app.state::<Core>());
            build_tray(app, &locale)?;
            let settings = app.state::<Core>().database.settings().unwrap_or_default();
            apply_tray_visibility(app.handle(), settings.show_menu_bar_item);
            let connections = app
                .state::<Core>()
                .database
                .dashboard_state()
                .map(|state| state.connections)
                .unwrap_or_default();
            telemetry.capture(
                "app_opened",
                serde_json::json!({
                    "connections": connections.len(),
                    "providers": connections
                        .iter()
                        .map(|connection| connection.provider.as_str())
                        .collect::<std::collections::BTreeSet<_>>(),
                    "update_channel": settings.update_channel.as_str(),
                    "show_menu_bar_item": settings.show_menu_bar_item,
                }),
            );
            if let Some(previous_version) = previous_version {
                telemetry.capture(
                    "app_updated",
                    serde_json::json!({ "previous_version": previous_version }),
                );
            }

            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                loop {
                    let _ = refresh_all_internal(&handle, false).await;
                    tokio::time::sleep(Duration::from_secs(300)).await;
                }
            });
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                loop {
                    auto_ping_tick(&handle).await;
                    tokio::time::sleep(Duration::from_secs(60)).await;
                }
            });
            Ok(())
        })
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } if window.label() == "main" => {
                // Closing the window leaves the menu bar item running.
                api.prevent_close();
                let _ = window.hide();
                #[cfg(target_os = "macos")]
                let _ = window.app_handle().set_dock_visibility(false);
            }
            tauri::WindowEvent::Focused(false) if window.label() == "popover" => {
                // On macOS the mouse monitors hide the popover on an outside
                // click instead. Focus loss alone is not a dismissal there: a
                // full screen Space takes key focus back when its auto-hidden
                // menu bar slides away, while the popover should stay open.
                #[cfg(not(target_os = "macos"))]
                let _ = window.hide();
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            get_dashboard_state,
            start_login,
            finish_login,
            cancel_login,
            remove_connection,
            refresh_all,
            refresh_connection,
            set_connection_enabled,
            rename_connection,
            set_connection_alerts,
            notification_permission_state,
            request_notification_permission,
            send_test_notification,
            set_hidden_windows,
            set_auto_ping,
            use_reset_credit,
            set_tray_summary,
            set_menu_bar_item_visible,
            set_language,
            set_update_channel,
            set_telemetry_enabled,
            updater::fetch_update,
            updater::download_update,
            updater::install_update,
            get_codex_resets_status,
            open_external_url,
            open_main_window,
            hide_popover,
        ])
        .build(tauri::generate_context!())
        .expect("Devie Quota failed to start")
        .run(|app, event| {
            // A click on the Dock icon with no visible window reopens the
            // main window (Cmd+H or a click on the tray hides it).
            if let tauri::RunEvent::Reopen {
                has_visible_windows: false,
                ..
            } = event
            {
                let _ = show_main_window(app);
            }
        });
}
