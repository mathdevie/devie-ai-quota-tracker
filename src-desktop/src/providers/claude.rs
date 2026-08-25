//! Claude quota for CLI profiles found on this Mac.
//!
//! Like 9router: the subscription usage API with the token Claude Code stored
//! for this profile. The reads go through the shared cache in
//! `oauth::claude`, so several profiles and refresh buttons never hammer
//! Anthropic.

use std::path::Path;

use crate::{
    model::{ProviderConnection, QuotaReading, RemoteIdentity},
    oauth,
    providers::claude_credentials,
};

pub async fn refresh(
    connection: &ProviderConnection,
    client: &reqwest::Client,
    force: bool,
) -> Result<QuotaReading, String> {
    let config_dir = Path::new(&connection.source_locator).to_path_buf();
    let cli = tauri::async_runtime::spawn_blocking(move || claude_credentials::load(&config_dir))
        .await
        .map_err(|_| "The Claude credential lookup stopped early.".to_string())??;
    let mut reading =
        oauth::claude::cached_usage(client, &cli.credentials.access_token, force).await?;
    if let Some(plan) = cli.plan {
        let identity = reading.identity.get_or_insert_with(RemoteIdentity::default);
        if identity.plan.is_none() {
            identity.plan = Some(plan);
        }
    }
    Ok(reading)
}

#[cfg(test)]
mod live_tests {
    use super::*;

    /// Runs against the real CLI logins on this Mac. `cargo test -- --ignored live_`.
    #[test]
    #[ignore]
    fn live_reads_quota_for_each_local_claude_profile() {
        let client = reqwest::Client::new();
        for dir in ["/Users/math/.claude", "/Users/math/.claude-personal"] {
            let cli = claude_credentials::load(Path::new(dir)).expect(dir);
            let reading = tauri::async_runtime::block_on(oauth::claude::cached_usage(
                &client,
                &cli.credentials.access_token,
                true,
            ))
            .expect(dir);
            let again = tauri::async_runtime::block_on(oauth::claude::cached_usage(
                &client,
                &cli.credentials.access_token,
                false,
            ))
            .expect(dir);
            eprintln!(
                "{dir}: plan={:?} identity={:?} windows={:?} second_source={}",
                cli.plan, reading.identity, reading.windows, again.source
            );
            assert!(!reading.windows.is_empty());
            assert!(again.source.ends_with("(cached)"));
        }
    }
}
