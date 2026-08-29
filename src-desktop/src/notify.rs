//! Desktop notifications.
//!
//! The Tauri notification plugin uses the legacy `NSUserNotificationCenter`
//! API on macOS. That API never asks the user for permission, and current
//! macOS versions drop its notifications for apps that were never
//! authorized. Packaged builds therefore talk to `UNUserNotificationCenter`
//! directly: it shows the system permission prompt and delivers reliably.
//! `tauri dev` runs outside an app bundle, where the modern API aborts the
//! process, so development keeps the plugin path.

use tauri::AppHandle;
use tauri_plugin_notification::NotificationExt;

/// Whether the user allowed notifications: `granted`, `denied`, or `prompt`
/// when macOS did not ask yet.
pub fn permission_state() -> String {
    #[cfg(target_os = "macos")]
    if !tauri::is_dev() {
        return macos::permission_state();
    }
    "granted".to_string()
}

/// Shows the system permission prompt when needed. True when allowed.
pub fn request_permission() -> Result<bool, String> {
    #[cfg(target_os = "macos")]
    if !tauri::is_dev() {
        return macos::request_permission();
    }
    Ok(true)
}

pub fn show(app: &AppHandle, title: &str, body: &str) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    if !tauri::is_dev() {
        return macos::show(title, body);
    }
    app.notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|error| error.to_string())
}

#[cfg(target_os = "macos")]
mod macos {
    use std::{ptr::NonNull, sync::mpsc, time::Duration};

    use block2::RcBlock;
    use objc2::runtime::Bool;
    use objc2_foundation::{NSError, NSString};
    use objc2_user_notifications::{
        UNAuthorizationOptions, UNAuthorizationStatus, UNMutableNotificationContent,
        UNNotificationRequest, UNNotificationSettings, UNUserNotificationCenter,
    };

    /// How long to wait for a completion handler from the notification
    /// daemon. The permission prompt itself does not block: macOS reports
    /// the answer only after the user clicks, so this covers that too.
    const REPLY_TIMEOUT: Duration = Duration::from_secs(120);

    fn status_name(status: UNAuthorizationStatus) -> &'static str {
        match status {
            UNAuthorizationStatus::Authorized
            | UNAuthorizationStatus::Provisional
            | UNAuthorizationStatus::Ephemeral => "granted",
            UNAuthorizationStatus::Denied => "denied",
            _ => "prompt",
        }
    }

    pub fn permission_state() -> String {
        let (sender, receiver) = mpsc::channel();
        let handler = RcBlock::new(move |settings: NonNull<UNNotificationSettings>| {
            // SAFETY: the daemon passes a live settings object to the block.
            let status = unsafe { settings.as_ref() }.authorizationStatus();
            let _ = sender.send(status_name(status));
        });
        UNUserNotificationCenter::currentNotificationCenter()
            .getNotificationSettingsWithCompletionHandler(&handler);
        receiver
            .recv_timeout(REPLY_TIMEOUT)
            .unwrap_or("prompt")
            .to_string()
    }

    pub fn request_permission() -> Result<bool, String> {
        let (sender, receiver) = mpsc::channel();
        let handler = RcBlock::new(move |granted: Bool, error: *mut NSError| {
            let _ = sender.send(if error.is_null() {
                Ok(granted.as_bool())
            } else {
                // SAFETY: non-null errors passed to the block are valid.
                Err(unsafe { &*error }.localizedDescription().to_string())
            });
        });
        UNUserNotificationCenter::currentNotificationCenter()
            .requestAuthorizationWithOptions_completionHandler(
                UNAuthorizationOptions::Alert
                    | UNAuthorizationOptions::Sound
                    | UNAuthorizationOptions::Badge,
                &handler,
            );
        receiver
            .recv_timeout(REPLY_TIMEOUT)
            .map_err(|_| "macOS did not answer the notification request".to_string())?
    }

    pub fn show(title: &str, body: &str) -> Result<(), String> {
        let content = UNMutableNotificationContent::new();
        content.setTitle(&NSString::from_str(title));
        content.setBody(&NSString::from_str(body));
        let identifier = NSString::from_str(&uuid::Uuid::new_v4().to_string());
        let request = UNNotificationRequest::requestWithIdentifier_content_trigger(
            &identifier,
            &content,
            None,
        );

        let (sender, receiver) = mpsc::channel();
        let handler = RcBlock::new(move |error: *mut NSError| {
            let _ = sender.send(if error.is_null() {
                Ok(())
            } else {
                // SAFETY: non-null errors passed to the block are valid.
                Err(unsafe { &*error }.localizedDescription().to_string())
            });
        });
        UNUserNotificationCenter::currentNotificationCenter()
            .addNotificationRequest_withCompletionHandler(&request, Some(&handler));
        receiver
            .recv_timeout(REPLY_TIMEOUT)
            .map_err(|_| "macOS did not confirm the notification".to_string())?
    }
}
