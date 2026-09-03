<img src="docs/logo/app-icon.svg" alt="The Devie AI Quota Tracker app icon" width="96" />

# Devie AI Quota Tracker

[![Version](https://img.shields.io/github/v/tag/mathdevie/devie-ai-quota-tracker?label=version&color=4c1)](https://web.crabnebula.cloud/mathdev/devie-quota/releases)
![Platform](https://img.shields.io/badge/macOS-12%2B-black?logo=apple)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/mathdevie/devie-ai-quota-tracker?style=flat&color=yellow)](https://github.com/mathdevie/devie-ai-quota-tracker/stargazers)

**Track all your AI subscription quotas in the macOS menu bar**

[Overview](#overview) | [Download](#download) | [Features](#features) | [Themes](#themes) | [FAQ](#faq) | [Contributing](#contributing)


<table>
<tr>
<td width="52%"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/app-preview.png" /><img src="docs/screenshots/theme-light.png" alt="The quota dashboard with Claude Code, Codex, Cursor, and GitHub Copilot accounts" /></picture></td>
<td width="48%"><img src="docs/screenshots/popover.png" alt="The menu bar popover with quotas for every account" /></td>
</tr>
</table>

## Overview

- 📊 [Dashboard](#features): one dashboard for all subscriptions, including Claude Code, Codex, Gemini CLI, GitHub Copilot, and Cursor
- 📌 [Menu Bar](#menu-bar-and-quick-view): a native macOS menu bar integration that shows your remaining quota
- 👥 [Multi-Account](#supported-providers): support for multiple instances of the same provider (e.g. Work and Personal subscriptions)
- 🔔 [Alerts](#alerts): notifications about low quota or an imminent reset
- ⚡ [Quota Optimizer](#quota-optimizer): auto-start of your session timer, so you have to wait less between resets
- 📰 [Codex Resets](#codex-resets): live news from the [codex-resets.com](https://codex-resets.com) API about a possible Codex quota reset
- 🎨 [Themes](#themes): 11 available color schemes
- 🌍 [Languages](#faq): translations for 15 languages

## Download

**[Download latest (macOS)](https://cdn.crabnebula.app/download/mathdev/devie-quota/latest/platform/dmg-aarch64)**

1. Download the DMG
2. Drag **Devie AI Quota Tracker** to Applications
3. Launch it, then add your account under **Providers** to start tracking quota

<details>
<summary><b>Alternative: Build from source</b></summary>

If you prefer to run from the source code instead of downloading the package, follow these instructions.

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

### Menu Bar and Quick View

The menu bar shows the quota of the provider you selected: you can pin the quota that you want to track, or sort automatically by which one expires first.

One click opens a quick view popover with all quota details, percentage and reset dates.

<img src="docs/screenshots/menu-bar.jpg" alt="The menu bar popover over the desktop, with quotas for every account" width="760" />

### Supported Providers

Currently supported AI providers include Claude Code, Codex, Gemini CLI, GitHub Copilot, and Cursor.

Authentication requires OAuth sign-in for each provider that you want to add. Note that unlike other existing solutions, we do not automatically reuse the CLI accounts you are already logged in to on your machine.

<img src="docs/screenshots/providers.png" alt="The Settings window with provider cards and connection counts" width="760" />

### Alerts

You can set up alerts (macOS notifications) for each account: low quota, reset soon, and reset happened.

Make sure you authorize the notifications for this app in your macOS notification settings.

<img src="docs/screenshots/alerts.png" alt="The Alerts dialog with low quota, reset soon, and reset complete toggles" width="760" />

### Quota Optimizer

A reset timer normally starts on first use. By activating the optimizer, the application will send a small
request right after each reset, so the timer starts immediately and the
next reset comes sooner.

<img src="docs/screenshots/quota-optimizer.png" alt="The Quota Optimizer dialog with the auto-start session timers option" width="760" />

### Codex Resets

Codex quotas sometimes (often) reset early.

We fetch the latest announcements from [codex-resets.com](https://codex-resets.com), a community
site that tracks the reset announcements of OpenAI staff. The app reads
the public status feed only and never sends account data to it.

<img src="docs/screenshots/codex-resets.png" alt="The popover with a Codex reset forecast banner" width="620" />

## Themes

This app is implemented using [Devie UI](https://devie-ui.com), a design system that natively supports multiple themes.

| Theme: Light | Theme: Dark |
| :---: | :---: |
| <img src="docs/screenshots/theme-light.png" alt="The Light theme" /> | <img src="docs/screenshots/theme-dark.png" alt="The Dark theme" /> |
| **Theme: Midnight Ink** | **Theme: Copper Sunset** |
| <img src="docs/screenshots/theme-midnight.png" alt="The Midnight Ink theme" /> | <img src="docs/screenshots/theme-copper.png" alt="The Copper Sunset theme" /> |
| **Theme: Aurora Green** | **Theme: Sharingan** |
| <img src="docs/screenshots/theme-aurora.png" alt="The Aurora Green theme" /> | <img src="docs/screenshots/theme-sharingan.png" alt="The Sharingan theme" /> |
| **Theme: Alpine Snow** | **Theme: Command Prompt** |
| <img src="docs/screenshots/theme-alpine-snow.png" alt="The Alpine Snow theme" /> | <img src="docs/screenshots/theme-command.png" alt="The Command Prompt theme" /> |
| **Theme: Totoro** | **Theme: Catpuccin Latte** |
| <img src="docs/screenshots/theme-totoro.png" alt="The Totoro theme" /> | <img src="docs/screenshots/theme-catpuccin.png" alt="The Catpuccin Latte theme" /> |

## FAQ

<details>
<summary><b>Which languages does the interface support?</b></summary>
<br />

English (US, UK), Chinese (Simplified), Danish, Dutch, Finnish, French,
German, Italian, Japanese, Norwegian (Bokmål), Portuguese (Brazil),
Spanish (Spain, Latin America), and Swedish.

Translations are generated, so any contributions from native speakers are greatly appreciated.

</details>

<details>
<summary><b>Where is my data stored?</b></summary>
<br />

Everything is local, under
`~/Library/Application Support/com.devie.quota/`: one private token file
per account (`0600` permissions) and one SQLite database for quota
snapshots. Removing an account deletes its token file.

</details>

<details>
<summary><b>Does the app send anything anywhere?</b></summary>
<br />

No account is required to use the tracker. You only need to authenticate your AI providers.
Quota checks contact the providers directly.

Anonymous usage events and crash reports go to PostHog. They never
include account names, tokens, quota numbers, or labels. Turn this off in
**Settings → Privacy** if you prefer.

</details>

## Contributing

Issues and pull requests are welcome, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Sponsors

The development of this project is supported by:

<table>
<tr>
<td align="center" width="200">
<a href="https://sign.plus">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="docs/sponsors/signplus-dark.svg" />
<img src="docs/sponsors/signplus-light.svg" alt="The Sign.Plus logo" width="48" />
</picture>
<br />
<b>Sign.Plus</b>
</a>
</td>
</tr>
</table>

## Thanks

This application was inspired by other awesome open-source projects:
- [AIUsage](https://github.com/sylearn/AIUsage)
- [CodexBar](https://github.com/steipete/CodexBar)
- [usage4claude](https://github.com/f-is-h/usage4claude)
- [9router](https://github.com/decolua/9router)
 
## License

[MIT](LICENSE). 
Third-party notices are in [NOTICES](docs/notices.md).


