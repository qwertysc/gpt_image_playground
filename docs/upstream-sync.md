# Upstream release sync

`origin/main` is the customized production branch; `upstream` is the official reference. Build updates from a clean official Release tag, not a long-lived customized merge tree.

1. Inspect remote main, the current deployment, release notes and applicable Issues/PRs.
2. Pin the official tag/commit and read [customization authority](1token-customizations.md), including later approved config changes in Git history.
3. Use the isolated `hermes_sc` Git identity and a separate worktree from the clean tag.
4. Re-evaluate each customization as upstream-native, retained, adapted or obsolete. Preserve new upstream behavior outside our deliberate deployment settings; do not replay empty trigger commits.
5. Keep the two profile IDs, local keys, one-time Hybrid migration marker and browser history. Image provider is `sb2api-async`, image model is `gpt-image-2`; Agent text remains `openai` / `gpt-5.6-sol` / Responses streaming.
6. Preserve narrow trusted-provider, same-URL, same-effective-route key inheritance. Never use a generic custom-provider compatibility predicate for sharing credentials.
7. Preserve local transparency through the preset, deterministic build scripts, locked/preset-only policies, Worker/domain, README TokenToken content, MIT and attribution.
8. Keep harmless upstream test environment files. Do not install dependencies or run Node/Go/Rust tests/builds on the control host; use Cloudflare Workers Builds.
9. Run focused regression coverage and full `npm test` / `npm run build` in the existing Cloudflare preview pipeline. Verify embedded defaults, secret absence, fresh/legacy browser behavior and asynchronous close/reopen recovery with an authorized test key.
10. Integrate the candidate with production history without force-pushing main. Verify the final delivered tree equals the preview-validated tree so old omitted changes cannot silently return.
11. Promote only after preview acceptance; verify the production build, deployment, asset hash and actual settings separately.
12. Retain rollback evidence and async task retrieval compatibility; do not clear browser data, disable the backend or remove accepted tasks as a frontend rollback step.

## Recurring checks

- Stable `default-openai` / `1token-agent` IDs and browser keys.
- Images are asynchronous and non-streaming; Agent text remains streaming.
- New model defaults do not override the deployed `gpt-image-2` selection.
- No repeated Hybrid migration, no IndexedDB schema change, no replay of historical tasks.
- No credentials in presets/source/builds.
- API/task polling/result downloads work on the deployed route, without stale Service Worker polling responses.
- Main is not promoted by a preview build; Cloudflare remains the sole deployment authority.

Keep compatibility corrections explicit and small. A newly published Release is not automatically permission to add unrelated provider fixes, model migrations, UI changes or CI systems.
