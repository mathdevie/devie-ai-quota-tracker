//! In-app updates from CrabNebula Cloud on a stable or a nightly channel.
//!
//! The channel is a user setting, so the update endpoint is built here at
//! runtime instead of in `tauri.conf.json`, whose endpoints are static.

use std::sync::Mutex;

use serde::Serialize;
use tauri::{ipc::Channel, AppHandle, Manager, State, Url};
use tauri_plugin_updater::{Update, UpdaterExt};

use crate::model::UpdateChannel;

const ENDPOINT: &str =
    "https://cdn.crabnebula.app/update/mathdev/devie-quota/{{target}}-{{arch}}/{{current_version}}";

/// The update the last check found, and its bytes once downloaded.
#[derive(Default)]
pub struct PendingUpdate(Mutex<Pending>);

#[derive(Default)]
struct Pending {
    update: Option<Update>,
    bytes: Option<Vec<u8>>,
}

impl PendingUpdate {
    /// Forgets a found update, e.g. when the user changes the channel.
    pub fn clear(&self) {
        *self.0.lock().unwrap() = Pending::default();
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateInfo {
    version: String,
    current_version: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    body: Option<String>,
}

#[derive(Clone, Serialize)]
#[serde(tag = "event", content = "data")]
pub enum DownloadEvent {
    #[serde(rename_all = "camelCase")]
    Started {
        content_length: Option<u64>,
    },
    #[serde(rename_all = "camelCase")]
    Progress {
        chunk_length: usize,
    },
    Finished,
}

/// The update endpoint for a channel. Stable is CrabNebula's unnamed
/// default channel, so it carries no query parameter.
fn endpoint(channel: UpdateChannel) -> Result<Url, String> {
    let url = match channel {
        UpdateChannel::Stable => ENDPOINT.to_string(),
        UpdateChannel::Nightly => format!("{ENDPOINT}?channel=nightly"),
    };
    Url::parse(&url).map_err(|error| error.to_string())
}

/// Asks the channel's feed for a newer version and remembers the answer.
#[tauri::command]
pub async fn fetch_update(
    app: AppHandle,
    pending: State<'_, PendingUpdate>,
) -> Result<Option<UpdateInfo>, String> {
    let channel = app
        .state::<crate::Core>()
        .database
        .settings()?
        .update_channel;
    let update = app
        .updater_builder()
        .endpoints(vec![endpoint(channel)?])
        .map_err(|error| error.to_string())?
        .build()
        .map_err(|error| error.to_string())?
        .check()
        .await
        .map_err(|error| error.to_string())?;
    let info = update.as_ref().map(|update| UpdateInfo {
        version: update.version.clone(),
        current_version: update.current_version.clone(),
        body: update.body.clone(),
    });
    *pending.0.lock().unwrap() = Pending {
        update,
        bytes: None,
    };
    Ok(info)
}

/// Downloads the found update and streams the progress to the window.
#[tauri::command]
pub async fn download_update(
    pending: State<'_, PendingUpdate>,
    on_event: Channel<DownloadEvent>,
) -> Result<(), String> {
    let Some(update) = pending.0.lock().unwrap().update.take() else {
        return Err("There is no update to download.".to_string());
    };
    let mut started = false;
    let result = update
        .download(
            |chunk_length, content_length| {
                if !started {
                    started = true;
                    let _ = on_event.send(DownloadEvent::Started { content_length });
                }
                let _ = on_event.send(DownloadEvent::Progress { chunk_length });
            },
            || {
                let _ = on_event.send(DownloadEvent::Finished);
            },
        )
        .await;
    let mut guard = pending.0.lock().unwrap();
    match result {
        Ok(bytes) => {
            *guard = Pending {
                update: Some(update),
                bytes: Some(bytes),
            };
            Ok(())
        }
        Err(error) => {
            *guard = Pending {
                update: Some(update),
                bytes: None,
            };
            Err(error.to_string())
        }
    }
}

/// Installs the downloaded update. The frontend relaunches the app after.
#[tauri::command]
pub fn install_update(pending: State<'_, PendingUpdate>) -> Result<(), String> {
    let (update, bytes) = {
        let mut guard = pending.0.lock().unwrap();
        (guard.update.take(), guard.bytes.take())
    };
    let (Some(update), Some(bytes)) = (update, bytes) else {
        return Err("There is no downloaded update to install.".to_string());
    };
    update.install(bytes).map_err(|error| error.to_string())
}
