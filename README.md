# Devie QT

A local macOS tracker for AI subscription quotas.

This branch contains the first working POC. Read the
[feasibility analysis](plans/feasibility-analysis.md) for the product decisions.

## What works

- A Tauri 2 desktop app with a Next.js static frontend.
- A macOS menu bar item with a quota popover.
- A Devie UI dashboard for all local connections.
- Separate Claude and Codex profiles from different config directories.
- GitHub CLI account discovery without an app-owned login.
- SQLite connection state and normalized quota history.
- A five-minute refresh loop and a manual refresh action.
- A stale snapshot when a provider refresh fails.

The POC starts with Claude, OpenAI Codex, and GitHub Copilot.

## Provider sources

| Provider | Primary source | Fallback |
| --- | --- | --- |
| Claude | An optional passive Claude Code status line capture | Claude Code `/usage` in a PTY |
| Codex | Recent local Codex session quota records | Codex `/status` in a PTY |
| Copilot | The selected GitHub CLI account | None |

The Claude capture installer preserves the previous `statusLine` setting.
The remover restores that exact setting.
The remover stops if the user changed the setting after installation.

## Security boundary

Rust owns provider processes, network calls, SQLite, and the menu bar.
The webview receives normalized quota values only.

The app does not store provider tokens in SQLite or logs.
The Copilot adapter reads a selected GitHub CLI token into memory for one request.
The adapter clears its token buffer after the request starts.
The app never changes the active GitHub CLI account.

## Development

Install Bun, Rust, and the macOS Tauri prerequisites.

```sh
bun install
bun run dev
```

Run the desktop app:

```sh
bun run dev:desktop
```

Run the checks:

```sh
bun run check
bun run build
cd src-desktop && cargo test
```

Build a macOS app bundle:

```sh
bunx tauri build --debug --bundles app
```

## macOS releases

The CI workflow checks each pull request and each push to `main`.
The release workflow builds signed Intel and Apple silicon apps.
It runs manually or for a `v*` tag.

The release workflow uses the GitHub `Release` environment.
See [docs/macos-signing.md](docs/macos-signing.md) before the first release build.

## Current POC limits

- The POC targets macOS only.
- Claude terminal output can change between Claude Code versions.
- Copilot uses a GitHub internal quota endpoint.
- The POC does not track token counts or costs.
- The POC does not add provider logins or refresh provider credentials.

The selected Devie UI components come from the Mana application structure.
