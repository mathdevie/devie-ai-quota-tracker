---
name: release
description: Cut a stable or nightly release of the desktop app, or set up the signing, notarization, and updater secrets it needs. Use when asked to release, publish, bump the version, or configure release secrets.
---

# Release

Releases are built by GitHub Actions, signed and notarized with a Developer ID
certificate, and published to CrabNebula Cloud, where the in-app updater picks
them up.

## Stable

1. From the repository root, run `bun .agents/skills/release/bump.js X.Y.Z`.
   It updates every version file; the workflow reads the version from
   `src-desktop/tauri.conf.json`.
2. Move the `[Unreleased]` entries in `CHANGELOG.md` under `## [X.Y.Z] - date`.
   The workflow publishes that section as the release notes.
3. Merge to `main`, then dispatch `Release Desktop App` from the Actions tab.
   It refuses to run when the `v<version>` tag exists, and tags the released
   commit after publishing.

## Nightly

Dispatch `Nightly Desktop App`. It builds the current commit as the next patch
plus `-nightly.<timestamp>` and publishes to the `nightly` channel, which only
users who chose Nightly in Settings receive. No bump is needed.

## One-time setup

Both workflows read these secrets from the `Release` GitHub environment:

| Secret                               | Value                                                  |
| ------------------------------------ | ------------------------------------------------------ |
| `CN_API_KEY`                         | API key of the `mathdev/devie-quota` CrabNebula app    |
| `TAURI_SIGNING_PRIVATE_KEY`          | Updater signing key                                    |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Its password                                           |
| `APPLE_CERTIFICATE`                  | Base64 of the exported Developer ID `.p12`             |
| `APPLE_CERTIFICATE_PASSWORD`         | The `.p12` export password                             |
| `APPLE_SIGNING_IDENTITY`             | The full Developer ID Application identity             |
| `APPLE_ID`                           | Apple account used for notarization                    |
| `APPLE_PASSWORD`                     | An app-specific password for that account              |
| `APPLE_TEAM_ID`                      | Apple Developer team id                                |
| `POSTHOG_API_KEY`                    | Stable only, optional; without it no telemetry is sent |

- Updater key: `bunx tauri signer generate -w ~/.tauri/devie-quota.key`. Put
  the public key in `src-desktop/tauri.conf.json` under
  `plugins.updater.pubkey`, store the private key and password as secrets, and
  keep a local backup. Losing it means existing installs can no longer update.
- Certificate: `base64 -i DeveloperIDApplication.p12 | pbcopy`.

Never commit certificates, keys, or passwords. Secrets cannot be read back
through the GitHub API; take the values from the Apple and CrabNebula accounts.
