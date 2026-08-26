# Usage, Fable, news, and notification exploration

Date: 2026-08-26

## Decisions

All four ideas are feasible.

The recommended order is:

1. Build quota history charts from the snapshots already in SQLite.
2. Add low-quota notifications with strict duplicate prevention.
3. Add a small news feed from cached, identified sources.
4. Add token and cost tracking as a separate, larger feature.

Quota history and token usage are different products. A quota percentage does
not reveal the token count, cost, model, or request which consumed it.

## 1. Usage page

### What exists now

The Rust core already writes one `quota_snapshots` row after every successful
refresh. It writes each window into `quota_windows`. The current dashboard
command only returns the newest snapshot.

The five-minute refresh timer creates enough data for useful charts without a
schema migration. One year creates about 105,000 snapshots per continuously
enabled account. SQLite can handle that volume, but the chart query must bucket
old points.

### Recommended first version: quota history

Add a `get_usage_history` Tauri command with these contracts:

- `HistoryQuery`: account IDs, window keys, start time, end time, and bucket.
- `HistorySeries`: account, provider, window label, and ordered points.
- `HistoryPoint`: capture time, used percentage, and reset time.

The page should contain:

- A source filter for all providers, one provider, or one account.
- A range filter for 24 hours, 7 days, 30 days, and all data.
- Summary cards for current usage, lowest remaining quota, average burn rate,
  and the next reset.
- A theme-colored line and soft area chart for each quota window.
- Reset markers when usage drops sharply before the stored reset time.
- A recent-snapshots table for exact values and source details.

Use a small local SVG chart first. The data is simple, and another chart
dependency is not required. Add pointer and keyboard focus states to chart
points. Downsample the query to at most 500 points per series.

For storage control, keep five-minute detail for 30 days. Keep hourly points
after that. This can use an hourly aggregate table or a maintenance job.

### Later version: tokens and costs

AIUsage provides a much deeper view. It combines proxy archives, Codex session
logs, and the OpenCode database. It shows cost, input and output tokens, cache
tokens, model distribution, time trends, source filters, and model details.

Devie Quota can add similar data, but quota snapshots cannot provide it. The
second version needs local readers for Claude Code and Codex session logs.

The readers should store only daily aggregates by default:

- Provider, account, model, source, and day.
- Input, output, cache-read, and cache-create tokens.
- Estimated cost only when a reliable price exists.
- No prompt text, response text, tool input, or file path.

This is a large feature. The quota-history version is a medium feature and can
ship first.

Primary reference:

- https://github.com/sylearn/AIUsage/tree/ab859f8a838cb2e56641dde4f6db10a28662dac8
- https://github.com/sylearn/AIUsage/blob/ab859f8a838cb2e56641dde4f6db10a28662dac8/docs/USAGE_AND_BILLING.md

## 2. Fable quota

The current Claude parser already supports Fable when the OAuth usage response
contains a top-level `seven_day_fable` object. It scans every `seven_day_*`
field and creates a model-specific weekly window. The preview fixture already
shows this case.

Claude Code users report that `/usage` shows a separate Fable weekly limit.
They also report that the status-line input does not expose that value yet.
This makes the direct OAuth usage endpoint the better source for now.

Recommended hardening work:

1. Add an explicit parser test for `seven_day_fable`.
2. Capture one sanitized response from an eligible live account.
3. Keep the current dynamic `seven_day_*` scan for future model limits.
4. Add a second parser only if a live response uses a scoped `limits` array.
5. Show the server label when available, instead of a fixed model list.

This work is small. The only uncertain part is the undocumented response shape.

References:

- https://github.com/anthropics/claude-code/issues/88137
- https://github.com/decolua/9router/blob/699edac3273e13d4744bc46f6082618f08560702/open-sse/services/usage/claude.js

## 3. News page

The page should combine three clearly identified source types.

### Codex reset announcements

Codex Resets provides a free read-only API. The useful endpoints are:

- `GET https://codex-resets.com/api/v1/status`
- `GET https://codex-resets.com/api/v1/resets?limit=20`

The API supports `ETag`, cursor pagination, caching, and rate-limit responses.
Its data is third-party classified content, so each item must show its source.

Documentation: https://codex-resets.com/api/docs

### Provider status incidents

OpenAI and Claude publish Atom feeds and status JSON:

- https://status.openai.com/history.atom
- https://status.openai.com/api/v2/status.json
- https://status.claude.com/history.atom
- https://status.claude.com/api/v2/status.json

These sources cover incidents. They do not reliably cover promotions.

### Promotions and temporary boosts

There is no stable first-party promotion feed. Use a small curated JSON file in
the Devie Quota repository. Each entry must contain:

- A stable ID and provider.
- A type: reset, promotion, incident, or product change.
- A short title and plain-text body.
- A published time and optional expiry time.
- A first-party source URL and source label.

The app should treat all remote text as data. It should never render remote
HTML. It should cache the feed in SQLite, honor `ETag`, and refresh hourly.

The first page can show active promotions first, then a chronological feed. A
small unread badge can appear in the sidebar. Later, locally detected early
resets can appear as private events with a clear “detected on this Mac” label.

## 4. Native macOS notifications

Tauri's notification plugin supports macOS. The documented flow checks the
permission, requests it when required, and then sends a native notification.

The app should ask for permission from a Settings button. It should not ask at
first launch.

Recommended settings:

- Enable quota notifications.
- First warning threshold, default 20% remaining.
- Critical threshold, default 10% remaining.
- Notify when a quota resets.
- Notify for active promotions and reset announcements.

The existing five-minute Rust refresh task is the correct trigger point. After
each saved reading, compare the old and new values. Send only when a value
crosses a threshold.

Persist a notification key for each account, window, reset time, and threshold.
This prevents repeat alerts after an app restart. Clear the key after the quota
rises above the threshold or the reset time changes.

Suggested message:

```text
Claude Code weekly quota is low
9% remains. It resets in 1 day 4 hours.
```

Implementation work:

1. Add `tauri-plugin-notification` and initialize it in the Rust builder.
2. Add the notification capability permissions.
3. Store notification settings and sent-event keys in SQLite.
4. Add a Rust notification evaluator after successful refreshes.
5. Add the Settings controls and a “Send test notification” action.
6. Open the relevant account when the user selects a notification, if the
   platform action API is reliable.

Official reference: https://v2.tauri.app/plugin/notification/

This feature is medium-sized. The notification call is easy. Permission,
threshold crossing, and duplicate prevention need most of the work.

## 5. Provider images

The active Claude, Codex, and Copilot providers already have local SVG marks.
The redesigned provider cards now use these marks at a larger size.

9router contains 128-pixel assets for every provider currently listed on the
Devie Quota provider page:

- `antigravity.png`
- `cursor.png`
- `gemini-cli.png`
- `kiro.png`
- `kimchi.png` and `kimchi.svg`
- `opencode.png`
- `qwen.png`
- `kilocode.png`
- `cline.png`
- `windsurf.png`
- `openrouter.png`

The 9router repository uses the MIT license. Copy the selected files only when
each provider becomes real. Record their origin in a third-party notices file.
The project license does not grant rights to the provider trademarks.

Asset reference:

- https://github.com/decolua/9router/tree/699edac3273e13d4744bc46f6082618f08560702/public/providers

Keep the current letter tile for planned providers until those assets enter the
repository. This avoids shipping remote images and keeps the app usable offline.

## Recommended delivery slices

### Slice A

- Add the history command and quota line charts.
- Add an explicit Fable parser fixture.
- Add reset detection from local snapshots.

### Slice B

- Add notification settings, permission, thresholds, and duplicate prevention.
- Add a notification test action.

### Slice C

- Add the news cache and page.
- Read Codex Resets and provider status feeds.
- Add the curated promotion feed.

### Slice D

- Parse local session usage into privacy-safe daily aggregates.
- Add token, cost, cache, and model charts.
