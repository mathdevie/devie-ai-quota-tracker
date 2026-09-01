# Open-source release plan

This plan lists every change needed before the `devie-ai-quota-tracker` repository
becomes public. Work through the phases in order. Each phase is one branch
and one PR into `main`. Run `bun run check`, `bun run build`, and
`cargo test --locked` (in `src-desktop/`) before each merge.

Decisions already made:

- One public repository. No private fork or mirror.
- GitHub-hosted `macos-15` runners. The self-hosted Mac mini runner goes away.
- Secrets stay in the GitHub `Release` environment. Workflows reference names only.
- Unfinished work stays on local branches until it is ready.

## Phase 1 — Legal and blocking items

| # | Task | Files |
|---|---|---|
| 1.1 | Add `LICENSE` (MIT or Apache-2.0; pick one). | repo root |
| 1.2 | Add `"license"` to `package.json` and `license`, `repository`, `homepage` to `src-desktop/Cargo.toml`. | `package.json`, `src-desktop/Cargo.toml` |
| 1.3 | Add `NOTICE.md` with third-party attribution: Devie UI (`src/ui`), 9router provider icons (`public/providers`), Claude Code / Codex CLI / Gemini CLI / Copilot OAuth client identifiers, and a trademark note for provider logos. | repo root |
| 1.4 | Document the Gemini client secret. Add a comment above `CLIENT_SECRET` that names the upstream Gemini CLI file and its Apache-2.0 license. Add `.github/secret_scanning.yml` to allow-list the path, or move the value to a build-time env var. | `src-desktop/src/oauth/gemini.rs:17-19` |
| 1.5 | Add provenance comments to the other client identifiers. | `oauth/claude.rs:25`, `oauth/codex.rs:19`, `oauth/copilot.rs:18` |
| 1.6 | Rewrite the signing doc line "Copy the values from the Mana repository". Say: add them from your own Apple Developer account. | `docs/macos-signing.md:25` |

## Phase 2 — Remove private names and references

| # | Task | Files |
|---|---|---|
| 2.1 | Replace `mathdevie` with `octocat` in the preview fixture (id, label, sourceLocator, displayName). | `src/lib/fixtures.ts:196-204` |
| 2.2 | Replace the real X.com post URLs and quoted text with placeholder values. | `src/lib/fixtures.ts:230-244` |
| 2.3 | Remove all Mana references. Reword or delete each line. | `README.md:14,31,206`, `docs/updates.md:3`, `.github/workflows/release-desktop.yml:2`, `plans/feasibility-analysis.md:11,36,37,174,182,385,386,462` |
| 2.4 | Remove links to private repositories (`mathdevie/devie-ui.com`, `mathdevie/app.mana.re`). Link to https://www.devie-ui.com/ instead. | `README.md:91,206`, `plans/feasibility-analysis.md:462` |
| 2.5 | Add a "Forking" section to the README. State that a fork must change: the bundle identifier `com.devie.quota`, the CrabNebula slug `mathdev/devie-quota`, the updater public key, and the signing secrets. | `README.md`, `src-desktop/tauri.conf.json:5,47`, `src-desktop/src/updater.rs:15` |

## Phase 3 — CI and workflows

| # | Task | Files |
|---|---|---|
| 3.1 | Set `runs-on: macos-15`. Remove the `runner` input, the `fromJSON` expression, and the "private repo" comment. | `.github/workflows/ci.yml` |
| 3.2 | Trigger CI on `push` to `main` and on `pull_request`. | `.github/workflows/ci.yml` |
| 3.3 | Rename the job from "Check the POC" to "Check". | `.github/workflows/ci.yml:20` |
| 3.4 | Set `runs-on: macos-15` in the release and nightly workflows. Remove the self-hosted option. | `.github/workflows/release-desktop.yml`, `.github/workflows/nightly-desktop.yml` |
| 3.5 | Confirm the release workflow triggers only on `workflow_dispatch` (it creates the tag itself after publishing). Never on `push` or `pull_request`. | `.github/workflows/release-desktop.yml` |
| 3.6 | Add `.github/dependabot.yml` for `npm`, `cargo`, and `github-actions`, weekly. | `.github/dependabot.yml` |
| 3.7 | Add `rust-toolchain.toml` with `channel = "stable"` so local and CI builds match. | repo root |
| 3.8 | Stop the self-hosted runner on the Mac mini after the first public release succeeds on `macos-15`. | `~/actions-runner` (local machine) |

## Phase 4 — Consolidate and remove dead weight

Revised after PR #34: `src/ui` is a byte-identical mirror of the Devie UI
`src/ui` folder, and every customization lives outside it. Nothing inside
`src/ui` gets deleted or edited, so a future sync stays a plain rsync.
The old tasks 4.1–4.4 (delete markdown, theme duplicates, unused themes
and components) are dropped for that reason.

Run `bun run check` and `bun run build` after each row.

| # | Task | Files |
|---|---|---|
| 4.5 | Document the mirror outside `src/ui`: state in the README architecture section that `src/ui` is a byte-identical copy of Devie UI `src/ui`, synced by rsync, with all customizations in `src/components`, `src/theme`, and `src/app`. | `README.md` |
| 4.6 | Delete unused code. | `src/components/BrandMark.tsx`, `src/lib/clipboard.ts` |
| 4.7 | Delete unused icons: `android/`, `ios/`, `Square*.png`, `StoreLogo.png`, `icon.ico`, `64x64.png`. Keep the four files listed in `tauri.conf.json` plus `app-icon.svg` and `icon.png`. | `src-desktop/icons/` |
| 4.8 | Remove the stale `provider-icons` exclusion (`src/components/provider-icons/` no longer exists). | `biome.json` |
| 4.9 | Turn the remote-dashboard `DELETE` into a one-shot migration guarded by a schema version. | `src-desktop/src/db.rs` |
| 4.10 | Set `version` to `0.10.0` in `package.json` and `Cargo.toml` to match `tauri.conf.json`. | `package.json:3`, `src-desktop/Cargo.toml:3` |
| 4.11 | Move the `PROVIDER_NAMES` re-export out of `ProviderIcon.tsx`. Import it from `@/lib/labels` at the call site (`LoginDialog.tsx`). | `src/components/ProviderIcon.tsx:21` |

## Phase 5 — Docs cleanup

| # | Task | Files |
|---|---|---|
| 5.1 | Delete `plans/remote-dashboard.md`. The feature is gone and the branch will be deleted. | `plans/remote-dashboard.md` |
| 5.2 | Move `plans/feasibility-analysis.md` to `docs/history/feasibility-analysis.md` after the Mana cleanup in 2.3. | `plans/` → `docs/history/` |
| 5.3 | Move or delete `plans/quota-auto-ping.md` and `plans/usage-news-notifications.md`. Keep them under `docs/history/` if they still explain shipped behavior. | `plans/` |
| 5.4 | Delete this file after the repository is public, or move it to `docs/history/`. | `plans/open-source.md` |
| 5.5 | Remove the `plans/` folder and its README mention. | `README.md:87` |
| 5.6 | Fix the README: "Ten bundled Devie UI themes" → three native appearances plus eight custom themes; remove the "Build signed macOS app" workflow section and describe the current `release-desktop.yml`; decide whether to keep the "proof of concept" note. | `README.md` |
| 5.7 | Fix `docs/macos-signing.md` to reference `release-desktop.yml` instead of the deleted workflow. | `docs/macos-signing.md:3,38` |
| 5.8 | Move the development commands from the README into `CONTRIBUTING.md`. Keep a short pointer in the README. | `README.md:117-156`, `CONTRIBUTING.md` |
| 5.9 | Rewrite the README for a public audience. Sections: pitch and screenshots, install from Releases, features, provider table, privacy, development pointer, forking, credits and license. Drop "Product principles", "Next areas", "Known limits", "Research and references", and the CI download steps. Do this last in Phase 5 so it matches the final code. | `README.md` |

## Phase 6 — Community files

| # | Task | Files |
|---|---|---|
| 6.1 | `CONTRIBUTING.md`: prerequisites (macOS, Apple silicon, Bun, Rust, Tauri), commands, PR rules, the note that `src/lib/contracts.ts` mirrors `src-desktop/src/model.rs` by hand. | repo root |
| 6.2 | `SECURITY.md`: a disclosure email, the token storage model (per-connection `0600` files, tokens never enter the webview), and the supported version policy. Reuse `README.md:94-107` and `credentials.rs:1-5`. | repo root |
| 6.3 | `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1). | repo root |
| 6.4 | `CHANGELOG.md` seeded from the `v0.9.x` tags. Use Keep a Changelog format. | repo root |
| 6.5 | `.github/ISSUE_TEMPLATE/bug_report.yml`, `feature_request.yml`, `config.yml`. | `.github/` |
| 6.6 | `.github/PULL_REQUEST_TEMPLATE.md`. | `.github/` |
| 6.7 | `package.json`: add `description`, `repository`, `homepage`, `bugs`. Keep `"private": true` (it is an app, not a package). | `package.json` |
| 6.8 | Add `.editorconfig`. | repo root |

## Phase 7 — Git history cleanup

Current state:

- `main` has 104 commits. 103 use `hi@math.dev`, 1 uses `m.hasum@alohi.com` (commit `d070527`).
- No secret, certificate, or key was ever committed. A content purge is not needed.
- 197 `t3 checkpoint` commits exist only on local `refs/t3/checkpoints/*` refs and on `t3code/*` branches. None are on `main`.
- 21 tags (`v0.9.0` … `v0.9.7`) point to GitHub Releases.
- 33 remote branches: `main`, 4 topic branches, 28 `t3code/*` branches.

Choose one of the two options.

### Option A — Keep the history, fix the one email (recommended)

The history is clean and readable. The tags and releases stay valid.

1. Merge all phases above into `main` first.
2. Delete the remote branches that are done:
   ```sh
   git push origin --delete $(git branch -r | grep 'origin/t3code/' | sed 's|origin/||' | tr '\n' ' ')
   git push origin --delete analysis/feasibility archive/remote-dashboard poc/macos feature/alerts-auto-ping
   ```
   Keep a branch only if it holds unmerged work you still want.
3. Delete the local checkpoint refs and local branches:
   ```sh
   git for-each-ref --format='%(refname)' refs/t3/ | xargs -n1 git update-ref -d
   git branch | grep -v main | xargs git branch -D
   git reflog expire --expire=now --all && git gc --prune=now
   ```
4. Rewrite the author email with `git filter-repo`:
   ```sh
   brew install git-filter-repo
   printf 'Math <hi@math.dev> <m.hasum@alohi.com>\n' > /tmp/mailmap
   git filter-repo --mailmap /tmp/mailmap --force
   ```
   This rewrites every commit SHA after `d070527`, including the tagged ones.
   `filter-repo` moves the tags to the new commits.
5. Re-add the remote (filter-repo removes it) and force-push:
   ```sh
   git remote add origin git@github.com:mathdevie/devie-ai-quota-tracker.git
   git push --force --tags origin main
   ```
6. Check the GitHub Releases page. Releases follow tag names, so they stay attached. Confirm each release still shows its assets.
7. Delete every other local worktree and clone. They hold the old SHAs.

### Option B — Squash to a single initial commit

Use this only if you want no history at all.

1. Merge all phases into `main`.
2. Create the new root:
   ```sh
   git checkout --orphan public
   git commit -m "Initial public release"
   git branch -M public main
   ```
3. Delete all remote tags and branches, then force-push `main`.
4. Recreate the `v0.9.7` tag on the new root and re-publish the release, because the old releases lose their commits.

Option B loses the change log and breaks the existing releases. Prefer Option A.

## Phase 8 — Flip to public

Do these on GitHub after Phase 7 is pushed.

0. Remove the temporary self-hosted runner fallback from the three
   workflows (`ci.yml`, `release-desktop.yml`, `nightly-desktop.yml`):
   set `runs-on: macos-15` (build/check) and `ubuntu-24.04` (CrabNebula
   steps), and drop the `runner` dispatch input. A public repository must
   never run workflows on the personal Mac. Then unregister the runner
   (3.8) once the first hosted release succeeds.
1. Settings → General → Change visibility → Public.
2. Settings → Actions → General:
   - "Allow all actions" or restrict to the actions used.
   - Fork pull request workflows: "Require approval for all outside collaborators".
   - Workflow permissions: "Read repository contents".
3. Settings → Branches → add a rule for `main`: require a PR, require the `CI` check, no force push.
4. Settings → Code security: enable Dependabot alerts, Dependabot security updates, secret scanning, and push protection.
5. Settings → Environments → `Release`: add yourself as a required reviewer. This blocks anyone else from running the signing workflow.
6. Add the license, description, topics, and website in the repository "About" box.
7. Run the `CI` workflow once on `macos-15`. Confirm it passes.
8. Run `bun run bump` to a test version, dispatch `Release Desktop App` with `runner=macos-15`, and confirm it signs, publishes, and tags on the hosted runner.
9. Delete this plan (5.4).

## Checklist summary

- [ ] Phase 1 — LICENSE, NOTICE, license fields, Gemini secret note, signing doc line
- [ ] Phase 2 — fixtures, Mana references, private links, forking section
- [ ] Phase 3 — hosted runners, CI on PRs, Dependabot, toolchain file
- [ ] Phase 4 — delete dead UI, themes, icons, code; fix versions and migration
- [ ] Phase 5 — plans folder, README, signing doc, CONTRIBUTING pointer
- [ ] Phase 6 — community files, package.json metadata
- [ ] Phase 7 — branches, checkpoint refs, author email, force push
- [ ] Phase 8 — GitHub settings, first public CI and release run
