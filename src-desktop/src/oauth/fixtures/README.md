# Codex usage fixtures

`codex-workspace-usage.json` is a constructed response, not a capture from a
live Team account. It combines the monthly-limit fields and positive credit
balance from OpenAI's [backend-client fixture](https://github.com/openai/codex/blob/f3f53ee949eeaa9b6050699a783b94fe4ee8ff0d/codex-rs/backend-client/src/client.rs#L835-L856).
The absent rolling windows follow OpenAI's [monthly-only status test](https://github.com/openai/codex/blob/f3f53ee949eeaa9b6050699a783b94fe4ee8ff0d/codex-rs/tui/src/status/tests.rs#L1047-L1083).

The reset timestamp is illustrative. Tests vary optional fields to cover
nullable limits, hidden balances, and explicit spend blocks.

The raw response schema is defined by
[`RateLimitStatusPayload`](https://github.com/openai/codex/blob/f3f53ee949eeaa9b6050699a783b94fe4ee8ff0d/codex-rs/codex-backend-openapi-models/src/models/rate_limit_status_payload.rs)
and [`SpendControlLimitDetails`](https://github.com/openai/codex/blob/f3f53ee949eeaa9b6050699a783b94fe4ee8ff0d/codex-rs/codex-backend-openapi-models/src/models/spend_control_limit_details.rs).
OpenAI's [credit display tests](https://github.com/openai/codex/blob/f3f53ee949eeaa9b6050699a783b94fe4ee8ff0d/codex-rs/tui/src/status/tests.rs#L1300-L1360)
treat available credits with a zero, missing, or invalid balance as
"Available", not as an exhausted allowance.

## Provider compatibility references

The October 2026 compatibility update uses
[9router v0.5.111, commit `3a978a6`](https://github.com/decolua/9router/tree/3a978a631ad65529c06e48ce495092d5bba29f46)
as the comparison baseline. Regression examples in each Rust provider module
are constructed, with synthetic credentials; tests do not call live providers.

- **Codex:** JSON refresh grants, ten-minute renewal lead, named rate-limit
  families, and reset credits that have a count but no individual IDs. Reset
  redemption sends `redeem_request_id`; a retry after authentication renewal
  retains the same ID. Locally generated credit keys are for display only.
- **Antigravity:** `antigravity/hub/2.24.0`, nested quota summaries, exhausted
  disabled session buckets, and catalog fallback only for a confirmed paid tier.
- **Cursor:** IDE Connect JSON `GetCurrentPeriodUsage` and `GetPlanInfo`, plus
  enterprise `/auth/usage`. The dashboard remains primary. Authentication,
  throttling, and transport errors stop fallback; compatibility failures permit
  it. Enterprise `startOfMonth` is a period start, not a reset deadline.
- **Gemini:** successful OAuth survives deferred project setup; later quota
  requests discover and persist the project within the authentication retry path.
- **Claude:** cached observations keep their timestamps; cooldown/error fallback
  is stale. Optional reset grants are outside this update.
- **Copilot:** free-plan `limited_user_quotas` represent **remaining** allowance,
  unlike 9router's interpretation at this revision. This follows
  [VS Code's entitlement calculation](https://github.com/microsoft/vscode/blob/523ca4dc60aa2bd8b8f34db5138cb8ee62e46374/src/vs/workbench/services/chat/common/chatEntitlementService.ts#L967),
  which divides remaining allowance by `monthly_quotas` to obtain the remaining
  percentage. Existing AI-credit, overage, and unlimited quota handling remains.
