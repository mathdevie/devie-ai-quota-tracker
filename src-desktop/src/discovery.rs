use std::{
    collections::BTreeSet,
    env, fs,
    path::{Path, PathBuf},
    process::Command,
};

use serde_json::Value;
use uuid::Uuid;

use crate::{
    accounts::ManagedProfileMetadata,
    executable,
    model::{CaptureState, DiscoveredConnection, Provider, RemoteIdentity},
};

pub fn discover(app_data_dir: &Path) -> Vec<DiscoveredConnection> {
    let mut connections = Vec::new();
    connections.extend(discover_profile_dirs(Provider::Claude));
    connections.extend(discover_profile_dirs(Provider::Codex));
    connections.extend(discover_managed_profiles(app_data_dir, Provider::Claude));
    connections.extend(discover_managed_profiles(app_data_dir, Provider::Codex));
    connections.extend(discover_github_accounts());
    connections
}

fn discover_managed_profiles(app_data_dir: &Path, provider: Provider) -> Vec<DiscoveredConnection> {
    let root = app_data_dir.join("profiles").join(provider.as_str());
    let Ok(entries) = fs::read_dir(root) else {
        return Vec::new();
    };
    entries
        .flatten()
        .map(|entry| entry.path())
        .filter(|path| path.is_dir())
        .map(|path| profile_connection(provider.clone(), &path, ""))
        .collect()
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
        .filter(|path| path.is_dir())
        .map(|path| profile_connection(provider.clone(), &path, base_name))
        .collect()
}

pub fn profile_connection(
    provider: Provider,
    path: &Path,
    base_name: &str,
) -> DiscoveredConnection {
    let managed_name = fs::read(path.join(".devie-qt-profile.json"))
        .ok()
        .and_then(|data| serde_json::from_slice::<ManagedProfileMetadata>(&data).ok())
        .map(|metadata| metadata.name);
    let profile_name = managed_name.unwrap_or_else(|| {
        path.file_name()
            .and_then(|value| value.to_str())
            .and_then(|name| name.strip_prefix(base_name))
            .map(|value| value.trim_start_matches('-'))
            .filter(|value| !value.is_empty())
            .map(title_case)
            .unwrap_or_else(|| "Default".to_string())
    });
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
        label: format!("{provider_name} · {profile_name}"),
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
    let output = Command::new(binary)
        .args(["auth", "status", "--json", "hosts"])
        .env("GH_PROMPT_DISABLED", "1")
        .output();
    let Ok(output) = output else {
        return Vec::new();
    };
    if !output.status.success() {
        return Vec::new();
    }
    let Ok(json) = serde_json::from_slice::<Value>(&output.stdout) else {
        return Vec::new();
    };
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
                label: format!("Copilot · {login}"),
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

fn connection_id(provider: &str, locator: &str) -> String {
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
        assert_eq!(item.label, "Claude · Client Work");
    }
}
