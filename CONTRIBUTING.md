# Contributing to Devie AI Quota Tracker

Thanks for your interest in the project. Issues and pull requests are
welcome.

## Prerequisites

- macOS 12 or newer on an Apple silicon Mac.
- [Bun](https://bun.sh/).
- A stable Rust toolchain (`rust-toolchain.toml` pins the channel).
- The [Tauri macOS prerequisites](https://v2.tauri.app/start/prerequisites/).

## Development

Install the dependencies:

```sh
bun install
```

Start the complete desktop app:

```sh
bun run dev:desktop
```

Start the browser preview with local fixtures:

```sh
bun run dev
```

The browser preview runs on `http://localhost:3002`. It cannot complete a
real provider login or use native provider data.

Run the frontend checks and Rust tests:

```sh
bun run check
bun run build
cd src-desktop
cargo fmt --check
cargo test --locked
```

Build a local debug app bundle:

```sh
bunx tauri build --debug --bundles app
```

The bundle is written under `src-desktop/target/debug/bundle/macos/`.

## Project rules

- `src/ui` is a byte-identical mirror of the `src/ui` folder from
  [Devie UI](https://www.devie-ui.com/). Never edit or delete files inside
  it; a sync is a plain rsync. Customizations belong in `src/components`,
  `src/theme`, and `src/app`.
- `src/lib/contracts.ts` mirrors `src-desktop/src/model.rs` by hand. When
  you change one, change the other in the same pull request.
- Rust owns network requests, SQLite, and the menu bar. The webview
  receives normalized connection and quota values only; provider tokens
  never enter it.

## Languages

The interface uses i18next. Messages live in
`src/i18n/messages/<locale>.json`; `en-US` is the source. The Rust side
reads the same JSON files at compile time (`src-desktop/src/messages.rs`)
for the tray menu and the alert notifications.

- `bun run i18n:verify` checks lint, missing, undefined, and unused keys.
- `bun run i18n:untranslated` lists values still identical to English.
- `bun run i18n:extract` previews new keys found in the code.

Add every new user-facing string to `en-US` and run `bun run i18n:verify`
before you open a pull request.

## Provider integrations

| Provider | Sign-in | Quota source |
| --- | --- | --- |
| Claude | Claude Code OAuth client, PKCE, callback on `localhost:54545` (or a pasted code) | `api.anthropic.com/api/oauth/usage` |
| Codex | Codex CLI OAuth client, PKCE, callback on `localhost:1455` | `chatgpt.com/backend-api/wham/usage` |
| Gemini CLI | Gemini CLI OAuth client and a dynamic loopback callback | `cloudcode-pa.googleapis.com/v1internal:retrieveUserQuota` |
| Antigravity (Beta) | Antigravity OAuth client and a dynamic loopback callback; app-owned refresh tokens | `daily-cloudcode-pa.googleapis.com/v1internal:fetchAvailableModels` |
| GitHub Copilot | GitHub device code flow with the Copilot client id | `api.github.com/copilot_internal/user` |
| Cursor | Cursor desktop PKCE deep link (`cursor.com/loginDeepControl`), polled on `api2.cursor.sh/auth/poll`, no callback port | `cursor.com/api/usage-summary` |

Antigravity reads per-model remaining fractions and reset times through Google's
internal API. It does not require an installed CLI. Google may omit quotas or
deny access, and the remote API does not guarantee separate weekly and five-hour
limits. Missing or invalid fractions are unavailable, never treated as zero or
full quota. No request counts are inferred from percentages. Validate the beta
against a signed-in account before claiming complete subscription coverage.

Claude usage reads share one cache: a read stays fresh for five minutes on
the timer (a refresh button always fetches), one request per token runs at
a time, a `429` pauses the endpoint for three minutes, and a failed read
shows the last good data as "Stale".

## Security

Report vulnerabilities in private: use **Security → Report a
vulnerability** on GitHub, or email `hi@math.dev`. You will get an answer
within a week. Only the latest release receives security fixes.

## Forking

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

## Pull requests

- Open an issue first for large changes, so the direction is agreed before
  the work.
- Keep a pull request focused on one change.
- Make sure `bun run check`, `bun run build`, `bun run i18n:verify`, and
  `cargo test --locked` (in `src-desktop/`) pass.
- Releases are cut by the maintainer on demand: `bun run bump X.Y.Z`
  updates every version file, and a manual dispatch of the
  `Release Desktop App` workflow publishes the build and tags the
  released commit.
