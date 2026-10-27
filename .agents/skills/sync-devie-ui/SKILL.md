---
name: sync-devie-ui
description: Update the src/ui mirror from Devie UI (mathdevie/devie-ui.com) to a reviewed commit and verify the app's integration. Use when asked to sync, update, or upgrade Devie UI or src/ui.
---

# Sync Devie UI

`src/ui` is a byte-identical copy of the `src/ui` folder in
`mathdevie/devie-ui.com`, including components, SCSS, tokens, theme assets,
and Markdown that the app does not use. The pinned commit is `baseline` in
`scripts/verify-ui-mirror.ts`.

The one allowed difference: in `src/ui/markdown/input-group.md`, the
Stripe-shaped `sk_live_…` example becomes `example-api-key`, because GitHub
push protection rejects it.

## Steps

1. Check `main`, open and recently merged pull requests, and local work.
   Run `bun scripts/verify-ui-mirror.ts` first: drift from the current
   baseline must be understood before replacing anything.
2. Pick a reviewed upstream commit, never a floating `main`. Fetch it so the
   commit exists in local Git.
3. Replace the whole `src/ui` tree from that commit, deleting stale files, and
   reapply only the example substitution above.
4. Set `baseline` in `scripts/verify-ui-mirror.ts` to the new commit and run
   the script.
5. Upgrade only the dependencies the new tree requires (usually
   `@base-ui/react`). Do not copy the upstream site's package manifest. Fix
   consumers outside the mirror; never patch `src/ui` to fit the app.
6. Run the checks:

   ```sh
   bun install
   bun run check
   bun run test
   bun run build
   (cd src-desktop && cargo test --locked)
   ```

7. Review the app-owned integration points, whose comments explain each
   override: `src/app/main.tsx` (import order, Toaster placement),
   `src/app/globals.scss` (zoom and dialog sizing), `src/theme/` (themes,
   legacy migrations, native fallbacks), `src/components/PopoverSurface.tsx`
   and its SCSS, `QuotaFilters.module.scss`, and `ResetCredits.tsx`.
8. Check in the browser (`bun run dev:web-only`) and the native app
   (`bun run dev`), and record screenshots:
   - light, dark, and custom themes, at 100% and 125% zoom;
   - a legacy saved theme (`theme-catpuccin-latte`) migrates before the first
     paint, after a reload, and across windows;
   - dialogs in a small window scroll instead of clipping;
   - the sign-in InputGroup, reset-credit confirmation by keyboard, disabled
     refresh, and the separate refresh and settings buttons in the tray;
   - a second tray click closes the popover and the next one reopens it;
   - failure toasts appear above an open dialog.

Report what passed, with screenshots, and anything you could not check.
