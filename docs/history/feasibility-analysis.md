# AI subscription quota tracker: feasibility analysis

Date: 2026-08-25

Status: feasible. The product requirements need approval before the POC starts.

## 1. Executive verdict

The product is feasible as a local Tauri application.

The architecture of an earlier desktop app by the same author is a good base.
It already uses a Next.js static export,
React, Devie UI, and a Tauri 2 Rust shell. This project can remove the account and
cloud backend layers. Rust should own provider access, credential discovery,
scheduling, persistence, and the menu bar. The webview should receive only safe,
normalized quota data through Tauri commands and events.

The difficult part is not Tauri or the menu bar. The difficult part is getting
stable subscription quota data from providers:

- Claude has official local quota surfaces and official multi-account isolation.
  It also has an undocumented HTTP usage endpoint used by the reference apps.
- Codex has an official `/status` surface and local credential storage. Its rich
  HTTP quota endpoint is not documented.
- GitHub Copilot has a reliable internal quota endpoint in the reference apps.
  GitHub does not document it as a public individual quota API.

The POC should use official CLI surfaces first. It should keep undocumented HTTP
sources behind provider adapters. This design limits policy risk and keeps future
provider changes local to one module.

## 2. Requirement assessment

| Requirement | Verdict | Notes |
|---|---|---|
| Tauri desktop application | Feasible | Tauri officially supports Next.js static exports and tray applications. |
| Proven desktop architecture | Feasible | The earlier app uses Next.js 16, React 19, Bun, Biome, Devie UI, and Tauri 2. |
| Devie UI | Feasible | Devie UI ships 41 themed Base UI components under `src/ui/`. They can be copied with their SCSS tokens and themes. |
| No product account | Feasible | The app needs no app login, cloud database, telemetry service, or backend. |
| All product data is local | Feasible | Settings and history stay local. Quota checks still contact each provider directly. |
| AIUsage-like quota dashboard | Feasible | Quotas, account groups, history, alerts, and local usage statistics fit the design. Proxy and gateway features stay out of scope. |
| macOS menu bar | Feasible | Tauri supports tray icons, titles, click events, and tray-relative window positioning. |
| Multiple connections per provider | Feasible | The data model treats each credential or CLI directory as a separate connection. |
| Multiple Claude subscriptions | Feasible | Claude officially supports side-by-side accounts through separate `CLAUDE_CONFIG_DIR` values. |
| Claude, Codex, and Copilot first | Feasible | Each provider needs a separate source plan and parser. The shared quota model supports later providers. |

## 3. Evidence and confidence levels

This analysis separates three evidence levels:

1. **Official:** documented by the provider or Tauri.
2. **Reference implementation:** present in current open-source code, but not in
   public provider documentation.
3. **POC validation:** behavior that still needs a local test with real accounts.

No provider credential was read during this analysis. No authenticated quota
request was made during this analysis.

### 3.1 Claude

Official evidence:

- `CLAUDE_CONFIG_DIR` overrides the full Claude configuration directory. Anthropic
  documents it as a way to run multiple accounts side by side.
- A Claude Code status-line command receives `rate_limits.five_hour` and
  `rate_limits.seven_day`, with percentages and reset times.
- The `/usage` command shows plan usage limits and activity statistics.
- macOS stores Claude credentials in Keychain. Linux and Windows use a protected
  `.credentials.json` file in the Claude configuration directory.

Reference implementation evidence:

- 9router, CodexBar, and usage4claude call
  `GET https://api.anthropic.com/api/oauth/usage`.
- These projects parse session, weekly, model-scoped weekly, and extra-usage data.
- CodexBar implements a source planner with `auto`, `api`, `oauth`, `web`, and
  `cli` sources. Its CLI source starts Claude in a PTY and reads `/usage`.
- 9router caches successful usage results for five minutes. It also applies a
  cooldown after an HTTP 429 response.

Recommended POC source order:

1. Read passive status-line snapshots through an opt-in wrapper.
2. Run the unmodified Claude CLI in a PTY and parse `/usage` after user action.
3. Keep the undocumented OAuth usage endpoint out of the default POC.

The first two sources do not require this app to read or store a Claude OAuth
token. They also work per `CLAUDE_CONFIG_DIR`.

POC validation:

- Confirm two real Claude configuration directories stay isolated on macOS.
- Confirm the PTY parser gets all required limits for Pro, Max, Team, and
  Enterprise seats.
- Confirm whether the passive status line includes Team and Enterprise limits.
- Preserve and restore any existing user status-line command exactly.
- Measure process time and any quota cost from `/usage` checks.

### 3.2 Codex

Official evidence from OpenAI documentation:

- Codex supports ChatGPT subscription access and API-key access.
- Codex stores cached credentials in the operating-system keyring or
  `auth.json` under `CODEX_HOME`.
- The official documentation treats `auth.json` like a password.
- The Codex CLI `/status` command shows remaining limits during a session.

Multiple `CODEX_HOME` directories therefore provide isolated file-based Codex
profiles. This is a design inference from the documented storage behavior. The
POC must test keyring-backed profiles as well.

Reference implementation evidence:

- CodexBar starts Codex in a PTY, sends `/status`, and parses limits and credits.
- CodexBar and 9router also call the undocumented
  `GET https://chatgpt.com/backend-api/wham/usage` endpoint.
- Their parsers handle primary, secondary, model-specific, credit, and spend
  fields. They use an account identifier header for workspace separation.
- CodexBar reads local session records as an offline quota source.

Recommended POC source order:

1. Read recent quota records from local Codex sessions.
2. Run the official Codex CLI in a PTY and parse `/status` when data is stale.
3. Add the undocumented HTTP endpoint only after a separate policy decision.

POC validation:

- Test two `CODEX_HOME` profiles with different ChatGPT workspaces.
- Test file and keyring credential modes.
- Confirm that the official CLI refreshes its own credentials without this app
  handling refresh tokens.
- Compare offline and PTY quota results with the official usage dashboard.

### 3.3 GitHub Copilot

Official evidence:

- GitHub CLI supports multiple authenticated accounts for one host.
- `gh auth token --user <name>` can select a stored account token.
- `gh auth switch` changes the active account, so the app should not use it for
  background checks.

Reference implementation evidence:

- AIUsage and 9router call
  `GET https://api.github.com/copilot_internal/user` with a GitHub OAuth token.
- Their parsers read premium interactions, chat, completions, plan, and the
  monthly reset date.
- 9router supports a GitHub device flow for an app-owned connection.

The `copilot_internal` endpoint is not a public quota API. Copilot support is
technically feasible, but it has the highest endpoint stability risk.

Recommended POC source order:

1. Import an explicitly selected GitHub CLI account.
2. Read its quota through a provider-owned adapter with tolerant parsing.
3. Add app-owned device flow only after the import flow works.

POC validation:

- Test Individual, Business, and Enterprise response shapes when accounts are
  available.
- Verify the minimum GitHub token scopes.
- Confirm that the app never changes the active GitHub CLI account.

## 4. Lessons from the reference products

The source audit used these revisions:

| Project | Revision | Useful design |
|---|---|---|
| Earlier desktop app | `a3a54c8` | Next.js static export, Tauri shell, Devie UI, Bun, Biome, updater, and project conventions. |
| AIUsage | `ab859f8` | Wide provider scope, multi-account dashboard, local statistics, and menu-bar presentation. |
| CodexBar | `f10b605` | Mature source planning, CLI delegation, stale data, account reconciliation, keychain gates, and tolerant quota parsing. |
| usage4claude | `25bdf2b` | Compact Claude and Codex menu-bar presentation and multi-account settings. |
| 9router | `699edac` | A practical connection schema, normalized quotas, token refresh isolation, caching, and cooldowns. |

Recommended reuse by concept:

- Use the earlier desktop app for the shell, frontend, design system, build, and distribution shape.
- Use 9router for the connection-centered core model.
- Use CodexBar for the provider source planner and delegated CLI refresh pattern.
- Use AIUsage for the user-visible feature map.
- Do not include inference proxies, account pools, routing gateways, or CLI account
  switching in the first product scope.

## 5. Proposed architecture

```text
devie-quota/
  src/                         Next.js static frontend and Devie UI
  src-desktop/                 Tauri 2 Rust application
    src/providers/             Provider adapters and source plans
    src/connections/           Discovery and connection identity
    src/process/               Safe CLI and PTY execution
    src/scheduler/             Refresh gates, jitter, and backoff
    src/storage/               SQLite migrations and repositories
    src/tray/                  Menu-bar icon and popover window
    src/security/              Redaction and secret handles
  specs/                       Approved product requirements
  plans/                       Plans and research
```

### 5.1 Responsibility boundary

Rust owns:

- local credential-source discovery;
- CLI process execution;
- provider HTTP requests;
- quota normalization;
- local SQLite storage;
- scheduling and backoff;
- tray state and notifications;
- secret redaction.

The webview owns:

- the account and quota views;
- Devie UI state;
- settings forms;
- history charts;
- requests through narrow Tauri commands.

Tokens must never enter the webview. SQLite must store only source references,
remote identity metadata, and quota data. App-owned tokens, if added later, must
stay in the operating-system keyring.

### 5.2 Provider adapter

Each provider implements the same behavior:

```rust
trait QuotaProvider {
    fn discover(&self) -> Vec<DiscoveredConnection>;
    fn source_plan(&self, connection: &ProviderConnection) -> SourcePlan;
    async fn fetch(&self, connection: &ProviderConnection) -> Result<QuotaSnapshot>;
}
```

A source plan contains ordered candidates. Each candidate declares its trust
level, data quality, minimum refresh interval, and failure cooldown.

The quota model must not hard-code 5-hour and 7-day windows. Providers already
return session, weekly, model, monthly, credit, and overage limits.

```text
QuotaWindow {
  stable_key,
  label,
  scope,                  // account, workspace, model, or feature
  unit,                   // percent, requests, credits, or money
  used,
  limit,
  used_ratio,
  reset_at,
  source,
  observed_at,
  stale_after
}
```

### 5.3 Connection and identity model

A provider connection and a remote identity are different objects.

```text
ProviderConnection {
  id,
  provider_id,
  label,
  source_kind,            // claude_config, codex_home, gh_cli, app_oauth
  source_locator,         // path, keychain alias, or GitHub login
  enabled,
  priority,
  created_at
}

RemoteIdentity {
  connection_id,
  account_id,
  workspace_id,
  organization_id,
  display_name,
  plan,
  observed_at
}
```

The app must never delete a connection because another connection resolves to
the same remote identity. It can group matching identities in the interface.
This rule preserves multiple configuration directories and multiple providers.

### 5.4 Refresh and stale-data behavior

- Keep one refresh gate per connection and source.
- Apply a provider minimum interval before any manual or automatic request.
- Add small random timing changes to avoid synchronized polling.
- Use exponential backoff for 429 and server errors.
- Keep the last good snapshot and show its age.
- Refresh on popover open only when the data is stale.
- Let passive local sources update the snapshot without a network request.
- Install a status-line wrapper only after user approval. Chain any existing
  command, and restore the original settings during removal.
- Never refresh a CLI-owned OAuth token directly.
- Ask the official CLI to repair its own session, or show a login action.

### 5.5 Menu-bar design

Tauri supports the required first version:

- one template tray icon;
- an optional macOS title;
- a left-click event;
- a frameless popover window;
- tray-relative positioning through the positioner plugin;
- a normal settings window from the popover.

The POC should use a standard Tauri window. A native `NSPanel` bridge can wait
until the plain window has focus, placement, and multi-monitor tests.

Recommended first display:

- Use one tray item for the complete application.
- Show the lowest remaining short quota for enabled connections.
- Show all enabled connections in the popover.
- Let the user pin one connection or choose icon-only mode.

## 6. Local storage

Use SQLite from the Rust layer from the first POC. History is a core product
feature, and SQLite avoids a later store migration.

Initial tables:

- `provider_connections`
- `remote_identities`
- `quota_snapshots`
- `quota_windows`
- `settings`
- `provider_failures`

Do not store provider tokens in these tables. Do not store complete raw provider
responses by default. A user-initiated diagnostic export can include a redacted
response and parser information.

## 7. Main risks

| Risk | Impact | Control |
|---|---|---|
| Anthropic credential policy | High | Use passive data and the unmodified CLI first. Do not read Claude OAuth tokens in the default POC. |
| Undocumented HTTP endpoints | High | Isolate each endpoint, use tolerant parsers, keep fixtures, and retain stale snapshots. |
| CLI output changes | Medium | Version parsers, test fixtures, and show a clear parser error. |
| Token refresh races | High | Never refresh CLI-owned tokens. Let the owning CLI update its store. |
| macOS Keychain prompts | Medium | Prefer CLI delegation. Request keychain access only after a clear user action. |
| Claude settings changes | Medium | Make the wrapper opt-in. Preserve, chain, and restore the existing status line. |
| Wrong account grouping | High | Keep connections separate. Group only by verified remote identity fields. |
| Rate limits on quota checks | Medium | Use source-specific minimum intervals, jitter, caching, and 429 cooldowns. |
| Tray focus and placement | Medium | Test multiple monitors, Spaces, full-screen apps, and menu-bar auto-hide. |
| Cross-platform differences | Medium | Ship a macOS POC first. Keep the provider core platform-neutral. |
| Local privacy | High | Keep tokens in native code, redact logs, and make diagnostics explicit. |

### 7.1 Anthropic policy decision

Anthropic states that third-party developers may not collect, store, or
intermediate Claude.ai credentials or session tokens. It also disallows a
third-party Claude.ai login in another application.

This text makes an app-owned Claude login unsuitable. Directly reading the
Claude CLI token also creates policy risk, even for a read-only quota call.

The safest first product therefore uses the official Claude process and passive
status-line output. A direct OAuth usage source should require a later product
and legal decision.

## 8. POC proposal

The POC should target macOS first. A focused technical POC should take about one
week after the requirements are approved.

### Stage 1: shell and data contracts

- Copy the earlier app's static frontend and Tauri shell shape.
- Copy Devie UI and its themes without product-specific code.
- Add the connection, identity, and normalized quota contracts.
- Add SQLite migrations and fixture-based provider tests.

### Stage 2: provider spikes

- Discover two Claude configuration directories.
- Capture passive Claude status-line data without replacing existing output.
- Run Claude `/usage` through a PTY.
- Read recent Codex local quota records.
- Run Codex `/status` through a PTY.
- Import one GitHub CLI account and read Copilot quota data.

### Stage 3: menu bar and popover

- Create one tray icon and a frameless popover.
- Render all connections with Devie `Progress`, `Badge`, and `Callout`.
- Add manual refresh, stale time, and a clear error state.
- Add a settings window for connection paths and enabled state.

### POC acceptance criteria

1. The app shows two Claude connections at the same time.
2. Each Claude connection keeps its own label, identity, and quota windows.
3. Codex and Copilot each show one real quota snapshot.
4. The menu-bar popover opens in the correct place on two displays.
5. The app restarts without losing connections or history.
6. A provider outage keeps the last good data and shows its age.
7. No token appears in the webview, SQLite database, or normal logs.
8. An expired CLI session gives a safe login action and does not rotate its token.
9. Installing and removing passive capture preserves the prior Claude settings.

Local tools are ready for the POC: Rust 1.97, Cargo 1.97, Bun 1.3, Node 22,
and the Xcode Command Line Tools are installed.

## 9. Requirements that need approval

Recommended defaults appear in the second column.

| Decision | Recommended POC default | Alternative |
|---|---|---|
| Claude quota source | Passive status line plus official CLI `/usage` | Direct OAuth usage endpoint with explicit risk acceptance |
| Codex quota source | Local records plus official CLI `/status` | Direct undocumented HTTP endpoint |
| App-owned logins | No; import local CLI connections | Add Copilot device flow during the POC |
| Scope | Quota tracking only | Include proxies, gateways, or CLI account switching |
| Platforms | macOS first | Build Windows and Linux during the POC |
| Connection behavior | Keep every connection separate | Merge connections with matching identities |
| Tray | One icon and one popover | One tray item per connection |
| Tray metric | Lowest remaining short window | A pinned provider or weekly window |
| Popover technology | Standard Tauri window | Native macOS `NSPanel` bridge |
| History | SQLite from the first POC | Settings store only |
| Token and cost statistics | Phase 2 | Include local JSONL analysis in the POC |
| Product identity | Name `Devie AI Quota Tracker`, bundle `com.devie.quota` | A different name and bundle identifier |

The POC should not start until the Claude source policy, scope, platform, and
connection behavior are approved.

## 10. Sources

Official documentation:

- [Tauri with Next.js](https://v2.tauri.app/start/frontend/nextjs/)
- [Tauri system tray](https://v2.tauri.app/learn/system-tray/)
- [Tauri positioner](https://v2.tauri.app/plugin/positioner/)
- [Claude Code environment variables](https://code.claude.com/docs/en/env-vars)
- [Claude Code status line](https://code.claude.com/docs/en/statusline)
- [Claude Code commands](https://code.claude.com/docs/en/commands)
- [Claude Code costs and `/usage`](https://code.claude.com/docs/en/costs)
- [Claude Code legal and compliance](https://code.claude.com/docs/en/legal-and-compliance)
- [OpenAI Codex authentication](https://developers.openai.com/codex/auth)
- [OpenAI Codex pricing and usage limits](https://developers.openai.com/codex/pricing)
- [GitHub CLI account switching](https://cli.github.com/manual/gh_auth_switch)
- [GitHub CLI command reference](https://cli.github.com/manual/gh_help_reference)

Reference implementations:

- [AIUsage](https://github.com/sylearn/AIUsage)
- [CodexBar](https://github.com/steipete/CodexBar)
- [usage4claude](https://github.com/f-is-h/usage4claude)
- [9router](https://github.com/decolua/9router)
