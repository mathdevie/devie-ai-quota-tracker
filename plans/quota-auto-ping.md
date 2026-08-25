# Quota auto-ping feasibility

## Decision

The feature is feasible for Devie Quota. It is a medium-sized change because it
must send provider requests, not only watch reset timestamps.

The first implementation should support app-owned Claude and Codex OAuth
connections. It should remain disabled by default and require a separate opt-in
for each connection.

Local CLI connections should come later. Triggering their CLIs creates sessions
and can modify files owned by those tools. That behavior needs separate consent
and provider-specific tests.

## What 9router does

9router runs a scheduler every 60 seconds. For each opted-in OAuth connection it:

1. Refreshes credentials when required.
2. Reads fresh quota data near the reset.
3. Detects the Claude reset time or the Codex sliding reset time.
4. Skips a ping when a longer blocking quota is exhausted.
5. Sends one minimal provider request.
6. Persists the reset key and ping time to prevent duplicates after restarts.
7. Waits 15 minutes after a failure before another attempt.

Claude sends `hi` to a small model with one output token. Codex sends `hi`, asks
for `OK`, disables storage, disables reasoning, and drains the streaming response.

Reference implementation:

- https://github.com/decolua/9router/blob/699edac3273e13d4744bc46f6082618f08560702/src/shared/services/quotaAutoPing.js
- https://github.com/decolua/9router/blob/699edac3273e13d4744bc46f6082618f08560702/src/shared/constants/config.js
- https://github.com/decolua/9router/blob/699edac3273e13d4744bc46f6082618f08560702/tests/unit/quota-auto-ping.test.js

## Existing Devie Quota support

Devie Quota already has most supporting parts:

- Stable connection IDs and separate OAuth credentials.
- OAuth token renewal for Claude and Codex.
- Normalized five-hour and longer quota windows.
- Reset timestamps in SQLite.
- A background refresh task.
- Per-connection controls and a Tauri command layer.

The missing part is a provider request sender. Devie Quota currently reads quota
data but never submits a model request.

## Recommended design

### Storage

Add these fields to each provider connection:

- `auto_ping_enabled`
- `last_auto_ping_reset_key`
- `last_auto_ping_at`
- `last_auto_ping_error`

The reset key must use minute precision. This avoids a second request when the
provider changes reset seconds slightly.

### Scheduler

Use a separate 60-second task. Do not change the five-minute dashboard refresh.

The task should skip disabled, local, signed-out, and unsupported connections.
It should force a quota read only near a known reset. It should persist success
before another scheduler pass can run.

The app can miss the exact time while the Mac sleeps or the app is closed. It
should send one catch-up request after wake when the reset is still eligible.

### Provider requests

Claude is the simpler first provider. It needs a minimal Messages API request,
the same OAuth headers as Claude Code, a small model, and one output token.

Codex needs a Responses request with the ChatGPT account header. The response
must use streaming and drain to completion because the window starts after the
response finishes.

Both requests use undocumented subscription endpoints. Provider changes can
break them. Errors must never disable normal quota reads.

### Interface

Show a bolt control only for supported OAuth connections. Keep it off by default.
The tooltip must state that it sends a real request and consumes a small quota.

Show the last successful ping time or the last error in the connection details.
This makes scheduled activity visible and testable.

## Safety rules

- Never enable the feature automatically.
- Never send when a weekly or monthly quota is exhausted.
- Never send twice for the same reset key.
- Use a 15-minute failure cooldown.
- Use a 10-minute minimum interval for Codex.
- Do not store generated content.
- Do not include user content in the request.
- Stop when authentication needs user action.

## Test plan

Unit tests should cover opt-in, reset detection, clock drift, duplicate blocking,
longer exhausted quotas, expired credentials, failures, cooldowns, and app wake.

A manual test should use one non-critical OAuth account. The test should compare
the provider's reset time before and after the ping. It should also restart the
app and confirm that the same reset does not receive another request.

## Effort

An OAuth-only implementation is approximately one to two focused development
days. Local CLI support is a separate follow-up because each CLI needs safe and
stable non-interactive behavior.
