use std::{fs, path::PathBuf};

use chrono::Utc;
use rusqlite::{params, Connection, OptionalExtension};

use crate::model::{
    AppSettings, AutoPingState, ConnectionAlerts, ConnectionStatus, DashboardState, NewConnection,
    Provider, ProviderConnection, QuotaReading, QuotaWindow, RemoteIdentity, TraySummary,
    UpdateChannel,
};

const SHOW_MENU_BAR_ITEM: &str = "show_menu_bar_item";
const UPDATE_CHANNEL: &str = "update_channel";
const TELEMETRY_ENABLED: &str = "telemetry_enabled";
const TELEMETRY_ID: &str = "telemetry_id";
const LAST_RUN_VERSION: &str = "last_run_version";
const TRAY_SUMMARY: &str = "tray_summary";
const LANGUAGE: &str = "language";

#[derive(Clone, Debug)]
pub struct Database {
    path: PathBuf,
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
                   capture_state TEXT, -- unused since the capture feature was removed
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
                 CREATE TABLE IF NOT EXISTS settings (
                   key TEXT PRIMARY KEY,
                   value TEXT NOT NULL
                 );
                 CREATE TABLE IF NOT EXISTS notification_events (
                   event_key TEXT PRIMARY KEY,
                   connection_id TEXT NOT NULL REFERENCES provider_connections(id) ON DELETE CASCADE,
                   kind TEXT NOT NULL,
                   created_at TEXT NOT NULL
                 );
                 ",
            )
            .map_err(|error| error.to_string())?;
        Self::add_column_if_missing(
            &connection,
            "provider_connections",
            "kind",
            "TEXT NOT NULL DEFAULT 'oauth'",
        )?;
        // Auto-detected CLI profiles are gone; only app sign-ins remain.
        connection
            .execute("DELETE FROM provider_connections WHERE kind = 'local'", [])
            .map_err(|error| error.to_string())?;
        Self::add_column_if_missing(&connection, "provider_connections", "custom_label", "TEXT")?;
        Self::add_column_if_missing(
            &connection,
            "quota_windows",
            "unlimited",
            "INTEGER NOT NULL DEFAULT 0",
        )?;
        // JSON of `QuotaAmount`, absent when the provider gives only a percent.
        Self::add_column_if_missing(&connection, "quota_windows", "amount", "TEXT")?;
        Self::add_column_if_missing(
            &connection,
            "quota_windows",
            "paid",
            "INTEGER NOT NULL DEFAULT 0",
        )?;
        Self::add_column_if_missing(&connection, "provider_connections", "reset_credits", "TEXT")?;
        // JSON array of window keys the user hid on the account card.
        Self::add_column_if_missing(
            &connection,
            "provider_connections",
            "hidden_windows",
            "TEXT",
        )?;
        Self::add_column_if_missing(
            &connection,
            "provider_connections",
            "alert_low_quota",
            "INTEGER NOT NULL DEFAULT 0",
        )?;
        Self::add_column_if_missing(
            &connection,
            "provider_connections",
            "alert_reset_soon",
            "INTEGER NOT NULL DEFAULT 0",
        )?;
        Self::add_column_if_missing(
            &connection,
            "provider_connections",
            "alert_reset_happened",
            "INTEGER NOT NULL DEFAULT 0",
        )?;
        Self::add_column_if_missing(
            &connection,
            "provider_connections",
            "auto_ping_enabled",
            "INTEGER NOT NULL DEFAULT 0",
        )?;
        Self::add_column_if_missing(
            &connection,
            "provider_connections",
            "last_auto_ping_reset_key",
            "TEXT",
        )?;
        Self::add_column_if_missing(
            &connection,
            "provider_connections",
            "last_auto_ping_at",
            "TEXT",
        )?;
        Self::add_column_if_missing(
            &connection,
            "provider_connections",
            "last_auto_ping_error",
            "TEXT",
        )?;
        Self::add_column_if_missing(
            &connection,
            "provider_connections",
            "auto_ping_observed_reset_at",
            "TEXT",
        )?;
        Self::add_column_if_missing(
            &connection,
            "provider_connections",
            "last_auto_ping_attempt_at",
            "TEXT",
        )?;
        // One-shot migrations, guarded by the SQLite schema version.
        let schema_version: i64 = connection
            .query_row("PRAGMA user_version", [], |row| row.get(0))
            .map_err(|error| error.to_string())?;
        if schema_version < 1 {
            // The remote dashboard is gone; its rows, including the token, go too.
            connection
                .execute(
                    "DELETE FROM settings
                     WHERE key IN ('remote_enabled', 'remote_port', 'remote_lan', 'remote_token')",
                    [],
                )
                .map_err(|error| error.to_string())?;
            connection
                .execute_batch("PRAGMA user_version = 1;")
                .map_err(|error| error.to_string())?;
        }
        Ok(())
    }

    fn setting(connection: &Connection, key: &str) -> Result<Option<String>, String> {
        connection
            .query_row("SELECT value FROM settings WHERE key = ?1", [key], |row| {
                row.get::<_, String>(0)
            })
            .optional()
            .map_err(|error| error.to_string())
    }

    fn put_setting(&self, key: &str, value: Option<&str>) -> Result<(), String> {
        let connection = self.connection()?;
        match value {
            Some(value) => connection.execute(
                "INSERT INTO settings(key, value) VALUES (?1, ?2)
                 ON CONFLICT(key) DO UPDATE SET value = excluded.value",
                params![key, value],
            ),
            None => connection.execute("DELETE FROM settings WHERE key = ?1", [key]),
        }
        .map_err(|error| error.to_string())?;
        Ok(())
    }

    pub fn settings(&self) -> Result<AppSettings, String> {
        let connection = self.connection()?;
        let defaults = AppSettings::default();
        let show_menu_bar_item = Self::setting(&connection, SHOW_MENU_BAR_ITEM)?
            .map_or(defaults.show_menu_bar_item, |value| value == "1");
        // A summary that no longer parses falls back to the default silently.
        let tray_summary = Self::setting(&connection, TRAY_SUMMARY)?
            .and_then(|value| serde_json::from_str::<TraySummary>(&value).ok());
        let update_channel = Self::setting(&connection, UPDATE_CHANNEL)?
            .map_or(defaults.update_channel, |value| {
                UpdateChannel::from_db(&value)
            });
        let telemetry_enabled = Self::setting(&connection, TELEMETRY_ENABLED)?
            .map_or(defaults.telemetry_enabled, |value| value == "1");
        Ok(AppSettings {
            show_menu_bar_item,
            tray_summary,
            update_channel,
            telemetry_enabled,
        })
    }

    /// Turning telemetry off also forgets the anonymous id, so a later
    /// opt-in starts a new, unlinked identity.
    pub fn set_telemetry_enabled(&self, enabled: bool) -> Result<(), String> {
        self.put_setting(TELEMETRY_ENABLED, Some(if enabled { "1" } else { "0" }))?;
        if !enabled {
            self.put_setting(TELEMETRY_ID, None)?;
        }
        Ok(())
    }

    /// The random id telemetry events carry. It is created on first use and
    /// never derived from an account or the machine.
    pub fn telemetry_id(&self) -> Result<String, String> {
        if let Some(id) = Self::setting(&self.connection()?, TELEMETRY_ID)? {
            return Ok(id);
        }
        let id = uuid::Uuid::new_v4().to_string();
        self.put_setting(TELEMETRY_ID, Some(&id))?;
        Ok(id)
    }

    /// Records the running version and returns the one that ran before,
    /// when it differs. `None` on a fresh install or an unchanged version.
    pub fn record_run_version(&self, version: &str) -> Result<Option<String>, String> {
        let previous = Self::setting(&self.connection()?, LAST_RUN_VERSION)?;
        if previous.as_deref() != Some(version) {
            self.put_setting(LAST_RUN_VERSION, Some(version))?;
        }
        Ok(previous.filter(|value| value != version))
    }

    pub fn set_update_channel(&self, channel: UpdateChannel) -> Result<(), String> {
        self.put_setting(UPDATE_CHANNEL, Some(channel.as_str()))
    }

    pub fn set_show_menu_bar_item(&self, visible: bool) -> Result<(), String> {
        self.put_setting(SHOW_MENU_BAR_ITEM, Some(if visible { "1" } else { "0" }))
    }

    /// The interface language the frontend last reported, when any.
    pub fn language(&self) -> Result<Option<String>, String> {
        Self::setting(&self.connection()?, LANGUAGE)
    }

    pub fn set_language(&self, locale: &str) -> Result<(), String> {
        self.put_setting(LANGUAGE, Some(locale))
    }

    pub fn set_tray_summary(&self, summary: Option<&TraySummary>) -> Result<(), String> {
        let value = summary
            .map(serde_json::to_string)
            .transpose()
            .map_err(|error| error.to_string())?;
        self.put_setting(TRAY_SUMMARY, value.as_deref())
    }

    /// Stores the user's name for a connection. An empty name clears it.
    pub fn set_custom_label(&self, id: &str, label: Option<&str>) -> Result<(), String> {
        let label = label.map(str::trim).filter(|value| !value.is_empty());
        let changed = self
            .connection()?
            .execute(
                "UPDATE provider_connections SET custom_label = ?2, updated_at = ?3 WHERE id = ?1",
                params![id, label, Utc::now().to_rfc3339()],
            )
            .map_err(|error| error.to_string())?;
        if changed == 0 {
            return Err("The connection does not exist.".to_string());
        }
        Ok(())
    }

    fn add_column_if_missing(
        connection: &Connection,
        table: &str,
        column: &str,
        definition: &str,
    ) -> Result<(), String> {
        let mut statement = connection
            .prepare(&format!("PRAGMA table_info({table})"))
            .map_err(|error| error.to_string())?;
        let exists = statement
            .query_map([], |row| row.get::<_, String>(1))
            .map_err(|error| error.to_string())?
            .flatten()
            .any(|name| name == column);
        if !exists {
            connection
                .execute(
                    &format!("ALTER TABLE {table} ADD COLUMN {column} {definition}"),
                    [],
                )
                .map_err(|error| error.to_string())?;
        }
        Ok(())
    }

    pub fn delete_connection(&self, id: &str) -> Result<(), String> {
        let changed = self
            .connection()?
            .execute("DELETE FROM provider_connections WHERE id = ?1", [id])
            .map_err(|error| error.to_string())?;
        if changed == 0 {
            return Err("The connection does not exist.".to_string());
        }
        Ok(())
    }

    pub fn upsert_connections(&self, connections: &[NewConnection]) -> Result<(), String> {
        let mut connection = self.connection()?;
        let transaction = connection
            .transaction()
            .map_err(|error| error.to_string())?;
        let now = Utc::now().to_rfc3339();

        for item in connections {
            transaction
                .execute(
                    "INSERT INTO provider_connections (
                       id, provider, label, source_locator,
                       identity_user_id, identity_display_name, identity_plan, updated_at, kind
                     ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 'oauth')
                     ON CONFLICT(id) DO UPDATE SET
                       source_locator = excluded.source_locator,
                       label = excluded.label,
                       identity_user_id = COALESCE(excluded.identity_user_id, provider_connections.identity_user_id),
                       identity_display_name = COALESCE(excluded.identity_display_name, provider_connections.identity_display_name),
                       identity_plan = COALESCE(excluded.identity_plan, provider_connections.identity_plan),
                       updated_at = excluded.updated_at",
                    params![
                        item.id,
                        item.provider.as_str(),
                        item.label,
                        item.source_locator,
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
                        last_updated_at, last_error,
                        identity_user_id, identity_display_name, identity_plan,
                        custom_label, alert_low_quota, alert_reset_soon,
                        alert_reset_happened, auto_ping_enabled,
                        last_auto_ping_reset_key, last_auto_ping_at,
                        last_auto_ping_error, auto_ping_observed_reset_at,
                        last_auto_ping_attempt_at, reset_credits, hidden_windows
                 FROM provider_connections
                 ORDER BY CASE provider
                   WHEN 'claude' THEN 0
                   WHEN 'codex' THEN 1
                   WHEN 'gemini-cli' THEN 2
                   WHEN 'antigravity' THEN 3
                   ELSE 4
                 END,
                          label",
            )
            .map_err(|error| error.to_string())?;

        let rows = statement
            .query_map([], |row| {
                let provider_text: String = row.get(1)?;
                let provider = Provider::from_db(&provider_text).unwrap_or(Provider::Claude);
                let user_id: Option<String> = row.get(9)?;
                let display_name: Option<String> = row.get(10)?;
                let plan: Option<String> = row.get(11)?;
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
                    custom_label: row.get(12)?,
                    identity,
                    alerts: ConnectionAlerts {
                        low_quota: row.get::<_, i64>(13)? != 0,
                        reset_soon: row.get::<_, i64>(14)? != 0,
                        reset_happened: row.get::<_, i64>(15)? != 0,
                    },
                    auto_ping: AutoPingState {
                        enabled: row.get::<_, i64>(16)? != 0,
                        last_reset_key: row.get(17)?,
                        last_ping_at: row.get(18)?,
                        last_error: row.get(19)?,
                        observed_reset_at: row.get(20)?,
                        last_attempt_at: row.get(21)?,
                    },
                    windows: Vec::new(),
                    reset_credits: row
                        .get::<_, Option<String>>(22)?
                        .and_then(|json| serde_json::from_str(&json).ok())
                        .unwrap_or_default(),
                    hidden_windows: row
                        .get::<_, Option<String>>(23)?
                        .and_then(|json| serde_json::from_str(&json).ok())
                        .unwrap_or_default(),
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
            refreshed_at,
            settings: self.settings()?,
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
                "SELECT window_key, label, used_percent, resets_at, unlimited, amount, paid
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
                    unlimited: row.get::<_, i64>(4)? != 0,
                    amount: row
                        .get::<_, Option<String>>(5)?
                        .and_then(|json| serde_json::from_str(&json).ok()),
                    paid: row.get::<_, i64>(6)? != 0,
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

    pub fn set_connection_alerts(&self, id: &str, alerts: &ConnectionAlerts) -> Result<(), String> {
        let changed = self
            .connection()?
            .execute(
                "UPDATE provider_connections SET
                   alert_low_quota = ?2, alert_reset_soon = ?3,
                   alert_reset_happened = ?4, updated_at = ?5
                 WHERE id = ?1",
                params![
                    id,
                    alerts.low_quota as i64,
                    alerts.reset_soon as i64,
                    alerts.reset_happened as i64,
                    Utc::now().to_rfc3339(),
                ],
            )
            .map_err(|error| error.to_string())?;
        if changed == 0 {
            return Err("The connection does not exist.".to_string());
        }
        Ok(())
    }

    /// Remembers which quota bars the user hid on the account card.
    pub fn set_hidden_windows(&self, id: &str, keys: &[String]) -> Result<(), String> {
        let json = if keys.is_empty() {
            None
        } else {
            Some(serde_json::to_string(keys).map_err(|error| error.to_string())?)
        };
        let changed = self
            .connection()?
            .execute(
                "UPDATE provider_connections SET hidden_windows = ?2, updated_at = ?3 WHERE id = ?1",
                params![id, json, Utc::now().to_rfc3339()],
            )
            .map_err(|error| error.to_string())?;
        if changed == 0 {
            return Err("The connection does not exist.".to_string());
        }
        Ok(())
    }

    /// Turning auto-ping on forgets the last observed reset, so the first
    /// ping waits for a reset that happens from now on.
    pub fn set_auto_ping_enabled(&self, id: &str, enabled: bool) -> Result<(), String> {
        let changed = self
            .connection()?
            .execute(
                "UPDATE provider_connections SET
                   auto_ping_enabled = ?2,
                   auto_ping_observed_reset_at = CASE
                     WHEN auto_ping_enabled = 0 AND ?2 = 1 THEN NULL
                     ELSE auto_ping_observed_reset_at
                   END,
                   last_auto_ping_error = CASE
                     WHEN ?2 = 0 THEN NULL ELSE last_auto_ping_error
                   END,
                   updated_at = ?3
                 WHERE id = ?1",
                params![id, enabled as i64, Utc::now().to_rfc3339()],
            )
            .map_err(|error| error.to_string())?;
        if changed == 0 {
            return Err("The connection does not exist.".to_string());
        }
        Ok(())
    }

    pub fn set_auto_ping_observation(&self, id: &str, reset_at: &str) -> Result<(), String> {
        self.connection()?
            .execute(
                "UPDATE provider_connections
                 SET auto_ping_observed_reset_at = ?2, updated_at = ?3
                 WHERE id = ?1",
                params![id, reset_at, Utc::now().to_rfc3339()],
            )
            .map_err(|error| error.to_string())?;
        Ok(())
    }

    pub fn save_auto_ping_success(
        &self,
        id: &str,
        reset_key: &str,
        observed_reset_at: &str,
    ) -> Result<(), String> {
        let now = Utc::now().to_rfc3339();
        self.connection()?
            .execute(
                "UPDATE provider_connections SET
                   last_auto_ping_reset_key = ?2, last_auto_ping_at = ?3,
                   last_auto_ping_attempt_at = ?3, last_auto_ping_error = NULL,
                   auto_ping_observed_reset_at = ?4, updated_at = ?3
                 WHERE id = ?1",
                params![id, reset_key, now, observed_reset_at],
            )
            .map_err(|error| error.to_string())?;
        Ok(())
    }

    pub fn save_auto_ping_failure(&self, id: &str, message: &str) -> Result<(), String> {
        let now = Utc::now().to_rfc3339();
        self.connection()?
            .execute(
                "UPDATE provider_connections SET
                   last_auto_ping_attempt_at = ?2, last_auto_ping_error = ?3,
                   updated_at = ?2
                 WHERE id = ?1",
                params![id, now, message],
            )
            .map_err(|error| error.to_string())?;
        Ok(())
    }

    pub fn claim_notification(
        &self,
        event_key: &str,
        connection_id: &str,
        kind: &str,
    ) -> Result<bool, String> {
        let changed = self
            .connection()?
            .execute(
                "INSERT OR IGNORE INTO notification_events(event_key, connection_id, kind, created_at)
                 VALUES (?1, ?2, ?3, ?4)",
                params![event_key, connection_id, kind, Utc::now().to_rfc3339()],
            )
            .map_err(|error| error.to_string())?;
        Ok(changed == 1)
    }

    pub fn release_notification_claim(&self, event_key: &str) {
        if let Ok(connection) = self.connection() {
            let _ = connection.execute(
                "DELETE FROM notification_events WHERE event_key = ?1",
                [event_key],
            );
        }
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
                    "INSERT INTO quota_windows(snapshot_id, window_key, label, used_percent, resets_at, unlimited, amount, paid)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                    params![
                        snapshot_id,
                        window.key,
                        window.label,
                        window.used_percent,
                        window.resets_at,
                        window.unlimited as i64,
                        window
                            .amount
                            .as_ref()
                            .and_then(|amount| serde_json::to_string(amount).ok()),
                        window.paid as i64,
                    ],
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
                   identity_plan = COALESCE(?6, identity_plan), updated_at = ?3,
                   reset_credits = COALESCE(?7, reset_credits)
                 WHERE id = ?1",
                params![
                    id,
                    reading.source,
                    captured_at,
                    identity.and_then(|value| value.provider_user_id.as_deref()),
                    identity.and_then(|value| value.display_name.as_deref()),
                    identity.and_then(|value| value.plan.as_deref()),
                    reading
                        .reset_credits
                        .as_ref()
                        .and_then(|credits| serde_json::to_string(credits).ok()),
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
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn persists_separate_connections_and_history() {
        let directory = tempfile::tempdir().expect("temporary directory");
        let database = Database::open(directory.path().join("test.sqlite3")).expect("database");
        let connections = vec![
            NewConnection {
                id: "claude-one".into(),
                provider: Provider::Claude,
                label: "Claude · One".into(),
                source_locator: "/tmp/.claude-one".into(),
                identity: None,
            },
            NewConnection {
                id: "claude-two".into(),
                provider: Provider::Claude,
                label: "Claude · Two".into(),
                source_locator: "/tmp/.claude-two".into(),
                identity: None,
            },
        ];
        database.upsert_connections(&connections).expect("upsert");

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
                            unlimited: false,
                            amount: None,
                            paid: false,
                        }],
                        reset_credits: None,
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

        database.delete_connection("claude-one").expect("delete");
        let state = database.dashboard_state().expect("state");
        assert_eq!(state.connections.len(), 1);
        assert_eq!(state.connections[0].id, "claude-two");
    }

    #[test]
    fn stores_hidden_windows() {
        let directory = tempfile::tempdir().expect("temporary directory");
        let database = Database::open(directory.path().join("test.sqlite3")).expect("database");
        database
            .upsert_connections(&[NewConnection {
                id: "claude-one".into(),
                provider: Provider::Claude,
                label: "Claude · One".into(),
                source_locator: "/tmp/.claude-one".into(),
                identity: None,
            }])
            .expect("upsert");

        database
            .set_hidden_windows("claude-one", &["seven_day".into(), "extra_usage".into()])
            .expect("hide");
        let state = database.dashboard_state().expect("state");
        assert_eq!(
            state.connections[0].hidden_windows,
            vec!["seven_day".to_string(), "extra_usage".to_string()]
        );
        database
            .set_hidden_windows("claude-one", &[])
            .expect("show all");
        let state = database.dashboard_state().expect("state");
        assert!(state.connections[0].hidden_windows.is_empty());
        assert!(database.set_hidden_windows("missing", &[]).is_err());
    }

    #[test]
    fn stores_custom_labels_and_settings() {
        let directory = tempfile::tempdir().expect("temporary directory");
        let database = Database::open(directory.path().join("test.sqlite3")).expect("database");
        database
            .upsert_connections(&[NewConnection {
                id: "claude-one".into(),
                provider: Provider::Claude,
                label: "Claude · One".into(),
                source_locator: "/tmp/.claude-one".into(),
                identity: None,
            }])
            .expect("upsert");

        database
            .set_custom_label("claude-one", Some("  Work  "))
            .expect("label");
        let state = database.dashboard_state().expect("state");
        assert_eq!(state.connections[0].custom_label.as_deref(), Some("Work"));
        database
            .set_custom_label("claude-one", Some(""))
            .expect("clear");
        let state = database.dashboard_state().expect("state");
        assert_eq!(state.connections[0].custom_label, None);

        let alerts = ConnectionAlerts {
            low_quota: true,
            reset_soon: false,
            reset_happened: true,
        };
        database
            .set_connection_alerts("claude-one", &alerts)
            .expect("alerts");
        database
            .set_auto_ping_enabled("claude-one", true)
            .expect("auto-ping");
        let state = database.dashboard_state().expect("state");
        assert_eq!(state.connections[0].alerts, alerts);
        assert!(state.connections[0].auto_ping.enabled);
        assert!(database
            .claim_notification("low:one", "claude-one", "low_quota")
            .expect("first notification"));
        assert!(!database
            .claim_notification("low:one", "claude-one", "low_quota")
            .expect("duplicate notification"));
        assert_eq!(database.language().expect("language"), None);
        database.set_language("fr-FR").expect("set language");
        assert_eq!(
            database.language().expect("language").as_deref(),
            Some("fr-FR")
        );

        assert!(state.settings.show_menu_bar_item);
        database.set_show_menu_bar_item(false).expect("setting");
        assert!(!database.settings().expect("settings").show_menu_bar_item);

        assert_eq!(state.settings.tray_summary, None);
        let summary = TraySummary {
            connection_id: "claude-one".into(),
            window_key: "five_hour".into(),
        };
        database.set_tray_summary(Some(&summary)).expect("summary");
        assert_eq!(
            database.settings().expect("settings").tray_summary,
            Some(summary)
        );
        database.set_tray_summary(None).expect("clear summary");
        assert_eq!(database.settings().expect("settings").tray_summary, None);

        assert_eq!(state.settings.update_channel, UpdateChannel::Stable);
        database
            .set_update_channel(UpdateChannel::Nightly)
            .expect("channel");
        assert_eq!(
            database.settings().expect("settings").update_channel,
            UpdateChannel::Nightly
        );

        assert!(state.settings.telemetry_enabled);
        let id = database.telemetry_id().expect("telemetry id");
        assert_eq!(database.telemetry_id().expect("telemetry id"), id);
        database
            .set_telemetry_enabled(false)
            .expect("telemetry off");
        assert!(!database.settings().expect("settings").telemetry_enabled);
        database.set_telemetry_enabled(true).expect("telemetry on");
        assert_ne!(database.telemetry_id().expect("new telemetry id"), id);

        assert_eq!(
            database.record_run_version("1.0.0").expect("first run"),
            None
        );
        assert_eq!(
            database.record_run_version("1.0.0").expect("same run"),
            None
        );
        assert_eq!(
            database.record_run_version("1.1.0").expect("upgrade"),
            Some("1.0.0".to_string())
        );
    }
}
