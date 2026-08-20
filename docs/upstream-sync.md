# Upstream release sync

Use this workflow whenever `CookSleep/gpt_image_playground` publishes a newer official Release.

## Policy

`origin/main` is the customized production branch. `upstream` is the official reference remote. Build each update from a clean upstream release tag; do not merge upstream `main` into the customized production tree as the default strategy.

## Per-release procedure

1. Read the new official release notes, recent relevant issues, and open/merged PRs.
2. Fetch `upstream` and tags using the isolated Git identity.
3. Record the official tag, commit, tree, release timestamp, and signature status.
4. Create a clean release-sync branch from the exact official tag.
5. Read [`1token-customizations.md`](1token-customizations.md) before applying changes.
6. Re-evaluate each customization:
   - upstream-native: drop the fork patch and adopt upstream behavior;
   - still required: reimplement minimally on the new release architecture;
   - incompatible: stop and document the blocker;
   - obsolete: remove deliberately and update the authority document.
7. Recreate deployment-only files and settings without copying secrets.
8. Run focused customization tests plus the complete upstream test/build commands in Cloudflare Workers Builds.
9. Verify the built JavaScript contains the approved non-secret defaults and no API key.
10. Use a non-production branch Cloudflare preview to test fresh-browser and legacy-browser migration paths.
11. Review the final tree and customization diff before merging into `origin/main`.
12. Promote production only after the preview passes and the previous deployment is recorded for rollback.

## Mandatory checks for every release

```text
[ ] default-openai remains the image/default profile ID
[ ] Gallery model is gpt-image-2 and API mode is images
[ ] Agent text model is gpt-5.6-sol and API mode is responses
[ ] Agent default/migration is Hybrid
[ ] Agent preset-default migration version is persisted and only advanced deliberately
[ ] Same-origin Hybrid key reuse remains narrow and request-time only
[ ] Different Base URLs/providers cannot inherit keys
[ ] Mixed effective direct/proxy routes cannot inherit keys
[ ] VITE_SHOW_PRESET_CONFIG_ONLY remains true
[ ] VITE_LOCK_PRESET_CONFIG_PARAMS remains true
[ ] Worker name/domain remain unchanged
[ ] Upstream license and attribution remain intact
[ ] No secrets exist in source, git diff, or built assets
[ ] Cloudflare preview and rollback evidence exist
```

## Commit structure

Keep durable customizations in small capability-named commits where practical:

```text
feat(agent): default 1Token deployment to Hybrid mode
feat(agent): reuse same-origin image profile credentials
chore(deploy): configure 1Token Cloudflare build
```

Release-specific compatibility fixes should be separate and explicitly named. On the next upstream release, reassess them rather than replaying them automatically.
