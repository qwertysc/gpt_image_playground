# Upstream release sync

`origin/main` is the customized production branch. The current source baseline is official **v0.8.0** / `864f101514a403a534227682bec9a1abab45eb60`.

1. Read remote main, live embedded configuration and [customization authority](1token-customizations.md). Recheck the latest official Release immediately before branching; do not silently change an approved target.
2. With isolated `hermes_sc` identity, create a clean official-tag worktree and prove tree equality. Reapply approved behavior, not historical commits/trigger commits wholesale.
3. Retain the two stable profile IDs, local keys, one-time Hybrid marker, trusted same-route key inheritance and native async recovery. The inventory is authoritative for current model IDs and streaming/Base64 defaults.
4. Prefer upstream-native capabilities: v0.8.0 already supports comma-separated models plus `selectedModel`, locked selection preservation, Base64, announcements and update checking. Customize only the prescribed configuration/UI defaults, not request builders.
5. Preserve upstream DB v4/Blob migrations and all unrelated tests; do not add fork schema changes. Check old-data read/export and database downgrade constraints before promising rollback.
6. Keep deterministic 1Token build scripts, preset locks, Worker/domain, README cleanup/TokenToken, MIT and attribution. Keep `.env.test`, ignore real secrets, keep GitHub Actions disabled.
7. Use Cloudflare Workers Builds for full `npm test` and `npm run build`. Do not install/build on the control host. Browser acceptance runs in Cloudflare Browser Run; provider charges need separate approval.
8. Verify preview branch uses `versions upload`, not production deploy. Bind tests, asset/config and browser evidence to the exact candidate SHA. Restore any authorized temporary preview visibility.
9. Integrate production history without force-pushing and ensure the final delivered tree equals the accepted tree. Merge/promotion requires separate approval. Verify production independently after promotion.
10. Preserve async task lookup and browser-data compatibility in rollback/forward repair. Do not clear site data, disable the backend, or delete accepted tasks.

Keep this a small fork: no extra CI platform, provider engine, credentials or unrelated UI redesign. The previous fixed `gpt-image-2`/`gpt-5.6-sol` restriction is superseded only by the explicitly approved four-image-model/`gpt-6.1-sol` configuration.
