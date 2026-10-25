# DUI-devie-ai-upstream-sync — local results

Worktree: `/Users/math/.t3/worktrees/devie-ai-quota-tracker/chore-devie-ui-safe-sync-e0ef2ed`
Branch: `chore/devie-ui-safe-sync-e0ef2ed`
Origin verified: `https://github.com/mathdevie/devie-ai-quota-tracker`.
Fetched current main: `d1f2db23d68740070caa3fca7df83c46f8a07f04`, same as starting HEAD.
Read CONTRIBUTING and README before implementation; no existing AGENTS file.
Read-only PR listing: #31, #32, #33 merged; no open sync or completed duplicate found.
No pushes, PR/issue changes, releases, deployments or messages sent.

## Changes

- Complete 161-file mirror of reviewed upstream `e0ef2ed996bab08110fae9c45b6938eb53aaab24`.
  Installed 160-file baseline independently matched `de78af98ffee31774f76b50cdd54c4b1e2440d30`
  except input-group.md example. That sole approved byte exception remains.
  Removed dropdown.md and manage-multiple-themes-with-context.md; migrated the
  Catppuccin directory and added SkeletonLine component/styles/documentation.
- Base UI 1.9.0 and required lockfile transitive updates only; no docs-site packages.
- Both boot and runtime/storage-event paths migrate and persist legacy Catpuccin;
  registry retains app-native System/light/dark semantics, metadata and translations.
- Reset Badge uses render with a real button, preserving trigger composition;
  added a synchronous ref guard against duplicate confirmation submission.
- App failures use danger, with mirrored Toaster unchanged outside appRoot.
- App dialog attributes and inverse viewport bounds compensate portal zoom.
  Nonshrinking body children allow scrolling rather than clipping option groups.
- CONTRIBUTING is the canonical integration guide; AGENTS links to it. Notices
  now describe the full mirror rather than a subset. No native Rust changes.

## Commands and outcomes

All passed:

- `bun install --frozen-lockfile` — install.log.
- `bun scripts/verify-ui-mirror.ts` — 161 matching paths/bytes with sole approved substitution; mirror.log.
- `bun test tests/theme-migration.test.ts` — 5 passed; theme-tests.log.
- `bun run check` — Biome and TypeScript passed; check.log.
- `bun run build` — static production build passed; build.log.
- `bun run build:desktop-frontend` — desktop static frontend passed; build-desktop.log.
- `bun run i18n:verify` — lint/missing/undefined/unused checks passed; i18n.log.
- `cargo fmt --check` in src-desktop — exit 0.
- `cargo test --locked` in src-desktop — 82 tests passed, plus successful native
  NSStatusItem integration executable (native clicks/AXPress, language/recreation,
  tray hit testing and outside-click exclusion); cargo-test.log.
- `git diff --check` — passed.

## Observed browser behavior

T3 Chromium local fixture surface, 420x360 constrained viewport and normal initial viewport:

- Legacy localStorage value reloaded to canonical theme and saved value. Actual
  second tab writing the legacy value updated both tabs to canonical Catppuccin.
  VM regression tests separately execute the actual boot script before hydration
  with both system appearances and the runtime storage listener.
- Reset trigger is BUTTON, type=button. Enter opened list; next Enter opened
  confirmation and focused Cancel. Escape dismissal was observed after transition.
- Danger toast injected through the existing Toast store (simulated failure,
  no provider request) while Alerts dialog was open: circle-X icon, danger
  rgb(230,69,83), outside appRoot, and elementFromPoint hit the toast over modal.
- Sign-in dialog rendered InputGroup and code#state text input in constrained window.
- Refresh was disabled during pending fixture refresh. Header refresh/dashboard
  actions remain separate icon-naked buttons, 24x24 at 100%, 30x30 at 125%.
  Compact filters stay 24px/30px tall. ScrollArea viewport 325px with 1203px content.
- At 125%, appRoot exactly fits 420x360. Initial dialog bounds overflowed; fixed
  result is x=21,y=9,width=378,height=342. Body clientHeight=134, scrollHeight=243,
  scrollTop reached 108.8 and final Reset complete option remained reachable.

browser-results.json preserves raw tool outputs; its constrained entry is the
initial failure that prompted the fix. The corrected results are above and in
WebKit logs. Snapshot tooling twice failed with
`Preview automation snapshot timed out after 15000ms.` Evaluation/key input worked.

## Native WebKit evidence

`swift .local-evidence/webkit.swift` and the compiled local harness load browser
fixtures in an actual macOS WKWebView without Tauri/provider state. Screenshots:

- webkit-main-theme-light-1.png
- webkit-main-theme-dark-1.25.png
- webkit-main-theme-catppuccin-latte-1.25.png
- webkit-popover-theme-light-1.png
- webkit-popover-theme-dark-1.png
- webkit-popover-theme-catppuccin-latte-1.25.png

Harness logs record WebKit user agent, zoom, viewport and dialog/body measurements.
At 125%, native WebKit dialog bounds are [21,9,378,342], body scrollHeight 244 vs
clientHeight 134. Screenshots were inspected for constrained dialog and tray layout.

## Remaining acceptance limits

Full branch-built Tauri interactive main/tray verification is NOT complete.
Native control explicitly returned `Computer Use was not approved to use Devie AI
Quota Tracker`; Chrome fallback likewise lacked approval. Existing installed app
is not this branch. No claim is made that the WebKit harness proves Tauri native
vibrancy, real window resize fitting, native appearance metadata changes, or actual
second-click close/reopen. Native tray integration tests passed, but are not a
substitute for the full app interaction acceptance. macOS 12/older WebKit is not
available (host macOS 27.0.1), so its retained CSS fallbacks remain unverified on-device.
Busy/reset failure behavior is protected in code but not exercised against a real
provider. No real provider/network behavior was changed or tested.
