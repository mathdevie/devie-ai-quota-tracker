//! Finds provider CLI profiles that already exist on this Mac.
//!
//! Discovery is best effort and must never break a refresh: every step
//! returns an empty list on failure, external commands run with a timeout,
//! and a folder only counts as a profile when it holds real CLI data.

use std::{
    collections::BTreeSet,
    env, fs,
    path::{Path, PathBuf},
    process::{Command, Stdio},
    sync::mpsc,
    thread,
    time::Duration,
};

use serde_json::Value;
use uuid::Uuid;

use crate::{
    executable,
    model::{CaptureState, ConnectionKind, DiscoveredConnection, Provider, RemoteIdentity},
};

const GH_TIMEOUT: Duration = Duration::from_secs(8);

pub fn discover() -> Vec<DiscoveredConnection> {
    let mut connections = Vec::new();
    connections.extend(discover_profile_dirs(Provider::Claude));
    connections.extend(discover_profile_dirs(Provider::Codex));
    connections.extend(discover_github_accounts());
    connections
}

fn discover_profile_dirs(provider: Provider) -> Vec<DiscoveredConnection> {
    let Some(home) = dirs::home_dir() else {
        return Vec::new();
    };
    let (environment_key, base_name) = match provider {
        Provider::Claude => ("CLAUDE_CONFIG_DIR", ".claude"),
        Provider::Codex => ("CODEX_HOME", ".codex"),
        Provider::Copilot => return Vec::new(),
    };

    let mut paths = BTreeSet::new();
    if let Some(value) = env::var_os(environment_key).filter(|value| !value.is_empty()) {
        paths.insert(PathBuf::from(value));
    }
    paths.insert(home.join(base_name));
    if let Ok(entries) = fs::read_dir(&home) {
        for entry in entries.flatten() {
            let path = entry.path();
            let matches = path
                .file_name()
                .and_then(|value| value.to_str())
                .is_some_and(|name| name.starts_with(&format!("{base_name}-")));
            if matches && path.is_dir() {
                paths.insert(path);
            }
        }
    }

    paths
        .into_iter()
        .filter_map(|path| canonical_dir(&path))
        .collect::<BTreeSet<_>>()
        .into_iter()
        .filter(|path| looks_like_profile(&provider, path))
        .map(|path| profile_connection(provider.clone(), &path, base_name))
        .collect()
}

/// Resolves symlinks so `~/.claude` and a linked copy count once.
fn canonical_dir(path: &Path) -> Option<PathBuf> {
    let canonical = fs::canonicalize(path).ok()?;
    canonical.is_dir().then_some(canonical)
}

/// A folder is a profile when the CLI wrote something into it. This keeps
/// unrelated `~/.claude-*` folders from other tools out of the list.
pub fn looks_like_profile(provider: &Provider, path: &Path) -> bool {
    let markers: &[&str] = match provider {
        Provider::Claude => &[
            ".credentials.json",
            "settings.json",
            "history.jsonl",
            "projects",
            "statsig",
            ".claude.json",
        ],
        Provider::Codex => &["auth.json", "config.toml", "sessions", "history.jsonl"],
        Provider::Copilot => return false,
    };
    markers.iter().any(|marker| path.join(marker).exists())
}

pub fn profile_connection(
    provider: Provider,
    path: &Path,
    base_name: &str,
) -> DiscoveredConnection {
    let profile_name = path
        .file_name()
        .and_then(|value| value.to_str())
        .and_then(|name| name.strip_prefix(base_name))
        .map(|value| value.trim_start_matches('-'))
        .filter(|value| !value.is_empty())
        .map(title_case)
        .unwrap_or_else(|| "Default".to_string());
    let provider_name = match provider {
        Provider::Claude => "Claude",
        Provider::Codex => "Codex",
        Provider::Copilot => "Copilot",
    };
    let source_locator = path.to_string_lossy().into_owned();
    let capture_state = if provider == Provider::Claude {
        Some(if has_managed_status_line(path) {
            CaptureState::Installed
        } else {
            CaptureState::Available
        })
    } else {
        None
    };

    DiscoveredConnection {
        id: connection_id(provider.as_str(), &source_locator),
        provider,
        kind: ConnectionKind::Local,
        label: format!("{provider_name} CLI · {profile_name}"),
        source_locator,
        capture_state,
        identity: None,
    }
}

fn has_managed_status_line(config_dir: &Path) -> bool {
    let Ok(data) = fs::read(config_dir.join("settings.json")) else {
        return false;
    };
    let Ok(json) = serde_json::from_slice::<Value>(&data) else {
        return false;
    };
    json.get("statusLine")
        .and_then(|value| value.get("command"))
        .and_then(Value::as_str)
        .is_some_and(|command| command.contains("devie-qt-statusline"))
}

fn discover_github_accounts() -> Vec<DiscoveredConnection> {
    let Ok(binary) = executable::resolve("gh") else {
        return Vec::new();
    };
    let Some(output) = run_with_timeout(
        Command::new(binary)
            .args(["auth", "status", "--json", "hosts"])
            .env("GH_PROMPT_DISABLED", "1")
            .env("GH_NO_UPDATE_NOTIFIER", "1")
            .stdin(Stdio::null()),
        GH_TIMEOUT,
    ) else {
        return Vec::new();
    };
    // `gh auth status` exits non-zero when one account is stale, but the
    // JSON still lists every account, so parse regardless of the status.
    let Ok(json) = serde_json::from_slice::<Value>(&output) else {
        return Vec::new();
    };
    parse_gh_hosts(&json)
}

pub fn parse_gh_hosts(json: &Value) -> Vec<DiscoveredConnection> {
    let Some(hosts) = json.get("hosts").and_then(Value::as_object) else {
        return Vec::new();
    };
    let mut connections = Vec::new();
    for (host, accounts) in hosts {
        let Some(accounts) = accounts.as_array() else {
            continue;
        };
        for account in accounts {
            let Some(login) = account.get("login").and_then(Value::as_str) else {
                continue;
            };
            let locator = format!("{host}/{login}");
            connections.push(DiscoveredConnection {
                id: connection_id("copilot", &locator),
                provider: Provider::Copilot,
                kind: ConnectionKind::Local,
                label: format!("GitHub CLI · {login}"),
                source_locator: locator,
                capture_state: None,
                identity: Some(RemoteIdentity {
                    provider_user_id: Some(login.to_string()),
                    display_name: Some(login.to_string()),
                    plan: None,
                }),
            });
        }
    }
    connections
}

/// Runs a command and returns its stdout, or `None` on failure or timeout.
fn run_with_timeout(command: &mut Command, timeout: Duration) -> Option<Vec<u8>> {
    let mut child = command
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .ok()?;
    let mut stdout = child.stdout.take()?;
    let (sender, receiver) = mpsc::channel();
    thread::spawn(move || {
        use std::io::Read;
        let mut buffer = Vec::new();
        let _ = stdout.read_to_end(&mut buffer);
        let _ = sender.send(buffer);
    });
    match receiver.recv_timeout(timeout) {
        Ok(output) => {
            let _ = child.wait();
            Some(output)
        }
        Err(_) => {
            let _ = child.kill();
            let _ = child.wait();
            None
        }
    }
}

pub fn connection_id(provider: &str, locator: &str) -> String {
    Uuid::new_v5(
        &Uuid::NAMESPACE_URL,
        format!("com.devie.qt/{provider}/{locator}").as_bytes(),
    )
    .to_string()
}

fn title_case(value: &str) -> String {
    value
        .split(['-', '_'])
        .filter(|part| !part.is_empty())
        .map(|part| {
            let mut characters = part.chars();
            characters
                .next()
                .map(|first| first.to_uppercase().collect::<String>() + characters.as_str())
                .unwrap_or_default()
        })
        .collect::<Vec<_>>()
        .join(" ")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn stable_connection_ids_keep_profiles_separate() {
        let first = connection_id("claude", "/Users/test/.claude-work");
        let repeated = connection_id("claude", "/Users/test/.claude-work");
        let second = connection_id("claude", "/Users/test/.claude-personal");
        assert_eq!(first, repeated);
        assert_ne!(first, second);
    }

    #[test]
    fn profile_suffix_becomes_a_label() {
        let item = profile_connection(
            Provider::Claude,
            Path::new("/Users/test/.claude-client-work"),
            ".claude",
        );
        assert_eq!(item.label, "Claude CLI · Client Work");
        assert_eq!(item.kind, ConnectionKind::Local);
    }

    #[test]
    fn empty_folders_are_not_profiles() {
        let root = tempfile::tempdir().expect("temp dir");
        let empty = root.path().join(".claude-empty");
        fs::create_dir(&empty).expect("dir");
        assert!(!looks_like_profile(&Provider::Claude, &empty));
        fs::write(empty.join("settings.json"), "{}").expect("settings");
        assert!(looks_like_profile(&Provider::Claude, &empty));
        let codex = root.path().join(".codex");
        fs::create_dir_all(codex.join("sessions")).expect("sessions");
        assert!(looks_like_profile(&Provider::Codex, &codex));
    }

    #[test]
    fn parses_gh_hosts_with_several_accounts() {
        let json: Value = serde_json::from_str(
            r#"{"hosts":{"github.com":[{"login":"one","active":true},{"login":"two","active":false}]}}"#,
        )
        .expect("json");
        let accounts = parse_gh_hosts(&json);
        assert_eq!(accounts.len(), 2);
        assert_eq!(accounts[1].source_locator, "github.com/two");
    }

    #[test]
    fn command_timeout_does_not_hang() {
        let output = run_with_timeout(Command::new("sleep").arg("5"), Duration::from_millis(200));
        assert!(output.is_none());
        let output = run_with_timeout(Command::new("echo").arg("hi"), Duration::from_secs(2));
        assert_eq!(output.as_deref(), Some(b"hi\n".as_slice()));
    }
}
