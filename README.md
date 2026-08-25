# Devie Quota

Devie Quota is a local macOS menu bar app for AI subscription quotas.

It keeps separate Claude, Codex, and GitHub Copilot accounts in one place.
The product has no Devie account, cloud database, proxy, or hosted backend.

> [!NOTE]
> This repository contains an early proof of concept. Provider behavior and the
> interface will change as the product is tested with more subscriptions.

## Product principles

- Keep the interface minimal, useful, and close to the Mana configuration pages.
- Keep product data on the Mac.
- Sign in with the same public OAuth clients the provider CLIs use.
- Treat every account or configuration directory as a separate connection.
- Keep provider-specific quota logic behind a common Rust model.
- Preserve the last good quota snapshot when a refresh fails.

## Current features

- A Tauri 2 app with a Next.js static frontend.
- A macOS menu bar item with a quota summary and popover.
- A native-style window with a sidebar: Quota, Usage, Providers, Settings.
- In-app OAuth sign-in for Claude, Codex, and GitHub Copilot accounts.
- Any number of accounts per provider.
- Local discovery of existing Claude, Codex, and GitHub CLI profiles.
- Manual refresh and an automatic five-minute refresh loop.
- Local SQLite storage for connections, identities, snapshots, and failures.
- Ten bundled Devie UI themes.
- Signed and notarized Apple silicon builds through GitHub Actions.

## Provider support

| Provider | Sign-in | Quota source |
| --- | --- | --- |
| Claude | Claude Code OAuth client, PKCE, callback on `localhost:54545` (or a pasted code) | `api.anthropic.com/api/oauth/usage` |
| Codex | Codex CLI OAuth client, PKCE, callback on `localhost:1455` | `chatgpt.com/backend-api/wham/usage` |
| GitHub Copilot | GitHub device code flow with the Copilot client id | `api.github.com/copilot_internal/user` |

Existing CLI profiles are also listed as "CLI" connections. Claude CLI
folders use the usage endpoint with the token Claude Code stored for that folder (macOS Keychain `Claude Code-credentials`
plus a short SHA-256 suffix for `CLAUDE_CONFIG_DIR` folders, or
`.credentials.json`). The app never renews a CLI-owned token; when it expires,
the card asks you to run `claude` once. Codex folders use local session
records or `/status`; GitHub CLI accounts use `gh auth token`.

Claude usage reads share one cache, in the same way as 9router: a read stays
fresh for five minutes on the timer (a refresh button always fetches), one
request per token runs at a time, a `429` pauses the endpoint for three
minutes, and a failed read shows the last good data as "Stale".

Devie Quota finds CLI commands in the normal shell path and common macOS install
folders. These folders include Homebrew, `~/.local/bin`, Bun, Cargo, Volta,
asdf, npm, pnpm, NVM, and FNM locations.

## Accounts and tokens

Each OAuth account is a separate connection. Tokens live in one private file
per connection with `0600` permissions:

```text
~/Library/Application Support/com.devie.quota/credentials/<connection-id>.json
```

The app renews Claude and Codex tokens before they expire. Removing an account
deletes its token file.

## Architecture

```text
Next.js static interface
        |
        | narrow Tauri commands and quota events
        v
Tauri and Rust core
  |-- provider discovery and isolated profiles
  |-- provider CLI and pseudo-terminal processes
  |-- direct provider requests where required
  |-- quota normalization and refresh scheduling
  |-- SQLite state and quota history
  `-- macOS menu bar and windows
```

Rust owns provider processes, network requests, SQLite, and the menu bar. The
webview receives normalized connection and quota values only.

The main folders are:

```text
src/                    Next.js interface and application components
src/ui/                 Complete Devie UI component and theme folder
src-desktop/            Tauri application and Rust core
src-desktop/src/providers/
                        Claude, Codex, and Copilot adapters
docs/                   Build and signing documentation
plans/                  Product research and feasibility analysis
```

`src/ui` mirrors the `src/ui` folder from the
[Devie UI repository](https://github.com/mathdevie/devie-ui.com). The local
theme context uses the versioned `devie-quota-theme:v1` storage key.

## Privacy and security

- Devie Quota has no product login or remote application database.
- Provider quota checks can contact Anthropic, OpenAI, or GitHub.
- Provider tokens never enter the React webview.
- SQLite does not store provider tokens or complete provider responses.
- Claude and Codex own their login credentials and refresh behavior.
- The Copilot adapter reads one GitHub CLI token into memory for one request.
- The Copilot adapter clears its token buffer after the request starts.
- Devie Quota never changes the active GitHub CLI account.

The local database is stored at:

```text
~/Library/Application Support/com.devie.quota/devie-quota.sqlite3
```

## Requirements

- macOS 12 or newer.
- An Apple silicon Mac for the current signed build.
- [Bun](https://bun.sh/).
- A stable Rust toolchain.
- The [Tauri macOS prerequisites](https://v2.tauri.app/start/prerequisites/).
- Claude Code, Codex, or GitHub CLI for the related provider.

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

The browser preview runs on `http://localhost:3002`. It cannot complete a real
provider login or use native provider data.

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

## CI and signed builds

The `CI` workflow runs manually. It checks the frontend, builds the static
export, and runs the Rust tests.

The `Build signed macOS app` workflow runs manually or for a `v*` tag. It builds,
signs, notarizes, and checks an Apple silicon app and DMG.

To download a build:

1. Open the repository **Actions** page.
2. Open a successful **Build signed macOS app** run.
3. Find the **Artifacts** section on the run summary.
4. Download `Devie-Quota-arm64`.
5. Extract the ZIP and open the DMG or app bundle.

GitHub keeps the current build artifacts for 14 days. The release workflow also
publishes signed updater artifacts through CrabNebula Cloud.

The signed workflow uses the GitHub `Release` environment. Read
[the macOS signing guide](docs/macos-signing.md) for the required secrets and
setup steps.

## Known limits

- The app supports macOS only.
- The signed workflow builds Apple silicon only.
- Claude and Codex terminal output can change between CLI versions.
- GitHub Copilot uses an internal endpoint instead of a public quota API.
- Claude and Codex login uses the provider CLI instead of a direct app callback.
- The app does not yet remove managed profiles.
- The app does not yet show charts, alerts, costs, or local token totals.
- Real multi-account testing still needs more plan and organization types.

## Next areas

- Refine the minimal usage and provider interface.
- Complete provider lifecycle controls.
- Improve login progress and error handling.
- Test multiple Claude and Codex subscription combinations.
- Add quota history and alerts.
- Add more providers through the shared adapter model.

## Research and references

The initial design combines useful ideas from these projects:

- [Mana](https://github.com/mathdevie/app.mana.re) for the application structure and interface direction.
- [Devie UI](https://www.devie-ui.com/) for components, tokens, and themes.
- [AIUsage](https://github.com/sylearn/AIUsage) for the quota dashboard scope.
- [CodexBar](https://github.com/steipete/CodexBar) for menu bar and provider-source patterns.
- [usage4claude](https://github.com/f-is-h/usage4claude) for a compact menu bar presentation.
- [9router](https://github.com/decolua/9router) for multi-account provider concepts.

Read the full [feasibility analysis](plans/feasibility-analysis.md) for the source
assessment, security boundaries, and initial product decisions.
