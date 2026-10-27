# Testing strategy and coverage

## Approach

This WIP branch already had tests: five frontend theme tests, 82 Rust unit
tests, and a native macOS tray activation harness. The weak spot was not a
missing framework; it was limited coverage of user interactions and state
transitions across the frontend, bridge, and database.

Use risk-based layers rather than trying to reach a whole-repository percentage:

1. **Pure logic:** quota eligibility, filters, dates, labels, alert thresholds,
   and tray selection. Exercise boundary values and malformed persisted data.
2. **Component integration:** mount app-owned React components with the real
   mirrored Devie UI components and translations. Exercise keyboard input,
   portals, confirmations, busy states, success, and failure/retry.
3. **Boundary tests:** mock Tauri at its public API to verify command names,
   arguments, error propagation, notification permissions, and listener cleanup.
   These check the frontend adapter, not a running Rust command handler.
4. **Native persistence:** exercise real SQLite in temporary directories,
   including rollback, reopen, stale data recovery, and deletion isolation.
5. **Native platform and manual checks:** retain the existing macOS tray
   harness; use WKWebView and remote-input checks for behavior jsdom cannot prove.

Tests use synthetic data, not personal accounts or stored credentials. They do
not log into providers, spend real reset credits, or call external provider APIs.
Existing OAuth callback tests use a local loopback listener.

## Coverage map

| Suite                                                           | Important behavior protected                                                                                                                                                                                                      |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/filters.test.ts`                                         | Provider filtering, disabled/stale accounts, quota eligibility, sorting, immutability, scoped preferences, legacy fallback, invalid saved values                                                                                  |
| `tests/labels.test.ts`                                          | Account naming precedence, provider identities, hidden quota rows, availability-only credits                                                                                                                                      |
| `tests/date.test.ts`                                            | Relative-time boundaries, future timestamps, English/French date and time formatting                                                                                                                                              |
| `tests/quota-bars.test.tsx`                                     | Quota thresholds, clamping, countdowns, currency/amounts/overage, unlimited and availability states, pins, reset tooltip                                                                                                          |
| `tests/reset-credits.test.tsx`                                  | Real keyboard-accessible badge trigger, confirmation/cancel/Escape, single submission during double-click, pending dismissal guard, failure/retry, overlay cleanup                                                                |
| `tests/quota-bars-dialog.test.tsx`                              | Visibility switches, obsolete keys, cancel without writes, pending save, failed save/retry, availability labels                                                                                                                   |
| `tests/theme-migration.test.ts`                                 | Registry invariants and execution of the generated pre-paint script with legacy, invalid, missing, or inaccessible storage                                                                                                        |
| `tests/theme-context.test.tsx`                                  | Mounted runtime migration, preview versus persistence, cross-window storage events, OS appearance changes, native appearance calls and failures, cleanup                                                                          |
| `tests/desktop.test.ts`                                         | Native IPC dispatch, response/error handling, permissions, resizing, async listener disposal, preview behavior and fixture isolation                                                                                              |
| `src-desktop/src/db.rs` tests                                   | Last-good snapshots after failures, atomic rollback, replacement versus history, optional credits, preferences across reconnect/restart, durable notification deduplication, cascading deletion without affecting another account |
| `src-desktop/src/alerts.rs` tests                               | Inclusive low-quota/reset-soon boundaries, reset detection tolerances, timestamp normalization, deduplication separation by account/window/cycle                                                                                  |
| `src-desktop/src/lib.rs` quota status tests                     | Automatic tray selection, explicit pin priority, hidden/disabled/missing pin fallback, measured paid usage and empty dashboards                                                                                                   |
| Existing Rust suites and `src-desktop/tests/tray_activation.rs` | Provider parsing fixtures, OAuth utilities/callbacks, auto-ping and other native logic, real native status-item activation                                                                                                        |

The existing Rust suites remain in place; this work adds 15 Rust tests rather
than replacing them. The frontend source-text extraction test is replaced with
mounted runtime behavior tests; the generated pre-paint script still runs in an
isolated JavaScript context because it executes before React starts.

## Running tests

Run commands from the repository root after `bun install --frozen-lockfile`.
The native suite needs the macOS/Rust/Tauri prerequisites in
[CONTRIBUTING.md](../CONTRIBUTING.md#prerequisites).

```sh
bun run test
bun run test:watch
bun run test:coverage
bun run test:native
```

Narrow the feedback loop while editing:

```sh
bun run test tests/reset-credits.test.tsx
bun run test:watch tests/theme-context.test.tsx
cargo test --locked --manifest-path src-desktop/Cargo.toml db::tests
cargo test --locked --manifest-path src-desktop/Cargo.toml alerts::tests
cargo test --locked --manifest-path src-desktop/Cargo.toml --test tray_activation
```

Check for order-dependent failures with a reproducible seed:

```sh
bun run test --sequence.shuffle --sequence.seed=27102026
```

### Coverage gate and CI

`vite.config.ts` explicitly includes nine app-owned files in the V8 coverage
report: `filters.ts`, `labels.ts`, `desktop.ts`, `date.ts`, `boot.ts`,
`ThemeContext.tsx`, `QuotaBars.tsx`, `ResetCredits.tsx`, and
`QuotaBarsDialog.tsx` under their respective `src` directories.

The aggregate thresholds for this scope are 90% lines, statements, and
functions, and 85% branches. They are not per-file thresholds. CI runs the
coverage command before the frontend build and native tests. It uploads
`frontend-coverage` for 14 days, including reports produced on test failures
when available. Locally, inspect `coverage/index.html`, `coverage/lcov.info`,
or `coverage/coverage-summary.json`; generated reports are gitignored.

**This is not whole-application coverage.** In particular, AppShell,
authentication screens, settings, popover sizing, updater orchestration, and
the mirrored `src/ui` tree are outside the numerical gate. Mirror components
are exercised through integration tests but are not counted as app-owned
coverage. Coverage of `boot.ts` measures generation of the script, not the
branches inside the generated string; behavior assertions cover that script.
No Rust coverage percentage has been measured.

Keep the scope deliberate: add a file and its risk scenarios together. Avoid
excluding failing files or relaxing thresholds to make a regression pass.
Pin `@vitest/coverage-v8` to the Vitest version bundled with Vite+ when upgrading
the toolchain.

## Test authoring conventions

- Test externally observable behavior and meaningful invariants, not source
  substrings, broad DOM snapshots, or private component implementation details.
- Keep app integration tests in `tests/`; never change `src/ui` to make them pass.
- Use the typed account/quota factories and real i18n/tooltip providers in
  `tests/helpers.tsx`. Mock only the relevant OS/API boundary.
- Use accessible roles/names and `userEvent` for interactive tests. Wait for
  dialog focus or other observable readiness before keyboard dismissal.
- Use deferred promises for in-flight operations instead of sleeps. Assert no
  duplicate write and no premature dismissal, then settle the promise explicitly.
- Use a fixed reference clock for time boundaries. Tests run in UTC so date
  formatting does not depend on the contributor's local timezone.
- `tests/setup.ts` resets storage, DOM, native markers, timers, and mocks.
  Its no-op `ResizeObserver` is only a DOM shim, not a layout test.
- Use a fresh temporary directory for each database test and reopen the same
  test database when checking durability. Never use the installed app's data.
- When fixing a bug, first reproduce it in the smallest relevant suite. Extend
  sanitized provider fixtures for parser regressions instead of live requests.

## Implementation report — October 27, 2026

| Measurement                     | Before       | After                |
| ------------------------------- | ------------ | -------------------- |
| Frontend tests                  | 5            | 139 across 9 files   |
| Rust unit tests                 | 82           | 97                   |
| Native tray integration harness | Present      | Retained and passing |
| Scoped frontend lines           | Not measured | 100% (341/341)       |
| Scoped frontend statements      | Not measured | 99.31% (435/438)     |
| Scoped frontend functions       | Not measured | 100% (130/130)       |
| Scoped frontend branches        | Not measured | 92.21% (308/334)     |

Two regressions were reproduced and fixed outside the UI mirror:

- **Invalid persisted filters:** arbitrary JSON fields previously overwrote
  defaults, allowing invalid provider/sort values into application state. The
  reader now validates each supported field independently and ignores unknown
  fields, non-object values, and arrays.
- **Quota visibility dialog dismissal during save:** the upstream interaction
  flag did not suppress the Escape close callback. The app now guards close
  callbacks while saving and explicitly disables Cancel, keeping failed saves
  available for retry.

Validation on this local macOS checkout:

- Frozen-lockfile install, all 139 frontend tests with coverage, and two
  independently shuffled runs (seeds `27102026` and `42`) passed.
- All 97 Rust unit tests and the real native tray activation harness passed.
- Frontend production build, Rust formatting, and diff whitespace checks passed.
- `bun run check` passed with zero errors and 15 existing lint warnings in
  unrelated app code. Those warnings are not changed by this work.
- `bun run i18n:verify` fails before running checks because `npm-run-all`
  rejects the existing package version `0.15` as invalid. Running its four
  component scripts separately (`i18n:lint`, `i18n:check`,
  `i18n:check:undefined`, `i18n:check:unused`) passed. The version and wrapper
  were left unchanged because this is unrelated to test coverage.

These are local results, not a claim that hosted CI or a signed release build
has run. No visual browser/WKWebView QA was performed for this work.

## Remaining risks and next priorities

1. Add AppShell integration tests for overlapping refreshes, event-driven state
   updates, login cancellation, unmount, and error-to-toast handling. The bridge
   tests do not prove orchestration across components.
2. Add an end-to-end IPC/serialization contract check between Rust and TypeScript.
   Today the command tests assert expected frontend strings and arguments;
   `src/lib/contracts.ts` and Rust models are still mirrored by hand.
3. Expand sanitized provider fixtures when previously unseen response shapes
   are available, especially the documented Codex Team response gap. Offline
   tests cannot prove provider compatibility or a real OAuth authorization flow.
4. Explore a narrow native WKWebView smoke suite once the WIP UI stabilizes.
   Avoid brittle whole-app snapshots or account-dependent CI tests.

Before a release or UI mirror sync, still check both main and tray surfaces in
WKWebView: light/dark/custom themes, 100%/125% zoom, legacy preferences on reload
and across windows, constrained dialog scrolling, toasts above dialogs, and
reset confirmation/dismissal. Check native permissions, login/keychain behavior,
and signed updater/notarization separately. Follow the existing
[native tray activation instructions](../CONTRIBUTING.md#native-tray-activation)
for remote clicks and second-click close/reopen. jsdom cannot validate geometry,
vibrancy, WebKit compatibility, real cross-window delivery, or OS permissions.
