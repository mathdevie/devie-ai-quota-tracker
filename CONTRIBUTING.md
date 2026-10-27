# Contributing to Devie AI Quota Tracker

Thanks for your interest in the project. Issues and pull requests are
welcome.

## Prerequisites

- macOS 12 or newer on an Apple silicon Mac.
- [Bun](https://bun.sh/) and Node.js LTS (`.nvmrc`; Vite+ runs on Node).
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
bun run check      # Vite+: oxfmt, oxlint and the TypeScript check
bun run test       # Vitest
bun run build      # Vite static bundle in out/
cd src-desktop
cargo fmt --check
cargo test --locked
```

Build a local debug app bundle:

```sh
bunx tauri build --debug --bundles app
```

The bundle is written under `src-desktop/target/debug/bundle/macos/`.

### Native tray activation

`cargo test --locked` includes a macOS main-thread integration test using real
`NSStatusItem` controls. It checks native clicks, accessibility presses, explicit
context menus, local/windowless tray hit testing, language/menu replacement,
and status-item recreation.

For a remote-input check, launch the app executable with `DEVIE_TRAY_TRACE=1`.
It logs only tray click types, native activation, and popover visibility to stderr.
Use Screen Sharing or Parsec to verify that left-click opens quotas and right-click
opens the context menu. Click the tray again to close the popover without flashing
or bringing it forward; the next click should reopen it. Clicking elsewhere must
still dismiss it. Repeat after changing language and hiding/showing the menu
bar item. Native activation must position the popover correctly even before the
first mouse-move event.

## Project rules

- `src/ui` is a byte-identical mirror of the `src/ui` folder from
  [Devie UI](https://www.devie-ui.com/). Never customize files inside
  it; a sync replaces the full tree, including upstream deletes/renames. Customizations belong in `src/components`,
  `src/theme`, and `src/app`.
  The sole sync exception is the API-key example in
  `src/ui/markdown/input-group.md`: use `example-api-key` because GitHub
  push protection rejects the upstream Stripe-shaped placeholder.
  Last synced from `mathdevie/devie-ui.com` at
  `e0ef2ed996bab08110fae9c45b6938eb53aaab24` (reviewed target, 2026-10-25).
  Import the default tokens before the desktop preset and the color themes.
  The desktop preset supplies typography and sizing; the app keeps SF Pro
  across all themes in `src/app/globals.scss`. Use the upstream Badge,
  and InputGroup instead of copying their styles. Keep the tray refresh and
  settings as separate borderless `icon-naked` buttons (PR #31); do not
  reintroduce ButtonGroup. PRs #32/#33 own native activation and second-click
  close/reopen; UI syncs must preserve that behavior.
  The app root uses `--devie__zoom`; the library scales portaled overlays.
  Keep viewport sizing on that root and measure native popover content in
  rendered pixels so both surfaces can follow the same scale.
  `src/theme/desktop.scss` keeps native vibrancy and the color fallback for
  older WebKit versions supported by the app's macOS 12 minimum.
- `src/lib/contracts.ts` mirrors `src-desktop/src/model.rs` by hand. When
  you change one, change the other in the same pull request.
- Rust owns network requests, SQLite, and the menu bar. The webview
  receives normalized connection and quota values only; provider tokens
  never enter it.

### Devie UI integration contract

This section is the canonical integration guide. The complete `src/ui` tree
includes components, SCSS, tokens, theme assets and Markdown, even when unused.
The sole byte exception is the Stripe-shaped example in
`src/ui/markdown/input-group.md`, replaced with `example-api-key`. Do not import
the upstream docs site's package manifest or dependencies. Base UI is currently
`^1.9.0`, resolved to 1.9.0 in `bun.lock`.

Entry points and app-owned overrides (maintainer owner: mathdevie):

- `src/app/main.tsx` imports default tokens, upstream desktop sizing, app
  light/dark themes and upstream custom themes, then global/app desktop overrides.
  `src/app/boot.ts` holds the pre-paint script that `vite.config.ts` injects
  into `index.html` with the theme list from `src/theme/registry.ts`. It
  validates saved themes and migrates `theme-default` to `theme-light` and
  `theme-catpuccin-latte` to `theme-catppuccin-latte`, persisting the canonical
  value before paint.
- `src/theme/ThemeContext.tsx` retains the same migrations for runtime and storage
  events across windows. `src/theme/registry.ts` owns translated display names,
  System/light/dark choices and native appearance metadata. System maps to native
  `null`; custom themes map to their appearance. Keep these outside the mirror.
  Remove migration aliases only when old persisted preferences are unsupported.
- `src/app/globals.scss` keeps SF Pro, the app reset, and isolated `.appRoot`
  with `--devie__zoom` and inverse viewport width/height. `Toaster` is a sibling
  outside that isolation; upstream overlays supply their own zoom. Moving it
  inside can put failure toasts behind dialogs. App dialogs carry
  `data-app-dialog`; global inverse-zoom viewport bounds keep independently
  zoomed portals inside constrained windows. `data-app-dialog-body` prevents
  flex children from shrinking and hiding options instead of scrolling. Remove that correction when
  upstream viewport sizing accounts for zoom. Failure calls in
  `src/components/AppShell.tsx` use `danger` for the upstream icon/color contract.
  Remove these overrides only when upstream covers the native integration.
- `src/theme/desktop.scss` keeps vibrancy tint, native semantic colors and
  `light-dark()` fallbacks for macOS 12/older WebKit. Remove fallbacks only after
  the minimum supported WebKit supports the relevant CSS.
- `src/components/PopoverSurface.tsx` measures header/content bounding rectangles
  in rendered pixels, scales frame spacing and caps native window height.
  Its `ResizeObserver` and `ScrollArea` viewport/content layout are coupled;
  preserve scrolling after the cap. `PopoverSurface.module.scss` retains native
  material, flat rows and separate tray actions. `QuotaFilters.module.scss`
  retains compact text-only filters; upstream defaults must not enlarge them.
  Remove overrides only after an equivalent native design is approved.
- `src/components/ResetCredits.tsx` composes the upstream Badge render API with a
  real `button type="button"` inside Popover.Trigger, retaining forwarded trigger
  props/ref, keyboard behavior, confirmation and busy-state guards. Keep
  app-specific behavior here until an equivalent upstream API replaces it.

Update checklist:

1. Verify origin, current main, open/recent merged PRs and existing local work.
   Compare the installed full tree to its documented baseline before edits;
   reconcile drift and pin an explicitly reviewed commit, never floating main.
2. Replace the entire `src/ui` tree from that commit, removing stale paths;
   reapply only the documented example substitution. Run
   `bun scripts/verify-ui-mirror.ts` (requires the pinned commit in local Git).
3. Upgrade only required dependencies, regenerate `bun.lock`, and adapt consumers
   outside the mirror. Review theme imports, both migration paths, render/ref
   composition, toast types, small icons, ScrollArea and constrained overlays.
4. Run the commands below. Exercise main and tray surfaces in browser and native
   WKWebView: light/dark/custom themes, 100%/125% zoom, legacy preference before
   hydration/reload and across windows, constrained dialogs, sign-in InputGroup,
   keyboard reset confirmation/dismissal, disabled refresh, separate actions,
   native second-click close/reopen and danger toasts above open dialogs.
   Record screenshots/results and exact blockers; typechecking is not visual QA.
5. Update this baseline and guide with reasons, owner and removal criteria for
   any new overrides. Never patch the mirror to fix an app-only integration.

```sh
bun install --frozen-lockfile
bun scripts/verify-ui-mirror.ts
bun run test
bun run check
bun run build
bun run i18n:verify
(cd src-desktop && cargo fmt --check && cargo test --locked)
```

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

| Provider                 | Sign-in                                                                                                               | Quota source                                                                                                    |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Claude                   | Claude Code OAuth client, PKCE, callback on `localhost:54545` (or a pasted code)                                      | `api.anthropic.com/api/oauth/usage`                                                                             |
| Codex                    | Codex CLI OAuth client, PKCE, callback on `localhost:1455`                                                            | `chatgpt.com/backend-api/wham/usage`                                                                            |
| Gemini CLI               | Gemini CLI OAuth client and a dynamic loopback callback                                                               | `cloudcode-pa.googleapis.com/v1internal:retrieveUserQuota`                                                      |
| Antigravity (Unofficial) | OAuth client of the Antigravity IDE and a dynamic loopback callback; app-owned refresh tokens                         | `daily-cloudcode-pa.googleapis.com/v1internal:retrieveUserQuotaSummary`, falling back to `fetchAvailableModels` |
| GitHub Copilot           | GitHub device code flow with the Copilot client id                                                                    | `api.github.com/copilot_internal/user`                                                                          |
| Cursor                   | Cursor desktop PKCE deep link (`cursor.com/loginDeepControl`), polled on `api2.cursor.sh/auth/poll`, no callback port | `cursor.com/api/usage-summary`                                                                                  |

Antigravity is unofficial: it has no documented quota API, so the app
reproduces how the closed-source IDE reads the quota, with the IDE's OAuth
client and user agent. Google may restrict or change this without notice;
keep the warning on the provider page. The quota summary has two groups
(Gemini; Claude and GPT), each with a five-hour and a weekly limit. The model
catalog is the fallback; entries without a display name are skipped. Missing
or invalid fractions are unavailable, never zero or full quota.

Claude usage reads share one cache: a read stays fresh for five minutes on
the timer (a refresh button always fetches), one request per token runs at
a time, a `429` pauses the endpoint for three minutes, and a failed read
shows the last good data as "Stale".

Codex usage can contain rolling windows, a monthly limit at
`spend_control.individual_limit`, or credits without rolling windows.
Parse all available values before rejecting an empty reading. Monthly
limits and positive credit balances are independent and remain visible
together. Unlimited credits remain explicit.

When `has_credits` is true, a zero, missing, or invalid balance can mean
the workspace hides it. Such credits show "Available" unless a spend flag
explicitly reports a block, in which case they show "Limit reached". The
monthly row replaces a redundant "Available" status when its limit exists.
Availability-only rows carry no amount or unlimited flag, cannot be pinned
as a menu bar percentage, and use `used_percent` 0/100 only for their
available/blocked state. The quota bars dialog displays the same status.
Constructed regression fixtures and their upstream sources live in
`src-desktop/src/oauth/fixtures/`. A captured Team response remains necessary
to verify which optional fields that account receives.

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
- Make sure `bun run check`, `bun run test`, `bun run build`,
  `bun run i18n:verify`, and
  `cargo test --locked` (in `src-desktop/`) pass.
- Releases are cut by the maintainer on demand: `bun run bump X.Y.Z`
  updates every version file, and a manual dispatch of the
  `Release Desktop App` workflow publishes the build and tags the
  released commit.
