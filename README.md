<div align="center">

<img src="docs/logo/app-icon.svg" alt="The Devie AI Quota Tracker app icon" width="110" />

# Devie AI Quota Tracker

**Every AI subscription quota, in the macOS menu bar.**

Claude Code · Codex · Gemini CLI · GitHub Copilot · Cursor

<br />

[![Download for macOS (Apple silicon)](https://img.shields.io/badge/Download_for_macOS-Apple_silicon-0D96F6?style=for-the-badge&logo=apple&logoColor=white)](https://cdn.crabnebula.app/download/mathdev/devie-quota/latest/platform/dmg-aarch64)

[![Version](https://img.shields.io/github/v/tag/mathdevie/devie-ai-quota-tracker?label=version&color=4c1)](https://web.crabnebula.cloud/mathdev/devie-quota/releases)
![Platform](https://img.shields.io/badge/macOS-12%2B-black?logo=apple)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

<br />

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/app-preview.png" />
  <img src="docs/screenshots/theme-light.png" alt="The quota dashboard with Claude Code, Codex, Cursor, and GitHub Copilot accounts" width="760" />
</picture>

</div>

Sign in once per account. See every quota window and its reset time. Get a
notification before a limit hits. There is no Devie account, cloud database,
proxy, or hosted backend — all data stays on the Mac.

<div align="center">
  <img src="docs/screenshots/menu-bar.jpg" alt="The menu bar popover over the desktop, with quotas for every account" width="760" />
</div>

## Install

1. [**Download the DMG**](https://cdn.crabnebula.app/download/mathdev/devie-quota/latest/platform/dmg-aarch64) (Apple silicon, signed and notarized).
2. Drag **Devie AI Quota Tracker** to Applications.
3. Launch it and add an account under **Providers**.

The app updates itself. All versions are on the
[releases page](https://web.crabnebula.cloud/mathdev/devie-quota/releases).

## Highlights

- **Menu bar first.** The provider logo and the percent left, always visible.
  Pin any quota to the menu bar. One click opens the popover.
- **Any number of accounts.** In-app OAuth sign-in for Claude, Codex,
  Gemini CLI, GitHub Copilot, and Cursor — work and personal side by side.
- **Alerts.** Low quota, reset soon, and reset happened. Per account.
- **Quota Optimizer.** Start a session timer right after each reset, so the
  next reset comes sooner.
- **Always fresh.** A five-minute refresh loop; a failed refresh keeps the
  last good snapshot and marks it "Stale".
- **Yours.** Eleven themes, fifteen languages, and local SQLite storage.

<div align="center">
  <img src="docs/screenshots/providers.png" width="49%" alt="The Settings window with provider cards and connection counts" />
  <img src="docs/screenshots/alerts.png" width="49%" alt="The Alerts dialog with low quota, reset soon, and reset complete toggles" />
</div>

<div align="center">
  <img src="docs/screenshots/quota-optimizer.png" width="49%" alt="The Quota Optimizer dialog with the auto-start session timers option" />
  <img src="docs/screenshots/theme-dark.png" width="49%" alt="The quota dashboard in the Dark theme" />
</div>

## Themes

Light, Dark, System, and eight custom themes.

<details>
<summary><b>See all themes</b></summary>
<br />
<div align="center">
  <img src="docs/screenshots/theme-midnight.png" width="49%" alt="The Midnight Ink theme" />
  <img src="docs/screenshots/theme-copper.png" width="49%" alt="The Copper Sunset theme" />
  <img src="docs/screenshots/theme-aurora.png" width="49%" alt="The Aurora Green theme" />
  <img src="docs/screenshots/theme-sharingan.png" width="49%" alt="The Sharingan theme" />
  <img src="docs/screenshots/theme-alpine-snow.png" width="49%" alt="The Alpine Snow theme" />
  <img src="docs/screenshots/theme-command.png" width="49%" alt="The Command Prompt theme" />
  <img src="docs/screenshots/theme-totoro.png" width="49%" alt="The Totoro theme" />
  <img src="docs/screenshots/theme-catpuccin.png" width="49%" alt="The Catpuccin Latte theme" />
</div>
</details>

## Details

<details>
<summary><b>Provider support</b></summary>

| Provider | Sign-in | Quota source |
| --- | --- | --- |
| Claude | Claude Code OAuth client, PKCE, callback on `localhost:54545` (or a pasted code) | `api.anthropic.com/api/oauth/usage` |
| Codex | Codex CLI OAuth client, PKCE, callback on `localhost:1455` | `chatgpt.com/backend-api/wham/usage` |
| Gemini CLI | Gemini CLI OAuth client and a dynamic loopback callback | `cloudcode-pa.googleapis.com/v1internal:retrieveUserQuota` |
| GitHub Copilot | GitHub device code flow with the Copilot client id | `api.github.com/copilot_internal/user` |
| Cursor | Cursor desktop PKCE deep link (`cursor.com/loginDeepControl`), polled on `api2.cursor.sh/auth/poll`, no callback port | `cursor.com/api/usage-summary` |

Claude usage reads share one cache: a read stays fresh for five minutes on
the timer (a refresh button always fetches), one request per token runs at
a time, a `429` pauses the endpoint for three minutes, and a failed read
shows the last good data as "Stale".

</details>

<details>
<summary><b>Privacy and security</b></summary>

- Devie AI Quota Tracker has no product login or remote application database.
- Provider quota checks can contact Anthropic, Google, OpenAI, or GitHub.
- Each OAuth account is a separate connection. Tokens live in one private
  file per connection with `0600` permissions, under
  `~/Library/Application Support/com.devie.quota/credentials/`. Removing
  an account deletes its token file.
- Provider tokens never enter the React webview. SQLite stores neither
  tokens nor complete provider responses.
- The app owns the tokens for every sign-in and never reads or changes the
  CLI logins on this Mac.
- Anonymous usage events and crash reports go to PostHog (EU). They carry
  a random id, the app version, the OS, and the locale. They never include
  account names, tokens, quota numbers, or labels. Turn this off in
  Settings → Privacy. Builds without `POSTHOG_API_KEY` send nothing.

The local database is stored at
`~/Library/Application Support/com.devie.quota/devie-quota.sqlite3`.

</details>

<details>
<summary><b>Architecture</b></summary>

```text
Next.js static interface
        |
        | narrow Tauri commands and quota events
        v
Tauri and Rust core
  |-- provider OAuth sign-ins and token renewal
  |-- direct provider quota requests
  |-- quota normalization and refresh scheduling
  |-- SQLite state and quota history
  `-- macOS menu bar and windows
```

Rust owns network requests, SQLite, and the menu bar. The webview receives
normalized connection and quota values only.

The main folders are:

```text
src/                    Next.js interface and application components
src/ui/                 Byte-identical mirror of the Devie UI src/ui folder
src/theme/              App theme registry, native appearances, custom themes
src-desktop/            Tauri application and Rust core
src-desktop/src/oauth/  Provider sign-in and quota adapters
docs/                   Build, signing, update, and history documentation
```

`src/ui` is a byte-identical copy of the `src/ui` folder from
[Devie UI](https://www.devie-ui.com/), and a sync is a plain rsync. Do not
edit or delete files inside it. Every customization lives outside the
mirror: application components in `src/components`, the theme registry and
native appearances in `src/theme`, and global styles in `src/app`.

</details>

<details>
<summary><b>Forking</b></summary>

A fork that ships its own builds must replace these project-specific values:

- The bundle identifier `com.devie.quota` in `src-desktop/tauri.conf.json`.
- The CrabNebula Cloud slug `mathdev/devie-quota` in the updater endpoint
  (`src-desktop/src/updater.rs`) and in the release workflow.
- The updater `pubkey` in `src-desktop/tauri.conf.json`, together with the
  matching private signing key.
- The Apple signing and notarization secrets in the GitHub `Release`
  environment (see [the macOS signing guide](docs/macos-signing.md)).

Without these changes a fork would collide with the upstream bundle id and
query an updater feed it cannot publish to.

</details>

## Development

Read [CONTRIBUTING.md](CONTRIBUTING.md) for the prerequisites, the
development commands, the project rules, and the pull request checklist.

## Credits and license

Devie AI Quota Tracker is released under the [MIT License](LICENSE). See
[NOTICE.md](NOTICE.md) for third-party attribution.

The design combines useful ideas from these projects:

- [Devie UI](https://www.devie-ui.com/) for components, tokens, and themes.
- [AIUsage](https://github.com/sylearn/AIUsage) for the quota dashboard scope.
- [CodexBar](https://github.com/steipete/CodexBar) for menu bar and provider-source patterns.
- [usage4claude](https://github.com/f-is-h/usage4claude) for a compact menu bar presentation.
- [9router](https://github.com/decolua/9router) for multi-account provider concepts.
