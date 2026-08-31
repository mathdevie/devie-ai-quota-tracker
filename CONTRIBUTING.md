# Contributing to Devie Quota

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

## Pull requests

- Open an issue first for large changes, so the direction is agreed before
  the work.
- Keep a pull request focused on one change.
- Make sure `bun run check`, `bun run build`, `bun run i18n:verify`, and
  `cargo test --locked` (in `src-desktop/`) pass.
- Releases are cut by the maintainer: a `v*` tag on `main` triggers the
  signed release workflow.
