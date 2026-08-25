# Auto-updates

Devie Quota updates itself through CrabNebula Cloud, the same way the Mana
desktop app does. The app checks at start and installs a found update right
away. Later checks run every 15 minutes; a downloaded update shows an
**Update available** button in the sidebar.

Updates run only in packaged builds. `tauri dev` never reads the update feed
(`NEXT_PUBLIC_IS_DESKTOP_BUILD` is set by `beforeBuildCommand` only).

## One-time setup

1. Create the `mathdev/devie-quota` application on https://web.crabnebula.cloud
   and create an API key. Store it as the `CN_API_KEY` secret in the
   `Release` GitHub environment.
2. Generate the updater signing key:

   ```sh
   bunx tauri signer generate -w ~/.tauri/devie-quota.key
   ```

   - Put the public key in `src-desktop/tauri.conf.json` under
     `plugins.updater.pubkey`.
   - Store the private key as `TAURI_SIGNING_PRIVATE_KEY` and its password as
     `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` in the `Release` environment.
   - Keep a local backup of the private key and its password.
3. Keep the Apple signing secrets from `docs/macos-signing.md`.

## Release

1. Bump `version` in `src-desktop/tauri.conf.json` and commit.
2. Tag the commit `v<version>` and push the tag.
3. The `Release Desktop App` workflow drafts the release and builds Apple
   silicon. It uploads the build and publishes the release.
