# Auto-updates

Devie QT updates itself through CrabNebula Cloud, the same way the Mana
desktop app does. The app checks at start and installs a found update right
away. Later checks run every 15 minutes; a downloaded update shows an
**Update available** button in the sidebar.

Updates run only in packaged builds. `tauri dev` never reads the update feed
(`NEXT_PUBLIC_IS_DESKTOP_BUILD` is set by `beforeBuildCommand` only).

## One-time setup

1. Create the `mathdevie/devie-qt` application on https://web.crabnebula.cloud
   and create an API key. Store it as the `CN_API_KEY` secret in the
   `Release` GitHub environment.
2. Generate the updater signing key:

   ```sh
   bunx tauri signer generate -w ~/.tauri/devie-qt.key
   ```

   - Put the public key in `src-desktop/tauri.conf.json` under
     `plugins.updater.pubkey` (replace `REPLACE_WITH_TAURI_UPDATER_PUBLIC_KEY`).
   - Store the private key as `TAURI_SIGNING_PRIVATE_KEY` and its password as
     `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` in the `Release` environment.
3. Keep the Apple signing secrets from `docs/macos-signing.md`.

## Release

1. Bump `version` in `src-desktop/tauri.conf.json` and commit.
2. Tag the commit `v<version>` and push the tag.
3. The `Release Desktop App` workflow drafts the release, builds both macOS
   targets, uploads them, and publishes the release.
