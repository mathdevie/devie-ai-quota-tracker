use std::{fs, path::PathBuf};

use chrono::Utc;
use rusqlite::{params, Connection, OptionalExtension};

use crate::model::{
    CaptureState, ConnectionStatus, DashboardState, DiscoveredConnection, Provider,
    ProviderConnection, QuotaReading, QuotaWindow, RemoteIdentity,
};

#[derive(Clone, Debug)]
pub struct Database {
    path: PathBuf,
}

#[derive(Clone, Debug)]
pub struct CaptureBackup {
    pub previous_status_line: Option<String>,
    pub installed_status_line: String,
}

impl Database {
    pub fn open(path: PathBuf) -> Result<Self, String> {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).map_err(|error| error.to_string())?;
        }
        let database = Self { path };
        database.initialize()?;
        Ok(database)
    }

    fn connection(&self) -> Result<Connection, String> {
        Connection::open(&self.path).map_err(|error| error.to_string())
    }

    fn initialize(&self) -> Result<(), String> {
        let connection = self.connection()?;
        connection
            .execute_batch(
                "PRAGMA journal_mode=WAL;
                 PRAGMA foreign_keys=ON;
                 CREATE TABLE IF NOT EXISTS provider_connections (
                   id TEXT PRIMARY KEY,
                   provider TEXT NOT NULL,
                   label TEXT NOT NULL,
                   source_locator TEXT NOT NULL,
                   enabled INTEGER NOT NULL DEFAULT 1,
                   status TEXT NOT NULL DEFAULT 'stale',
                   source TEXT NOT NULL DEFAULT 'Not refreshed',
                   last_updated_at TEXT,
                   last_error TEXT,
                   capture_state TEXT,
                   identity_user_id TEXT,
                   identity_display_name TEXT,
                   identity_plan TEXT,
                   updated_at TEXT NOT NULL
                 );
                 CREATE UNIQUE INDEX IF NOT EXISTS provider_locator
                   ON provider_connections(provider, source_locator);
                 CREATE TABLE IF NOT EXISTS quota_snapshots (
                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                   connection_id TEXT NOT NULL REFERENCES provider_connections(id) ON DELETE CASCADE,
                   captured_at TEXT NOT NULL,
                   source TEXT NOT NULL
                 );
                 CREATE INDEX IF NOT EXISTS quota_snapshots_recent
                   ON quota_snapshots(connection_id, captured_at DESC);
                 CREATE TABLE IF NOT EXISTS quota_windows (
                   snapshot_id INTEGER NOT NULL REFERENCES quota_snapshots(id) ON DELETE CASCADE,
                   window_key TEXT NOT NULL,
                   label TEXT NOT NULL,
                   used_percent REAL NOT NULL,
                   resets_at TEXT,
                   PRIMARY KEY(snapshot_id, window_key)
                 );
                 CREATE TABLE IF NOT EXISTS managed_settings_backups (
                   connection_id TEXT PRIMARY KEY REFERENCES provider_connections(id) ON DELETE CASCADE,
                   previous_status_line TEXT,
                   installed_status_line TEXT NOT NULL,
                   created_at TEXT NOT NULL
                 );",
            )
            .map_err(|error| error.to_string())?;
        Ok(())
    }

    pub fn upsert_discovered(&self, discovered: &[DiscoveredConnection]) -> Result<(), String> {
        let mut connection = self.connection()?;
        let transaction = connection
            .transaction()
            .map_err(|error| error.to_string())?;
        let now = Utc::now().to_rfc3339();

        for item in discovered {
            transaction
                .execute(
                    "INSERT INTO provider_connections (
                       id, provider, label, source_locator, capture_state,
                       identity_user_id, identity_display_name, identity_plan, updated_at
                     ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
                     ON CONFLICT(id) DO UPDATE SET
                       source_locator = excluded.source_locator,
                       capture_state = COALESCE(provider_connections.capture_state, excluded.capture_state),
                       identity_user_id = COALESCE(excluded.identity_user_id, provider_connections.identity_user_id),
                       identity_display_name = COALESCE(excluded.identity_display_name, provider_connections.identity_display_name),
                       identity_plan = COALESCE(excluded.identity_plan, provider_connections.identity_plan),
                       updated_at = excluded.updated_at",
                    params![
                        item.id,
                        item.provider.as_str(),
                        item.label,
                        item.source_locator,
                        item.capture_state.as_ref().map(CaptureState::as_str),
                        item.identity.as_ref().and_then(|value| value.provider_user_id.as_deref()),
                        item.identity.as_ref().and_then(|value| value.display_name.as_deref()),
                        item.identity.as_ref().and_then(|value| value.plan.as_deref()),
                        now,
                    ],
                )
                .map_err(|error| error.to_string())?;
        }

        transaction.commit().map_err(|error| error.to_string())
    }

    pub fn dashboard_state(&self) -> Result<DashboardState, String> {
        let connection = self.connection()?;
        let mut statement = connection
            .prepare(
                "SELECT id, provider, label, source_locator, enabled, status, source,
                        last_updated_at, last_error, capture_state,
                        identity_user_id, identity_display_name, identity_plan
                 FROM provider_connections
                 ORDER BY CASE provider WHEN 'claude' THEN 0 WHEN 'codex' THEN 1 ELSE 2 END,
                          label",
            )
            .map_err(|error| error.to_string())?;

        let rows = statement
            .query_map([], |row| {
                let provider_text: String = row.get(1)?;
                let provider = Provider::from_db(&provider_text).unwrap_or(Provider::Claude);
                let user_id: Option<String> = row.get(10)?;
                let display_name: Option<String> = row.get(11)?;
                let plan: Option<String> = row.get(12)?;
                let identity = if user_id.is_some() || display_name.is_some() || plan.is_some() {
                    Some(RemoteIdentity {
                        provider_user_id: user_id,
                        display_name,
                        plan,
                    })
                } else {
                    None
                };

                Ok(ProviderConnection {
                    id: row.get(0)?,
                    provider,
                    label: row.get(2)?,
                    source_locator: row.get(3)?,
                    enabled: row.get::<_, i64>(4)? != 0,
                    status: ConnectionStatus::from_db(&row.get::<_, String>(5)?),
                    source: row.get(6)?,
                    last_updated_at: row.get(7)?,
                    last_error: row.get(8)?,
                    capture_state: CaptureState::from_db(
                        row.get::<_, Option<String>>(9)?.as_deref(),
                    ),
                    identity,
                    windows: Vec::new(),
                })
            })
            .map_err(|error| error.to_string())?;

        let mut connections = Vec::new();
        for row in rows {
            let mut item = row.map_err(|error| error.to_string())?;
            item.windows = Self::latest_windows(&connection, &item.id)?;
            connections.push(item);
        }

        let refreshed_at = connection
            .query_row(
                "SELECT MAX(last_updated_at) FROM provider_connections",
                [],
                |row| row.get::<_, Option<String>>(0),
            )
            .map_err(|error| error.to_string())?;

        Ok(DashboardState {
            mode: "native".to_string(),
            connections,
            database_path: self.path.display().to_string(),
            refreshed_at,
        })
    }

    fn latest_windows(
        connection: &Connection,
        connection_id: &str,
    ) -> Result<Vec<QuotaWindow>, String> {
        let snapshot_id = connection
            .query_row(
                "SELECT id FROM quota_snapshots WHERE connection_id = ?1 ORDER BY id DESC LIMIT 1",
                [connection_id],
                |row| row.get::<_, i64>(0),
            )
            .optional()
            .map_err(|error| error.to_string())?;
        let Some(snapshot_id) = snapshot_id else {
            return Ok(Vec::new());
        };

        let mut statement = connection
            .prepare(
                "SELECT window_key, label, used_percent, resets_at
                 FROM quota_windows WHERE snapshot_id = ?1 ORDER BY rowid",
            )
            .map_err(|error| error.to_string())?;
        let rows = statement
            .query_map([snapshot_id], |row| {
                Ok(QuotaWindow {
                    key: row.get(0)?,
                    label: row.get(1)?,
                    used_percent: row.get(2)?,
                    resets_at: row.get(3)?,
                })
            })
            .map_err(|error| error.to_string())?;
        rows.collect::<Result<Vec<_>, _>>()
            .map_err(|error| error.to_string())
    }

    pub fn connection_by_id(&self, id: &str) -> Result<Option<ProviderConnection>, String> {
        Ok(self
            .dashboard_state()?
            .connections
            .into_iter()
            .find(|item| item.id == id))
    }

    pub fn set_enabled(&self, id: &str, enabled: bool) -> Result<(), String> {
        let changed = self
            .connection()?
            .execute(
                "UPDATE provider_connections SET enabled = ?2, updated_at = ?3 WHERE id = ?1",
                params![id, enabled as i64, Utc::now().to_rfc3339()],
            )
            .map_err(|error| error.to_string())?;
        if changed == 0 {
            return Err("The connection does not exist.".to_string());
        }
        Ok(())
    }

    pub fn save_reading(&self, id: &str, reading: &QuotaReading) -> Result<(), String> {
        let mut connection = self.connection()?;
        let transaction = connection
            .transaction()
            .map_err(|error| error.to_string())?;
        let captured_at = Utc::now().to_rfc3339();
        transaction
            .execute(
                "INSERT INTO quota_snapshots(connection_id, captured_at, source) VALUES (?1, ?2, ?3)",
                params![id, captured_at, reading.source],
            )
            .map_err(|error| error.to_string())?;
        let snapshot_id = transaction.last_insert_rowid();
        for window in &reading.windows {
            transaction
                .execute(
                    "INSERT INTO quota_windows(snapshot_id, window_key, label, used_percent, resets_at)
                     VALUES (?1, ?2, ?3, ?4, ?5)",
                    params![snapshot_id, window.key, window.label, window.used_percent, window.resets_at],
                )
                .map_err(|error| error.to_string())?;
        }

        let identity = reading.identity.as_ref();
        transaction
            .execute(
                "UPDATE provider_connections SET
                   status = 'ready', source = ?2, last_updated_at = ?3, last_error = NULL,
                   identity_user_id = COALESCE(?4, identity_user_id),
                   identity_display_name = COALESCE(?5, identity_display_name),
                   identity_plan = COALESCE(?6, identity_plan), updated_at = ?3
                 WHERE id = ?1",
                params![
                    id,
                    reading.source,
                    captured_at,
                    identity.and_then(|value| value.provider_user_id.as_deref()),
                    identity.and_then(|value| value.display_name.as_deref()),
                    identity.and_then(|value| value.plan.as_deref()),
                ],
            )
            .map_err(|error| error.to_string())?;
        transaction.commit().map_err(|error| error.to_string())
    }

    pub fn save_failure(
        &self,
        id: &str,
        status: ConnectionStatus,
        message: &str,
    ) -> Result<(), String> {
        self.connection()?
            .execute(
                "UPDATE provider_connections SET status = ?2, last_error = ?3, updated_at = ?4 WHERE id = ?1",
                params![id, status.as_str(), message, Utc::now().to_rfc3339()],
            )
            .map_err(|error| error.to_string())?;
        Ok(())
    }

    pub fn set_capture_state(&self, id: &str, state: CaptureState) -> Result<(), String> {
        self.connection()?
            .execute(
                "UPDATE provider_connections SET capture_state = ?2, updated_at = ?3 WHERE id = ?1",
                params![id, state.as_str(), Utc::now().to_rfc3339()],
            )
            .map_err(|error| error.to_string())?;
        Ok(())
    }

    pub fn save_capture_backup(
        &self,
        id: &str,
        previous_status_line: Option<&str>,
        installed_status_line: &str,
    ) -> Result<(), String> {
        self.connection()?
            .execute(
                "INSERT INTO managed_settings_backups(
                   connection_id, previous_status_line, installed_status_line, created_at
                 ) VALUES (?1, ?2, ?3, ?4)
                 ON CONFLICT(connection_id) DO UPDATE SET
                   previous_status_line = excluded.previous_status_line,
                   installed_status_line = excluded.installed_status_line,
                   created_at = excluded.created_at",
                params![
                    id,
                    previous_status_line,
                    installed_status_line,
                    Utc::now().to_rfc3339()
                ],
            )
            .map_err(|error| error.to_string())?;
        Ok(())
    }

    pub fn capture_backup(&self, id: &str) -> Result<Option<CaptureBackup>, String> {
        self.connection()?
            .query_row(
                "SELECT previous_status_line, installed_status_line
                 FROM managed_settings_backups WHERE connection_id = ?1",
                [id],
                |row| {
                    Ok(CaptureBackup {
                        previous_status_line: row.get(0)?,
                        installed_status_line: row.get(1)?,
                    })
                },
            )
            .optional()
            .map_err(|error| error.to_string())
    }

    pub fn delete_capture_backup(&self, id: &str) -> Result<(), String> {
        self.connection()?
            .execute(
                "DELETE FROM managed_settings_backups WHERE connection_id = ?1",
                [id],
            )
            .map_err(|error| error.to_string())?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn persists_separate_connections_and_history() {
        let directory = tempfile::tempdir().expect("temporary directory");
        let database = Database::open(directory.path().join("test.sqlite3")).expect("database");
        let discovered = vec![
            DiscoveredConnection {
                id: "claude-one".into(),
                provider: Provider::Claude,
                label: "Claude · One".into(),
                source_locator: "/tmp/.claude-one".into(),
                capture_state: Some(CaptureState::Available),
                identity: None,
            },
            DiscoveredConnection {
                id: "claude-two".into(),
                provider: Provider::Claude,
                label: "Claude · Two".into(),
                source_locator: "/tmp/.claude-two".into(),
                capture_state: Some(CaptureState::Available),
                identity: None,
            },
        ];
        database.upsert_discovered(&discovered).expect("discover");

        for used in [12.0, 28.0] {
            database
                .save_reading(
                    "claude-one",
                    &QuotaReading {
                        source: "fixture".into(),
                        identity: None,
                        windows: vec![QuotaWindow {
                            key: "five_hour".into(),
                            label: "Current session".into(),
                            used_percent: used,
                            resets_at: None,
                        }],
                    },
                )
                .expect("reading");
        }

        let state = database.dashboard_state().expect("state");
        assert_eq!(state.connections.len(), 2);
        assert_eq!(state.connections[0].windows[0].used_percent, 28.0);
        let count: i64 = database
            .connection()
            .expect("connection")
            .query_row("SELECT COUNT(*) FROM quota_snapshots", [], |row| row.get(0))
            .expect("history count");
        assert_eq!(count, 2);
    }
}
