use std::{
    fs,
    process::{Command, Stdio},
};

use serde::{Deserialize, Serialize};

use crate::{
    executable,
    model::{DiscoveredConnection, Provider},
};

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ManagedProfileMetadata {
    pub name: String,
}

pub fn create_profile(
    app_data_dir: &std::path::Path,
    provider: Provider,
    name: &str,
) -> Result<DiscoveredConnection, String> {
    let name = validate_name(name)?;
    let slug = slugify(&name);
    let root = app_data_dir.join("profiles").join(provider.as_str());
    fs::create_dir_all(&root)
        .map_err(|_| "The profile folder could not be created.".to_string())?;

    let profile_dir = root.join(&slug);
    if profile_dir.exists() {
        return Err("A profile with this name already exists.".to_string());
    }
    fs::create_dir(&profile_dir)
        .map_err(|_| "The profile folder could not be created.".to_string())?;

    let metadata = serde_json::to_vec_pretty(&ManagedProfileMetadata { name })
        .map_err(|error| error.to_string())?;
    fs::write(profile_dir.join(".devie-qt-profile.json"), metadata)
        .map_err(|_| "The profile metadata could not be saved.".to_string())?;

    Ok(crate::discovery::profile_connection(
        provider,
        &profile_dir,
        "",
    ))
}

pub fn login(provider: &Provider, source_locator: &str) -> Result<(), String> {
    let binary = executable::resolve(provider.as_str())?;
    let mut command = Command::new(binary);
    command
        .current_dir(source_locator)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null());

    match provider {
        Provider::Claude => {
            command
                .args(["auth", "login", "--claudeai"])
                .env("CLAUDE_CONFIG_DIR", source_locator);
        }
        Provider::Codex => {
            command.arg("login").env("CODEX_HOME", source_locator);
        }
        Provider::Copilot => return Err("Copilot login is not available yet.".to_string()),
    }

    let status = command
        .status()
        .map_err(|_| format!("{} login could not start.", provider_name(provider)))?;
    if status.success() {
        Ok(())
    } else {
        Err(format!(
            "{} login did not complete.",
            provider_name(provider)
        ))
    }
}

fn validate_name(name: &str) -> Result<String, String> {
    let name = name.trim();
    if name.is_empty() {
        return Err("Enter a profile name.".to_string());
    }
    if name.chars().count() > 48 {
        return Err("Use 48 characters or fewer for the profile name.".to_string());
    }
    if !name.chars().any(char::is_alphanumeric) {
        return Err("The profile name must include a letter or number.".to_string());
    }
    Ok(name.to_string())
}

fn slugify(name: &str) -> String {
    let mut slug = String::new();
    let mut separator = false;
    for character in name.chars().flat_map(char::to_lowercase) {
        if character.is_ascii_alphanumeric() {
            if separator && !slug.is_empty() {
                slug.push('-');
            }
            slug.push(character);
            separator = false;
        } else {
            separator = true;
        }
    }
    if slug.is_empty() {
        "profile".to_string()
    } else {
        slug
    }
}

fn provider_name(provider: &Provider) -> &'static str {
    match provider {
        Provider::Claude => "Claude",
        Provider::Codex => "Codex",
        Provider::Copilot => "Copilot",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn creates_a_named_isolated_profile() {
        let root = tempfile::tempdir().expect("temp dir");
        let profile =
            create_profile(root.path(), Provider::Claude, "Client Work").expect("managed profile");
        assert!(std::path::Path::new(&profile.source_locator).is_dir());
        assert_eq!(profile.label, "Claude · Client Work");
    }

    #[test]
    fn rejects_duplicate_profile_names() {
        let root = tempfile::tempdir().expect("temp dir");
        create_profile(root.path(), Provider::Codex, "Personal").expect("first profile");
        let error = create_profile(root.path(), Provider::Codex, "Personal")
            .expect_err("duplicate profile");
        assert_eq!(error, "A profile with this name already exists.");
    }
}
