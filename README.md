<img src="docs/logo/app-icon.svg" alt="The Devie AI Quota Tracker app icon" width="96" />

# Devie AI Quota Tracker

[![Version](https://img.shields.io/github/v/tag/mathdevie/devie-ai-quota-tracker?label=version&color=4c1)](https://web.crabnebula.cloud/mathdev/devie-quota/releases)
![Platform](https://img.shields.io/badge/macOS-12%2B-black?logo=apple)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/mathdevie/devie-ai-quota-tracker?style=flat&color=yellow)](https://github.com/mathdevie/devie-ai-quota-tracker/stargazers)
[![Download](https://img.shields.io/badge/download-DMG-0D96F6?logo=apple&logoColor=white)](https://cdn.crabnebula.app/download/mathdev/devie-quota/latest/platform/dmg-aarch64)

**Every AI subscription quota, in the macOS menu bar.**

Claude Code · Codex · Gemini CLI · GitHub Copilot · Cursor

Sign in once per account. See every quota window and its reset time. Get a
notification before a limit hits. There is no Devie account, cloud database,
proxy, or hosted backend — all data stays on the Mac.

## Summary

- 📊 One dashboard for Claude Code, Codex, Gemini CLI, GitHub Copilot, and Cursor quotas.
- 📌 A menu bar item with the percent left; pin any quota, one click opens the popover.
- 👥 Any number of accounts per provider — work and personal side by side.
- 🔔 Alerts per account: low quota, reset soon, and reset happened.
- ⚡ Quota Optimizer: start a session timer right after each reset.
- 🔄 Automatic five-minute refresh; a failed refresh keeps the last snapshot as "Stale".
- 🎨 Light, Dark, System, and eight custom themes.
- 🌍 Fifteen interface languages.
- 🔒 Local only: OAuth tokens in private files, quota data in local SQLite.

## Installation

### Download

[![Download for macOS (Apple silicon)](https://img.shields.io/badge/Download_for_macOS-Apple_silicon-0D96F6?style=for-the-badge&logo=apple&logoColor=white)](https://cdn.crabnebula.app/download/mathdev/devie-quota/latest/platform/dmg-aarch64)

1. Download the DMG (signed and notarized, Apple silicon).
2. Drag **Devie AI Quota Tracker** to Applications.
3. Launch it and add an account under **Providers**.

The app updates itself. All versions are on the
[releases page](https://web.crabnebula.cloud/mathdev/devie-quota/releases).

### Build from source

You need [Bun](https://bun.sh/), a stable Rust toolchain, and the
[Tauri macOS prerequisites](https://v2.tauri.app/start/prerequisites/).

```sh
git clone https://github.com/mathdevie/devie-ai-quota-tracker.git
cd devie-ai-quota-tracker
bun install
bunx tauri build --bundles app
```

The bundle is written under `src-desktop/target/release/bundle/macos/`.
See [CONTRIBUTING.md](CONTRIBUTING.md) for the development setup.

## Features

### Quota dashboard

All accounts on one screen: every quota window, the percent left, and the
time to the next reset. Filter by provider and sort by expiry.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/app-preview.png" />
  <img src="docs/screenshots/theme-light.png" alt="The quota dashboard with Claude Code, Codex, Cursor, and GitHub Copilot accounts" width="760" />
</picture>

### Menu bar and popover

The menu bar shows the provider logo and the percent left of a pinned
quota. One click opens the popover with every account — no window, no dock
icon needed.

<img src="docs/screenshots/menu-bar.jpg" alt="The menu bar popover over the desktop, with quotas for every account" width="760" />

### Providers and accounts

In-app OAuth sign-in for each provider, with any number of accounts per
provider. Each account is a separate connection with its own token file.

<img src="docs/screenshots/providers.png" alt="The Settings window with provider cards and connection counts" width="760" />

### Alerts

Three alerts per account: low quota, reset soon, and reset happened. A
test button sends a sample notification.

<img src="docs/screenshots/alerts.png" alt="The Alerts dialog with low quota, reset soon, and reset complete toggles" width="760" />

### Quota Optimizer

A reset timer normally starts on first use. The optimizer sends a small
request right after each reset, so the timer starts immediately and the
next reset comes sooner.

<img src="docs/screenshots/quota-optimizer.png" alt="The Quota Optimizer dialog with the auto-start session timers option" width="760" />

## Themes

Light, Dark, System, and eight custom themes.

| Light | Dark |
| :---: | :---: |
| <img src="docs/screenshots/theme-light.png" alt="The Light theme" /> | <img src="docs/screenshots/theme-dark.png" alt="The Dark theme" /> |
| **Midnight Ink** | **Copper Sunset** |
| <img src="docs/screenshots/theme-midnight.png" alt="The Midnight Ink theme" /> | <img src="docs/screenshots/theme-copper.png" alt="The Copper Sunset theme" /> |
| **Aurora Green** | **Sharingan** |
| <img src="docs/screenshots/theme-aurora.png" alt="The Aurora Green theme" /> | <img src="docs/screenshots/theme-sharingan.png" alt="The Sharingan theme" /> |
| **Alpine Snow** | **Command Prompt** |
| <img src="docs/screenshots/theme-alpine-snow.png" alt="The Alpine Snow theme" /> | <img src="docs/screenshots/theme-command.png" alt="The Command Prompt theme" /> |
| **Totoro** | **Catpuccin Latte** |
| <img src="docs/screenshots/theme-totoro.png" alt="The Totoro theme" /> | <img src="docs/screenshots/theme-catpuccin.png" alt="The Catpuccin Latte theme" /> |

## FAQ

**Which providers and plans are supported?**

| Provider | Sign-in | Quota source |
| --- | --- | --- |
| Claude | Claude Code OAuth client, PKCE, callback on `localhost:54545` (or a pasted code) | `api.anthropic.com/api/oauth/usage` |
| Codex | Codex CLI OAuth client, PKCE, callback on `localhost:1455` | `chatgpt.com/backend-api/wham/usage` |
| Gemini CLI | Gemini CLI OAuth client and a dynamic loopback callback | `cloudcode-pa.googleapis.com/v1internal:retrieveUserQuota` |
| GitHub Copilot | GitHub device code flow with the Copilot client id | `api.github.com/copilot_internal/user` |
| Cursor | Cursor desktop PKCE deep link (`cursor.com/loginDeepControl`), polled on `api2.cursor.sh/auth/poll`, no callback port | `cursor.com/api/usage-summary` |

**Does it run on Intel Macs?**

The official build is Apple silicon only. An Intel build is untested; you
can try a build from source.

**Does the app change my CLI logins?**

No. The app owns the tokens for every sign-in and never reads or changes
the CLI logins on this Mac.

**Where is my data stored?**

Everything is local. Tokens live in one private file per connection with
`0600` permissions, under
`~/Library/Application Support/com.devie.quota/credentials/`. Quota
snapshots live in
`~/Library/Application Support/com.devie.quota/devie-quota.sqlite3`.
SQLite stores neither tokens nor complete provider responses, and provider
tokens never enter the React webview. Removing an account deletes its
token file.

**Does the app send anything anywhere?**

Provider quota checks contact Anthropic, Google, OpenAI, or GitHub — there
is no other backend. Anonymous usage events and crash reports go to
PostHog (EU): a random id, the app version, the OS, and the locale — never
account names, tokens, quota numbers, or labels. Turn this off in
**Settings → Privacy**. Builds without `POSTHOG_API_KEY` send nothing.

**Why are quota reads sometimes marked "Stale"?**

A failed refresh keeps the last good snapshot and marks it "Stale". Claude
usage reads share one cache: a read stays fresh for five minutes on the
timer (a refresh button always fetches), one request per token runs at a
time, and a `429` pauses the endpoint for three minutes.

**How does the app update itself?**

Through CrabNebula Cloud. The app checks for a signed update at start and
in the background; see [docs/updates.md](docs/updates.md).

**How is it built?**

A Next.js static interface inside a Tauri shell. Rust owns network
requests, SQLite, and the menu bar; the webview receives normalized
connection and quota values only. `src/ui` is a byte-identical mirror of
the [Devie UI](https://www.devie-ui.com/) `src/ui` folder — never edit it
directly.

**Can a fork ship its own builds?**

Yes, after it replaces the project-specific values: the bundle identifier
`com.devie.quota` in `src-desktop/tauri.conf.json`, the CrabNebula Cloud
slug `mathdev/devie-quota` in the updater endpoint
(`src-desktop/src/updater.rs`) and the release workflow, the updater
`pubkey` with a matching private signing key, and the Apple signing
secrets (see [the macOS signing guide](docs/macos-signing.md)). Without
these changes a fork collides with the upstream bundle id and queries an
updater feed it cannot publish to.

## Contributing

Issues and pull requests are welcome. Read
[CONTRIBUTING.md](CONTRIBUTING.md) for the prerequisites, the development
commands, the project rules, and the pull request checklist.

```sh
bun install          # dependencies
bun run dev:desktop  # run the desktop app
bun run check        # frontend checks
cargo test --locked  # Rust tests, in src-desktop/
```

## License and credits

Devie AI Quota Tracker is released under the [MIT License](LICENSE). See
[NOTICE.md](NOTICE.md) for third-party attribution.

The design combines useful ideas from these projects:

- [Devie UI](https://www.devie-ui.com/) for components, tokens, and themes.
- [AIUsage](https://github.com/sylearn/AIUsage) for the quota dashboard scope.
- [CodexBar](https://github.com/steipete/CodexBar) for menu bar and provider-source patterns.
- [usage4claude](https://github.com/f-is-h/usage4claude) for a compact menu bar presentation.
- [9router](https://github.com/decolua/9router) for multi-account provider concepts.
