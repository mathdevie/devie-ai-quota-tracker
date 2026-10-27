# Contributing

Issues and pull requests are welcome. For a large change, open an issue first
so we agree on the direction.

## Setup

You need an Apple silicon Mac with macOS 12 or newer, [Bun](https://bun.sh/),
Node.js 24 (`.nvmrc`), Rust (`rust-toolchain.toml`), and the
[Tauri prerequisites](https://v2.tauri.app/start/prerequisites/).

```sh
bun install
bun run dev            # the desktop app; Tauri starts the Vite server
bun run dev:web-only   # the interface alone on localhost:3002, with fixture data
```

The web-only preview cannot sign in or read real quotas.

## Checks

```sh
bun run check   # format, lint, types, and translations
bun run test    # Vitest; CI adds --coverage
bun run build   # the interface, into out/
(cd src-desktop && cargo fmt --check && cargo test --locked)
```

`bun run format` applies formatting and lint fixes. For a local app bundle,
run `bunx tauri build --debug --bundles app`; it lands in
`src-desktop/target/debug/bundle/macos/`.

## Tests

Frontend tests live in `tests/` and run in jsdom; Rust tests sit next to their
code, plus the native tray harness in `src-desktop/tests/`. Run one file with
`bun run test tests/filters.test.ts`, or watch with `bunx vp test`.

`bun run test --coverage` gates the risky app-owned files listed in
`vite.config.ts` (90% lines, 85% branches). When a file earns tests, add it
there; never lower the thresholds or drop a file to make a run pass.

- Test what a user or caller observes, not source text or snapshots.
- Render components with `renderApp` and the factories in `tests/helpers.tsx`,
  query by role and name, and drive them with `userEvent`.
- Mock only the boundary (Tauri, the OS); never edit `src/ui` for a test.
- Use deferred promises for in-flight work and a fixed clock for time; tests
  run in UTC.
- Database tests use a fresh temporary directory, never the app's data.
- Use synthetic data only: no real accounts, tokens, or provider requests.
- Reproduce a bug in a test before fixing it.

jsdom cannot check layout, vibrancy, WebKit quirks, or OS permissions; check
those in the app.

## Skills

Step-by-step procedures for recurring tasks live in `.agents/skills/`, one
folder per skill with a `SKILL.md`. Humans can follow them as checklists.

| Skill                                                    | Use it to                                                         |
| -------------------------------------------------------- | ----------------------------------------------------------------- |
| [`sync-devie-ui`](.agents/skills/sync-devie-ui/SKILL.md) | Update the `src/ui` mirror from Devie UI and verify the app       |
| [`verify-tray`](.agents/skills/verify-tray/SKILL.md)     | Check the menu bar item after changing tray or popover activation |
| [`release`](.agents/skills/release/SKILL.md)             | Cut a stable or nightly release, or set up its secrets            |

A new skill gets a folder with a `SKILL.md` (a `name` and a `description` in
its front matter) and a row in this table.

## How the app is built

- Rust (`src-desktop/`) owns sign-in, network requests, token storage,
  SQLite, the menu bar, and notifications. The webview receives normalized
  connections and quotas only; tokens never enter it.
- `src/lib/contracts.ts` mirrors `src-desktop/src/model.rs` by hand. Change
  both in the same pull request.
- `src/ui` is a byte-identical copy of [Devie UI](https://www.devie-ui.com/).
  Never edit it. App code and overrides live in `src/app`, `src/theme`, and
  `src/components`, with comments explaining each override. Update it only
  with the `sync-devie-ui` skill.

## Providers

Each provider is a module in `src-desktop/src/oauth/`; its module docs cover
the details. Constructed test fixtures live in `src-desktop/src/oauth/fixtures/`.

| Provider                 | Sign-in                                                                        | Quota source                                                            |
| ------------------------ | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Claude                   | Claude Code OAuth client, PKCE, callback on `localhost:54545` or a pasted code | `api.anthropic.com/api/oauth/usage`                                     |
| Codex                    | Codex CLI OAuth client, PKCE, callback on `localhost:1455`                     | `chatgpt.com/backend-api/wham/usage`                                    |
| Gemini CLI               | Gemini CLI OAuth client, loopback callback                                     | `cloudcode-pa.googleapis.com/v1internal:retrieveUserQuota`              |
| Antigravity (unofficial) | Antigravity IDE OAuth client, loopback callback                                | `daily-cloudcode-pa.googleapis.com/v1internal:retrieveUserQuotaSummary` |
| GitHub Copilot           | GitHub device code flow, Copilot client id                                     | `api.github.com/copilot_internal/user`                                  |
| Cursor                   | Cursor desktop PKCE deep link, polled on `api2.cursor.sh/auth/poll`            | `cursor.com/api/usage-summary`                                          |

## Languages

Messages live in `src/i18n/messages/<locale>.json`; `en-US` is the source.
Rust reads the same files for the tray menu and notifications. The tooling
is [i18next-cli](https://github.com/i18next/i18next-cli), configured in
`i18next.config.js`; `bun run check` fails on hardcoded strings, missing,
empty, or unused keys, and broken `{{placeholders}}`.

To add a string, use `t("Area.Key")`, add the English value to `en-US`, run
`bunx i18next-cli extract` (adds the key everywhere, drops unused ones), then
translate the empty values. French, Italian, Spanish, and Portuguese plurals
also need `_many`. `bunx i18next-cli status de-DE` lists what is missing or
still English in one locale.

## Pull requests and releases

Keep a pull request to one change, with the checks above passing.

Releases are cut by the maintainer with the `release` skill.

## Security

Report vulnerabilities privately through **Security → Report a
vulnerability** on GitHub, or at `hi@math.dev`. You will get an answer within
a week. Only the latest release receives security fixes.
