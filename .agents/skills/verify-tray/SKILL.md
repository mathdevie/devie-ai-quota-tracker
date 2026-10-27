---
name: verify-tray
description: Verify the macOS menu bar item (clicks, context menu, popover open/close) after changing tray, activation, or popover code in src-desktop. Use before merging such changes.
---

# Verify the menu bar item

`cargo test --locked` (in `src-desktop/`) runs a main-thread test with real
`NSStatusItem` controls: native clicks, accessibility presses, context menus,
hit testing, language and menu replacement, and status-item recreation. Run it
first.

Then check by hand in a built app, ideally over Screen Sharing or Parsec so
remote input is covered too. Launch the executable with `DEVIE_TRAY_TRACE=1`
to log click types, activation, and popover visibility to stderr.

- A left click opens the quotas; a right click opens the context menu.
- Clicking the item again closes the popover without a flash; the next click
  reopens it. Clicking elsewhere also closes it.
- The popover is positioned correctly on the first activation, before any
  mouse movement.
- All of the above still works after changing the language and after hiding
  and showing the menu bar item.
