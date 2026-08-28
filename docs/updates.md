# Auto-updates

Devie Quota updates itself through CrabNebula Cloud, the same way the Mana
desktop app does. The app checks at start and installs a found update right
away. Later checks run every 15 minutes; a downloaded update shows an
**Update available** button in the sidebar.

Updates run only in packaged builds. `tauri dev` never reads the update feed
(`NEXT_PUBLIC_IS_DESKTOP_BUILD` is set by `beforeBuildCommand` only).

## Channels

There are two release channels, picked in Settings › Updates:

- **Stable** (default): CrabNebula's unnamed default channel. Releases come
  from the `Release Desktop App` workflow on a `v*` tag.
- **Nightly**: the `nightly` channel on CrabNebula. Releases come from the
  `Nightly Desktop App` workflow, run by hand from the Actions tab. The
  version is the next patch plus a `-nightly.<timestamp>` suffix (for
  example `0.9.7-nightly.202608281200`), so it always sorts above the
  latest stable release.

The channel decides the update endpoint, so it must be set at runtime:
`src-desktop/src/updater.rs` builds the CrabNebula URL (nightly adds
`?channel=nightly`) and runs the check, download, and install. The frontend
(`src/components/updater/AppUpdater.tsx`) only drives the interface. Both
channels are signed with the same updater key.

Switching from Nightly back to Stable never downgrades: the app stays on
its nightly version until a stable release with a higher version ships.

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
