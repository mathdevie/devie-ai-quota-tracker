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
