use std::{
    collections::HashSet,
    env, fs,
    path::{Path, PathBuf},
};

pub fn resolve(name: &str) -> Result<PathBuf, String> {
    resolve_from(
        name,
        env::var_os("PATH").as_deref(),
        dirs::home_dir().as_deref(),
    )
    .ok_or_else(|| format!("The {name} command is not available."))
}

fn resolve_from(
    name: &str,
    path: Option<&std::ffi::OsStr>,
    home: Option<&Path>,
) -> Option<PathBuf> {
    let mut directories = path
        .map(env::split_paths)
        .into_iter()
        .flatten()
        .collect::<Vec<_>>();

    directories.extend([
        PathBuf::from("/opt/homebrew/bin"),
        PathBuf::from("/usr/local/bin"),
        PathBuf::from("/usr/bin"),
    ]);

    if let Some(home) = home {
        directories.extend([
            home.join(".local/bin"),
            home.join(".bun/bin"),
            home.join(".cargo/bin"),
            home.join(".volta/bin"),
            home.join(".asdf/shims"),
            home.join(".npm-global/bin"),
            home.join("Library/pnpm"),
        ]);
        add_versioned_bin_dirs(&mut directories, &home.join(".nvm/versions/node"), "bin");
        add_versioned_bin_dirs(
            &mut directories,
            &home.join(".fnm/node-versions"),
            "installation/bin",
        );
    }

    let mut seen = HashSet::new();
    directories
        .into_iter()
        .filter(|directory| directory.is_absolute() && seen.insert(directory.clone()))
        .map(|directory| directory.join(name))
        .find(|candidate| is_executable(candidate))
}

fn add_versioned_bin_dirs(directories: &mut Vec<PathBuf>, root: &Path, suffix: &str) {
    let Ok(entries) = fs::read_dir(root) else {
        return;
    };
    directories.extend(entries.flatten().map(|entry| entry.path().join(suffix)));
}

fn is_executable(path: &Path) -> bool {
    let Ok(metadata) = fs::metadata(path) else {
        return false;
    };
    if !metadata.is_file() {
        return false;
    }
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        metadata.permissions().mode() & 0o111 != 0
    }
    #[cfg(not(unix))]
    {
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn finds_a_command_in_a_gui_safe_home_path() {
        let root = tempfile::tempdir().expect("temp dir");
        let bin = root.path().join(".local/bin");
        fs::create_dir_all(&bin).expect("bin dir");
        let command = bin.join("claude");
        fs::write(&command, "#!/bin/sh\n").expect("command");
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            fs::set_permissions(&command, fs::Permissions::from_mode(0o755)).expect("permissions");
        }

        assert_eq!(
            resolve_from("claude", None, Some(root.path())),
            Some(command)
        );
    }

    #[test]
    fn ignores_non_executable_files() {
        let root = tempfile::tempdir().expect("temp dir");
        let bin = root.path().join("bin");
        fs::create_dir_all(&bin).expect("bin dir");
        fs::write(bin.join("devie-qt-fake"), "not executable").expect("command");

        assert_eq!(
            resolve_from("devie-qt-fake", Some(bin.as_os_str()), None),
            None
        );
    }
}
