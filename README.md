<img src="docs/logo/app-icon.svg" alt="The Devie AI Quota Tracker app icon" width="96" />

# Devie AI Quota Tracker

[![Version](https://img.shields.io/github/v/tag/mathdevie/devie-ai-quota-tracker?label=version&color=4c1)](https://web.crabnebula.cloud/mathdev/devie-quota/releases)
![Platform](https://img.shields.io/badge/macOS-12%2B-black?logo=apple)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/mathdevie/devie-ai-quota-tracker?style=flat&color=yellow)](https://github.com/mathdevie/devie-ai-quota-tracker/stargazers)

**Track all your AI subscription quota in the macOS menu bar.**

[Overview](#overview) · [Download](#download) · [Features](#features) · [Themes](#themes) · [FAQ](#faq) · [Contributing](#contributing)


<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/app-preview.png" />
  <img src="docs/screenshots/theme-light.png" alt="The quota dashboard with Claude Code, Codex, Cursor, and GitHub Copilot accounts" width="51%" />
</picture> <img src="docs/screenshots/popover.png" alt="The menu bar popover with quotas for every account" width="47%" />

## Overview

- 📊 [Dashboard](#): One dashboard for all subscriptions, e.g. Claude Code, Codex, Gemini CLI, GitHub Copilot, and Cursor...
- 📌 Menu Bar: A native macOS menu bar item that shows your remaining quota
- 👥 Multi-Account Support: Add multiple instances of the same provider (e.g. a Work subscription and a Personal subscription)
- 🔔 Alerts: set up notifications for low quota, or imminent reset.
- ⚡ Quota Optimizer: auto-start your session timer, so you have to wait less between resets
- Codex Resets: fetches news from codex-resets.com API to inform you about possible Codex quote reset
- 🎨 Themes: pick a color scheme that you like
- 15 Languages support: English....

No account creation is required.

## Download

**[Download latest (macOS)](https://cdn.crabnebula.app/download/mathdev/devie-quota/latest/platform/dmg-aarch64)**

1. Download the DMG
2. Drag **Devie AI Quota Tracker** to Applications
3. Launch it, then add your account under **Providers** to start tracking quota

The app updates itself.

<details>
<summary><b>Alternative: Build from source</b></summary>

If you prefer to run from the source code instead of downloading the package, you can follow the instructions.

You need [Bun](https://bun.sh/), a stable Rust toolchain, and the
[Tauri macOS prerequisites](https://v2.tauri.app/start/prerequisites/).

```sh
git clone https://github.com/mathdevie/devie-ai-quota-tracker.git
cd devie-ai-quota-tracker
bun install
bunx tauri build --bundles app
```

The bundle is written under `src-desktop/target/release/bundle/macos/`.

</details>

## Features
 
### Menu bar and popover

The menu bar shows the provider logo and the percent left of a pinned
quota. One click opens the popover with every account.

<img src="docs/screenshots/menu-bar.jpg" alt="The menu bar popover over the desktop, with quotas for every account" width="760" />

### Providers and accounts

In-app OAuth sign-in for each provider, with any number of accounts per
provider.

<img src="docs/screenshots/providers.png" alt="The Settings window with provider cards and connection counts" width="760" />

### Alerts

Three alerts per account: low quota, reset soon, and reset happened.

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

**Does it run on Intel Macs?**

The official build is Apple silicon only. An Intel build is untested; you
can try a build from source.

**Which languages does the interface support?**

English (US, UK), Chinese (Simplified), Danish, Dutch, Finnish, French,
German, Italian, Japanese, Norwegian (Bokmål), Portuguese (Brazil),
Spanish (Spain, Latin America), and Swedish.

**Does the app change my CLI logins?**

No. The app owns the tokens for every sign-in and never reads or changes
the CLI logins on this Mac.

**Where is my data stored?**

Everything is local, under
`~/Library/Application Support/com.devie.quota/`: one private token file
per account (`0600` permissions) and one SQLite database for quota
snapshots. Removing an account deletes its token file.

**Does the app send anything anywhere?**

Quota checks contact the providers directly — there is no other backend.
Anonymous usage events and crash reports go to PostHog (EU); they never
include account names, tokens, quota numbers, or labels. Turn this off in
**Settings → Privacy**.

**Why is a quota sometimes marked "Stale"?**

A failed refresh keeps the last good snapshot and marks it "Stale". The
next successful refresh clears it.

**How does the app update itself?**

Through CrabNebula Cloud: the app checks for a signed update at start and
in the background.

## Contributing

Issues and pull requests are welcome — see
[CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE). Third-party notices are in [docs/notices.md](docs/notices.md).

Built with [Devie UI](https://www.devie-ui.com/); inspired by
[AIUsage](https://github.com/sylearn/AIUsage),
[CodexBar](https://github.com/steipete/CodexBar),
[usage4claude](https://github.com/f-is-h/usage4claude), and
[9router](https://github.com/decolua/9router).
