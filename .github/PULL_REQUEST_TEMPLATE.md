## Summary

<!-- What does this change and why? -->

## Test plan

<!-- How did you verify it? -->

## Checklist

- [ ] `bun run check`, `bun run build`, and `bun run i18n:verify` pass.
- [ ] `cargo test --locked` passes in `src-desktop/`.
- [ ] No edits inside `src/ui` (it mirrors Devie UI byte for byte).
- [ ] `src/lib/contracts.ts` and `src-desktop/src/model.rs` stay in sync.
