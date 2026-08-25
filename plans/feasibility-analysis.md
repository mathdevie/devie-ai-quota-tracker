# AI Subscription Quota Tracker — feasibility analysis

Date: 2026-08-25. Status: analysis complete, requirements awaiting validation before POC.

## 1. Verdict

**Feasible.** Every hard requirement was verified against real data on this machine
today, not from memory:

| Requirement | Verdict | Evidence |
|---|---|---|
| Tauri desktop app, Mana-style architecture | Yes | Mana already ships a Next.js 16 static export inside Tauri 2.11 (`src-desktop/`). Same shell, minus Convex/Clerk. |
| Devie UI | Yes | Devie is distributed by copy-paste (`src/ui/`, 41 components + 10 themes). Mana consumes it the same way. |
| No auth / all local | Yes | All provider data comes from local CLI credentials or app-owned OAuth; storage is local SQLite/JSON + OS keychain. |
| AIUsage-like feature set | Yes (quota, multi-account, usage stats) | Proxies/gateways are out of scope (and policy-risky). |
| macOS menu bar (CodexBar / usage4claude style) | Yes | Tauri 2 tray: template icon + title text + popover window via `tauri-plugin-positioner` (`tray-icon` feature). |
| Claude subscription support (5h / 7d / per-model / extra usage) | Yes | `GET /api/oauth/usage` returned all windows for a Team seat, including `extra_usage` and `spend`. |
| Multiple accounts for the same provider | Yes | Claude: one account per `CLAUDE_CONFIG_DIR` (keychain item suffix = `sha256(dir)[:8]`, verified). Codex: per `CODEX_HOME` or app-owned login. Copilot: `gh` multi-account or device flow. |
| Codex, Claude, Copilot first; more later | Yes | Provider trait in Rust; CodexBar's 69 providers are a catalogue of fetch strategies. |

The single real risk is not technical: **Anthropic's policy on OAuth tokens in third-party
tools** (section 5). The design keeps the Claude data source pluggable so this stays a
per-account setting, not an architecture decision.

## 2. Provider endpoints — verified live (2026-08-25)

All calls were read-only `GET`s with credentials already on this machine. No refresh
endpoint was called (see 6.3 for why that matters).

### Claude (subscription: Pro / Max / Team / Enterprise)

| Item | Value |
|---|---|
| Usage | `GET https://api.anthropic.com/api/oauth/usage` |
| Profile | `GET https://api.anthropic.com/api/oauth/profile` |
| Headers | `Authorization: Bearer <claude.ai OAuth access token>`, `anthropic-beta: oauth-2025-04-20` |
| Result | `200`. `five_hour` / `seven_day` `{utilization %, resets_at}`; `limits[]` with `kind` (`session`, `weekly_all`, `weekly_scoped` per model, e.g. "Fable"), `percent`, `severity`, `is_active`; `extra_usage` (`monthly_limit`, `used_credits`, `utilization`, `spend_limit_reached`); `spend` (money amounts + `severity`). Profile gives `account.uuid`, `organization.{name, organization_type (claude_team / claude_max), rate_limit_tier, seat_tier}`. |
| Cadence | 9router polls every 10 min and caches 5 min; CodexBar gates 429s. Claude Code docs confirm the endpoint rate-limits (`/usage` shows "last-known usage"). Keep ≥ 5 min per account. |

Local credential sources (Claude Code):

- File: `<config dir>/.credentials.json` → `claudeAiOauth.{accessToken, refreshToken, expiresAt}` (used when the keychain is unavailable; also on Windows/Linux).
- macOS Keychain generic password: service `Claude Code-credentials` for `~/.claude`, `Claude Code-credentials-<sha256(CLAUDE_CONFIG_DIR)[:8]>` for custom dirs. Verified: `~/.claude-personal` → `-b546f24b`.
- `claude auth status --json` → `{loggedIn, authMethod, orgName, subscriptionType}` without tokens (cheap identity/health probe per config dir).
- Status line JSON (`statusLine` command stdin) carries `rate_limits.five_hour / seven_day.{used_percentage, resets_at}` for claude.ai subscribers after the first response of a session — a **passive, policy-clean** source while Claude Code runs.
- `<config dir>/projects/**/*.jsonl`: per-message `message.usage` (input, output, cache read/write, model) → offline cost/usage stats (ccusage-style).

Finding on this machine: for `~/.claude`, the keychain item holds the personal Max org while
`.credentials.json` holds the Alohi Team org (two different tools wrote them). **Account
identity must come from the profile endpoint, never from the storage path.**

### Codex (ChatGPT Plus / Pro / Team)

| Item | Value |
|---|---|
| Usage | `GET https://chatgpt.com/backend-api/wham/usage` |
| Headers | `Authorization: Bearer <ChatGPT OAuth access token>`, `ChatGPT-Account-Id: <account_id>` |
| Result | `200`. `plan_type`; `rate_limit.{primary_window, secondary_window}` each `{used_percent, limit_window_seconds, reset_after_seconds, reset_at}`; `additional_rate_limits[]` per model family (e.g. Spark: 5h + 7d); `credits` (balance, overage); `spend_control`; `rate_limit_reset_credits`. |
| Credentials | `~/.codex/auth.json` → `tokens.{access_token (JWT, 8-day life), refresh_token, id_token, account_id}`, `last_refresh`. JWT claim `https://api.openai.com/auth` gives `chatgpt_plan_type`, `chatgpt_account_id`. One account per `CODEX_HOME`. |
| Refresh | `POST https://auth.openai.com/oauth/token` (`grant_type=refresh_token`, `client_id=app_EMoamEEZ73f0CkXaXp7hrann`). CodexBar reports "refresh token already used" errors → rotation exists. |
| Offline source | `~/.codex/sessions/**/*.jsonl` `event_msg` / `token_count` payloads embed `rate_limits {primary.used_percent, window_minutes, resets_at, plan_type, credits}` — 215 files here. Zero network. |

### GitHub Copilot (Individual / Business / Enterprise)

| Item | Value |
|---|---|
| Usage | `GET https://api.github.com/copilot_internal/user` |
| Headers | `Authorization: token <GitHub OAuth token>` (the `gh` CLI token worked as-is; 9router/CodexBar add `Editor-Version` / `User-Agent` headers) |
| Result | `200`. `copilot_plan`, `quota_snapshots.{premium_interactions, chat, completions}` each `{entitlement, remaining, percent_remaining, unlimited, overage_count}`, `quota_reset_date` (monthly). Verified here: 1238 / 1500 premium interactions (82.5 %). |
| Credentials | `gh auth token` (keyring `gh:github.com`, multi-account via `gh auth switch`), or app-owned device flow with the VS Code Copilot client `Iv1.b507a08c87ecfe98` (scope `read:user`). |

## 3. Reference products — what to take from each

| Product | Stack | Take | Leave |
|---|---|---|---|
| [AIUsage](https://github.com/sylearn/AIUsage) (Swift, macOS 14+) | SwiftUI | Feature scope: 12 providers, multi-account with independent refresh, one-click CLI account switching, usage stats from local session logs, call analytics. | Claude/Codex proxies, CLIProxyAPI gateway (policy risk, out of scope). |
| [CodexBar](https://github.com/steipete/CodexBar) (Swift, 20k★) | SwiftUI + WidgetKit | The most mature provider engine: **source planner** per provider (`auto / api / oauth / web / cli`), **delegated refresh** (never refreshes the CLI's token itself; drives the CLI so it refreshes and writes back), keychain prompt gating, 429 gates and backoff, Codex offline rollout parsing, multiple Codex accounts, cost scans, icon meter rendering, `codexbar serve` local endpoint. | Cookie-based providers, WidgetKit specifics. |
| [usage4claude](https://github.com/f-is-h/usage4claude) (Swift, 366★) | SwiftUI + Combine | Clean multi-account UI for Claude + Codex, per-model weekly limits, extra-usage row, smart refresh cadence, 90 % / reset notifications. | Its own Claude OAuth login using the Claude Code client id (`9d1c250a-…`) — explicitly disallowed by Anthropic's policy text (section 5). |
| [9router](https://github.com/decolua/9router) (JS/Next.js, 26k★) | Next.js 16 + SQLite | **Core model to mirror**: `providerConnections {id, provider, authType, name, email, priority, isActive, data}`; per-connection usage fetchers (`open-sse/services/usage/{claude,codex,github}.js`) returning a normalized `quotas[]` of `{used, total, remaining, resetAt, unlimited}`; token refresh profiles (JSON body for Claude, form body for Codex, device flow for GitHub); 5-min usage cache with 429 cooldown; quota dashboard sorted by remaining / next reset. | Inference proxying and format translation. 9router itself flags `claude`, `codex`, `github` as `deprecated: RISK_NOTICE`. |

## 4. Proposed architecture

Mana layout, without a backend:

```
devie-qt.com/
  src/                Next.js 16 static export, React 19, TS strict, Base UI + Devie UI (copied src/ui/), SCSS modules, Bun, Biome
  src-desktop/        Tauri 2 shell (Rust): providers, credentials, scheduler, store, tray, IPC
  specs/ plans/       same conventions as Mana
```

Why the Rust side owns all provider logic (unlike Mana, where the webview talks to
Convex): the Tauri webview enforces CORS, and `api.anthropic.com`, `chatgpt.com`, and
`api.github.com` do not allow `tauri://localhost`. Native HTTP (`reqwest`) bypasses CORS
and keeps tokens out of the webview. This mirrors 9router, where fetchers run server-side.

Rust modules (`src-desktop/src/`):

| Module | Responsibility |
|---|---|
| `providers/{claude,codex,copilot}.rs` | `trait QuotaProvider { discover(); fetch(&Account) -> QuotaSnapshot }`. Normalized `QuotaWindow {kind: Session5h | Weekly | WeeklyModel(name) | Monthly, used_pct, reset_at, label}` + `plan`, `extra_usage`, `raw_json` for debugging. Tolerant parsing with legacy fallbacks (9router/usage4claude pattern). |
| `credentials/` | Read-only importers: Claude file + keychain (`keyring` crate 4.x or `security` CLI), Codex `auth.json`, `gh auth token`. App-owned store (keyring service `com.devie.qt`) for app OAuth tokens (Copilot device flow; optionally Codex). |
| `scheduler.rs` | Per-account interval (Claude 5–10 min, Codex 1–5 min, Copilot 5 min), jitter, exponential backoff on 429/5xx, refresh-on-popover-open with a minimum spacing, last-good snapshot retained. |
| `store.rs` | SQLite via `rusqlite` (or `tauri-plugin-sql`): `accounts`, `quota_snapshots` (history for charts), `settings`. |
| `passive/` | File watchers: `~/.codex/sessions` (`rate_limits`), Claude status-line snapshot files (opt-in hook installed into each config dir's `settings.json`). |
| `tray.rs` | `TrayIconBuilder` (`tray-icon` feature); runtime `set_title("12% · 43%")` (macOS) and `set_icon_with_as_template` for a rendered meter PNG; left click toggles a frameless always-on-top popover window positioned with `tauri-plugin-positioner::Position::TrayBottomCenter`; hide on blur; `ActivationPolicy::Accessory` hides the Dock icon. Optional `tauri-nspanel` (branch `v2.1`, active Aug 2026) for a non-activating panel. |
| `notifications.rs` / `autostart` | `tauri-plugin-notification` thresholds (80 / 95 / 100 %, window reset); `tauri-plugin-autostart`. |
| IPC | Commands `list_accounts`, `add_account`, `remove_account`, `refresh`, `get_snapshots`, `get_settings`; event `quota:updated`. |

Frontend (`src/`):

- Popover: compact per-account rows (avatar/initial, org + plan badge, `Progress` per window, reset countdown, last-updated, error state).
- Main window: Accounts (discover / add / reorder / enable), History (charts from snapshots), Usage stats (tokens + cost from local JSONL), Settings (cadence, thresholds, tray content, theme).
- Onboarding: detect local CLIs (`claude`, `codex`, `gh`), list discovered accounts, let the user pick.
- Devie components already available: Progress, Badge, Tabs, Popover, Menu, Tooltip, Switch, Select, Callout, Dialog, AlertDialog, Toast, Avatar, Separator, ScrollArea, Kbd.

Account model (from 9router, extended):

```
Account {
  id, provider: claude | codex | copilot,
  label,                       // user-editable
  auth_type: cli_file | cli_keychain | gh_cli | app_oauth,
  source_ref,                  // config dir, keychain service, CODEX_HOME, gh user
  identity: { account_uuid, org_uuid, org_name, plan, tier },   // from profile endpoints
  is_active, sort_order, created_at
}
```

Accounts are deduplicated by `identity`, not by path. The UI shows the storage source so a
stale file/keychain pair (as found on this machine) is visible.

Crate availability (crates.io, checked today): `tauri 2.11.5`, `tauri-plugin-positioner 2.3.3`,
`tauri-plugin-autostart 2.5.1`, `tauri-plugin-notification 2.3.3`, `tauri-plugin-sql 2.4.0`,
`tauri-plugin-store 2.4.4`, `keyring 4.1.6`, `rusqlite 0.40`, `reqwest 0.13`. Toolchain present:
cargo 1.97, bun 1.3, node 22, Xcode CLT.

## 5. Policy and risk — the decision that matters

Anthropic's [Claude Code legal page](https://code.claude.com/docs/en/legal-and-compliance)
states (verbatim): OAuth authentication "is intended exclusively for purchasers of Claude
Free, Pro, Max, Team, and Enterprise subscription plans and is designed to support ordinary use
of Claude Code and other native Anthropic applications", and "developers may not collect,
store, or intermediate Claude.ai credentials or session tokens — sign-in to a Claude account
must complete through Anthropic's own flow." Per
[The Register (2026-02-20)](https://www.theregister.com/2026/02/20/anthropic_clarifies_ban_third_party_claude_access/),
enforcement (account bans) has targeted inference harnesses; read-only monitoring tools are
not mentioned, and CodexBar / usage4claude keep operating.

Claude data-source options, ordered from cleanest to riskiest:

| Option | How | Compliance | Data quality | Cost |
|---|---|---|---|---|
| A. Passive local | Status-line hook writes `rate_limits` snapshots; `claude auth status --json` for identity; JSONL for stats | Clean | Only while Claude Code runs; 5h + 7d only (no per-model, no extra usage); Pro/Max documented, Team to verify | Low; needs an opt-in hook per config dir |
| B. Drive the official CLI | Spawn `claude` in a PTY per config dir, send `/usage`, parse (CodexBar "CLI (PTY)") | Clean (unmodified binary, own login) | Full plan bars | Seconds per refresh, brittle TUI parsing, process spawning |
| C. Reuse the CLI's access token | `GET /api/oauth/usage` with the token from file/keychain (CodexBar default, 9router, AIUsage) | Grey zone: read-only, low volume, but a third-party tool using the token | Full, verified today | Cheap; keychain prompt on first read; must never refresh the CLI's token |
| D. App-owned Claude OAuth login | PKCE with the Claude Code client id (usage4claude, 9router) | Against the policy text | Full | Not recommended |

Recommendation: implement the Claude provider as a source planner (like CodexBar) with
**C as the default and A as passive enrichment, B as a fallback** — and make the default a
visible, per-account setting with a plain disclosure. The choice is a policy-risk decision for
the product owner, listed in section 8.

Codex (`wham/usage`) and Copilot (`copilot_internal/user`) are internal endpoints too, used by
every reference product with the user's own CLI tokens. Risk is lower (no comparable public
ban) but tolerant parsing and graceful error states are mandatory.

## 6. Other risks and mitigations

1. **Undocumented endpoints change.** Keep raw JSON, parse leniently, fall back to the legacy
   shapes 9router/usage4claude already handle, show "stale since …" instead of failing.
2. **Keychain prompts on macOS.** Reading Claude Code's keychain items from another app
   triggers the ACL prompt once ("Always Allow"). Prefer the `.credentials.json` file when it
   is fresher; offer the `security` CLI read path; never read in a tight loop (CodexBar has
   gates for exactly this).
3. **Refresh-token ownership.** Refreshing the CLI's token from our app can rotate the
   refresh token and break the CLI's login. Rule: the app never calls a refresh endpoint with
   a CLI-owned refresh token. When a CLI token is expired, delegate (run `claude auth status`
   / a short `codex` command, then re-read) or show "expired — run the CLI". POC must verify
   which CLI commands actually refresh.
4. **Usage endpoint rate limits (429).** ≥ 5 min per account, jitter, cooldown on 429,
   refresh-on-open limited to once per minute.
5. **Account identity confusion.** Verified on this machine. Profile-based identity, source
   shown in UI, explicit per-account enable/disable.
6. **Tray platform limits.** Windows: no title text (icon only); Linux: no tooltip, `rect()`
   is `None` (positioner falls back). Ship macOS first, keep icon-only mode for others.
7. **Distribution.** Signing + notarization + updater already solved in Mana (CrabNebula,
   Ed25519 updater keys); reuse the workflow.
8. **Token confidentiality.** Tokens stay in Rust; the webview receives snapshots and
   identities only; logs redact tokens (Mana rule).

## 7. POC plan (proposal, after validation)

Phase 1 — POC (1–2 weeks, macOS):

1. Scaffold from Mana: Next.js static export + Tauri 2 shell, Devie `src/ui/` copied from
   devie-ui.com, Bun/Biome, `specs/` + `plans/`.
2. Rust providers for Claude (file + keychain read, source planner stub), Codex
   (`auth.json` + offline `rate_limits`), Copilot (`gh auth token`).
3. Account discovery: `~/.claude` + user-registered `CLAUDE_CONFIG_DIR`s, `CODEX_HOME`,
   `gh` accounts; identity via profile endpoints.
4. Tray: title `%` + template icon meter, popover with Devie `Progress` rows, manual refresh,
   5-min scheduler, SQLite snapshots.
5. POC validation checks: keychain prompt UX, expired-token path for Claude, Team-plan
   status-line `rate_limits`, 429 behaviour, Windows build smoke test.

Phase 2: notifications, history charts, usage stats from JSONL (pricing table), autostart,
updater/signing, onboarding, app-owned Copilot device flow, next providers (Cursor, Gemini
CLI, Kiro… from CodexBar's catalogue).

## 8. Requirements to validate (decisions for the product owner)

1. **Claude source default**: C (CLI token, default in the ecosystem) vs A/B (policy-clean).
2. **App-owned OAuth logins**: import-only (CLI credentials) for the POC, or add device flow
   (Copilot) / PKCE (Codex) logins in the app?
3. **Menu bar content**: text percentage vs icon meter vs both; which window (5h or 7d) and
   which account(s) in the title; merged icon vs one icon per account.
4. **Popover**: plain Tauri window (portable) vs `tauri-nspanel` (native panel feel, macOS only).
5. **Storage**: SQLite history from day one (charts) vs JSON store for the POC.
6. **Usage stats** (tokens/cost from local logs): POC or phase 2?
7. **Platforms**: macOS-only POC, Windows/Linux later?
8. **Repo conventions**: mirror Mana (Bun, Biome, `specs/`, `plans/`, AGENTS.md rules)?
9. **Product name / bundle id** (working name: Devie QT, `com.devie.qt`).
10. **Cadence and alert thresholds**: 5 min default, alerts at 80 / 95 / 100 % and on reset?

## Sources

- Claude Code legal and compliance: https://code.claude.com/docs/en/legal-and-compliance
- The Register, Anthropic clarifies ban on third-party tool access: https://www.theregister.com/2026/02/20/anthropic_clarifies_ban_third_party_claude_access/
- Claude Code status line (`rate_limits` fields): https://code.claude.com/docs/en/statusline
- Claude Code costs (`/usage`, endpoint rate limiting): https://code.claude.com/docs/en/costs
- Tauri system tray: https://v2.tauri.app/learn/system-tray/ ; positioner: https://v2.tauri.app/plugin/positioner/ ; `TrayIcon` runtime API: https://docs.rs/tauri/latest/tauri/tray/struct.TrayIcon.html
- Reference code read: CodexBar `Sources/CodexBarCore/Providers/{Claude,Codex,Copilot}`, 9router `open-sse/services/usage/*`, `open-sse/services/tokenRefresh/providers.js`, `src/lib/db/schema.js`, usage4claude `Services/*`, AIUsage README.
