use std::{
    fs,
    path::{Path, PathBuf},
};

use serde_json::{json, Map, Value};

use crate::{
    db::Database,
    model::{CaptureState, Provider, ProviderConnection},
};

const CAPTURE_SCRIPT: &str = r#"#!/bin/sh
snapshot_path=$1
original_path=$2
input_path="${snapshot_path}.input.$$"
snapshot_tmp="${snapshot_path}.tmp.$$"
umask 077
trap 'rm -f "$input_path" "$snapshot_tmp"' EXIT
cat > "$input_path"
cp "$input_path" "$snapshot_tmp"
mv "$snapshot_tmp" "$snapshot_path"
if [ -s "$original_path" ]; then
  original_command=$(cat "$original_path")
  /bin/sh -c "$original_command" < "$input_path"
fi
"#;

pub fn install(
    database: &Database,
    app_data_dir: &Path,
    connection: &ProviderConnection,
) -> Result<(), String> {
    validate_claude(connection)?;
    let config_dir = Path::new(&connection.source_locator);
    fs::create_dir_all(config_dir).map_err(|error| error.to_string())?;
    let settings_path = config_dir.join("settings.json");
    let mut settings = read_settings(&settings_path)?;
    if is_managed_status_line(settings.get("statusLine")) {
        database.set_capture_state(&connection.id, CaptureState::Installed)?;
        return Ok(());
    }

    let capture_dir = app_data_dir.join("captures");
    fs::create_dir_all(&capture_dir).map_err(|error| error.to_string())?;
    let script_path = capture_dir.join("devie-qt-statusline.sh");
    write_private(&script_path, CAPTURE_SCRIPT.as_bytes(), true)?;
    let snapshot_path = capture_dir.join(format!("{}.json", connection.id));
    let original_path = capture_dir.join(format!("{}.original-command", connection.id));

    let previous = settings.get("statusLine").cloned();
    let previous_command = previous
        .as_ref()
        .and_then(|value| value.get("command"))
        .and_then(Value::as_str)
        .unwrap_or_default();
    write_private(&original_path, previous_command.as_bytes(), false)?;

    let command = format!(
        "/bin/sh {} {} {}",
        shell_quote(&script_path),
        shell_quote(&snapshot_path),
        shell_quote(&original_path),
    );
    let installed = json!({ "type": "command", "command": command });
    let previous_json = previous.as_ref().map(Value::to_string);
    database.save_capture_backup(
        &connection.id,
        previous_json.as_deref(),
        &installed.to_string(),
    )?;
    settings.insert("statusLine".to_string(), installed);
    write_settings(&settings_path, &settings)?;
    database.set_capture_state(&connection.id, CaptureState::Installed)
}

pub fn remove(database: &Database, connection: &ProviderConnection) -> Result<(), String> {
    validate_claude(connection)?;
    let backup = database.capture_backup(&connection.id)?.ok_or_else(|| {
        "No managed Claude status capture exists for this connection.".to_string()
    })?;
    let settings_path = Path::new(&connection.source_locator).join("settings.json");
    let mut settings = read_settings(&settings_path)?;
    let installed: Value = serde_json::from_str(&backup.installed_status_line)
        .map_err(|_| "The saved Claude capture record is invalid.".to_string())?;
    if settings.get("statusLine") != Some(&installed) {
        return Err(
            "Claude settings changed after capture installation. The app did not overwrite them."
                .to_string(),
        );
    }

    match backup.previous_status_line {
        Some(previous) => {
            let value = serde_json::from_str(&previous)
                .map_err(|_| "The saved Claude status line is invalid.".to_string())?;
            settings.insert("statusLine".to_string(), value);
        }
        None => {
            settings.remove("statusLine");
        }
    }
    write_settings(&settings_path, &settings)?;
    database.delete_capture_backup(&connection.id)?;
    database.set_capture_state(&connection.id, CaptureState::Available)
}

fn validate_claude(connection: &ProviderConnection) -> Result<(), String> {
    if connection.provider != Provider::Claude {
        return Err("Passive capture only supports Claude connections.".to_string());
    }
    Ok(())
}

fn read_settings(path: &Path) -> Result<Map<String, Value>, String> {
    if !path.exists() {
        return Ok(Map::new());
    }
    let data = fs::read(path).map_err(|error| error.to_string())?;
    serde_json::from_slice::<Value>(&data)
        .map_err(|_| "Claude settings.json is not valid JSON.".to_string())?
        .as_object()
        .cloned()
        .ok_or_else(|| "Claude settings.json must contain a JSON object.".to_string())
}

fn write_settings(path: &Path, settings: &Map<String, Value>) -> Result<(), String> {
    let bytes = serde_json::to_vec_pretty(settings).map_err(|error| error.to_string())?;
    let temporary = temporary_path(path);
    write_private(&temporary, &bytes, false)?;
    fs::rename(&temporary, path).map_err(|error| error.to_string())
}

fn write_private(path: &Path, bytes: &[u8], executable: bool) -> Result<(), String> {
    fs::write(path, bytes).map_err(|error| error.to_string())?;
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mode = if executable { 0o700 } else { 0o600 };
        fs::set_permissions(path, fs::Permissions::from_mode(mode))
            .map_err(|error| error.to_string())?;
    }
    Ok(())
}

fn temporary_path(path: &Path) -> PathBuf {
    let mut value = path.as_os_str().to_os_string();
    value.push(".devie-qt.tmp");
    PathBuf::from(value)
}

fn shell_quote(path: &Path) -> String {
    format!("'{}'", path.to_string_lossy().replace('\'', "'\"'\"'"))
}

fn is_managed_status_line(value: Option<&Value>) -> bool {
    value
        .and_then(|value| value.get("command"))
        .and_then(Value::as_str)
        .is_some_and(|command| command.contains("devie-qt-statusline.sh"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::{ConnectionStatus, ProviderConnection};

    fn fixture_connection(path: &Path) -> ProviderConnection {
        ProviderConnection {
            id: "claude-test".into(),
            provider: Provider::Claude,
            label: "Claude · Test".into(),
            source_locator: path.display().to_string(),
            enabled: true,
            status: ConnectionStatus::Stale,
            source: "Not refreshed".into(),
            last_updated_at: None,
            last_error: None,
            capture_state: Some(CaptureState::Available),
            identity: None,
            windows: Vec::new(),
        }
    }

    fn database_with_connection(root: &Path, connection: &ProviderConnection) -> Database {
        let database = Database::open(root.join("app.sqlite3")).expect("database");
        database
            .upsert_discovered(&[crate::model::DiscoveredConnection {
                id: connection.id.clone(),
                provider: connection.provider.clone(),
                label: connection.label.clone(),
                source_locator: connection.source_locator.clone(),
                capture_state: connection.capture_state.clone(),
                identity: None,
            }])
            .expect("connection");
        database
    }

    #[test]
    fn install_and_remove_restore_the_previous_status_line() {
        let root = tempfile::tempdir().expect("root");
        let config = root.path().join("claude");
        fs::create_dir_all(&config).expect("config");
        let original = json!({
            "theme": "dark",
            "statusLine": { "type": "command", "command": "old-status --json" }
        });
        fs::write(
            config.join("settings.json"),
            serde_json::to_vec_pretty(&original).expect("json"),
        )
        .expect("settings");
        let connection = fixture_connection(&config);
        let database = database_with_connection(root.path(), &connection);

        install(&database, root.path(), &connection).expect("install");
        let installed = read_settings(&config.join("settings.json")).expect("installed settings");
        assert!(is_managed_status_line(installed.get("statusLine")));

        remove(&database, &connection).expect("remove");
        let restored = read_settings(&config.join("settings.json")).expect("restored settings");
        assert_eq!(restored.get("statusLine"), original.get("statusLine"));
        assert_eq!(restored.get("theme"), original.get("theme"));
    }

    #[test]
    fn remove_does_not_overwrite_a_later_user_change() {
        let root = tempfile::tempdir().expect("root");
        let config = root.path().join("claude");
        fs::create_dir_all(&config).expect("config");
        let connection = fixture_connection(&config);
        let database = database_with_connection(root.path(), &connection);
        install(&database, root.path(), &connection).expect("install");
        fs::write(
            config.join("settings.json"),
            br#"{"statusLine":{"type":"command","command":"my-new-command"}}"#,
        )
        .expect("changed settings");
        let error = remove(&database, &connection).expect_err("conflict");
        assert!(error.contains("did not overwrite"));
    }
}
