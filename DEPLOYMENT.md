# 1Token Cloudflare deployment

Baseline: **v0.8.0** / `864f101514a403a534227682bec9a1abab45eb60`.
Worker: `gpt-image-playground-1token-store`.
Domain: https://gpt-image-playground.1token-store.com
Authority: [customizations](docs/1token-customizations.md), [upstream sync](docs/upstream-sync.md).

## Embedded profiles

`gpt-image-config.1token.json` is compiled into the JavaScript bundle; it is not a separately fetched public JSON file and must contain no API keys.

| Role | Stable ID | Provider | Model | Protocol |
|---|---|---|---|---|
| Gallery / Hybrid image executor | default-openai | sb2api-async | gpt-image-2, gpt-image-2.5, gpt-image-2.5-flare, gpt-image-2.5-sunburst | Async Images, non-streaming |
| Agent text planner | 1token-agent | openai | gpt-6.1-sol | Responses, streaming |

Both use `https://edge.1token-store.com`. Image defaults are `gpt-image-2`, local transparency and the native Base64 switch enabled. The selected image model remains user-selectable under locked presets. An empty text key inherits the image key at request time only under the trusted-provider/same-URL/same-route checks. Explicit text keys win; no key is copied into stored text settings.

## Cloudflare Workers Builds

```text
Production branch: main
Root: /
Build: npm ci && npm test && npm run build
Production deploy: npx wrangler deploy
Non-production deploy: npx wrangler versions upload
```

`npm run build` invokes `build:1token`, which enables `VITE_SHOW_PRESET_CONFIG_ONLY`, `VITE_LOCK_PRESET_CONFIG_PARAMS` and embeds the deployment JSON. `build:base` is deliberately unbranded. Keep the current cloud build environment; check the actual trigger commands/repository before pushing. GitHub Actions stays disabled. Do not activate the upstream desktop-release pipeline, Vercel/Pages or local Wrangler deployment.

Run tests/builds in Cloudflare, and real browser QA in Cloudflare Browser Run—not on the constrained control host. Temporary version-preview access needs authorization and restoration of both original subdomain flags. Uploading a candidate must not promote production traffic.

## Browser upgrade and acceptance

Keep stable profile IDs, local keys, history, and `agentPresetDefaultsVersion=1`. Do not repeat the Hybrid migration. Defaults and missing legacy `autoCheckUpdate` fields are false; user opt-in remains possible. The client-download announcement/button are absent; the existing brand entry opens the official store in a new tab. PWA installation and upstream About attribution remain available.

v0.8.0 upgrades IndexedDB v3 to v4 and converts image data URLs to Blob records. Preserve upstream migration code and tests. Validate isolated old-data upgrade, multi-tab blocking/reload, decoded history images and data export. Recommend native backups for important data before promotion.

Require exact-SHA full tests/build, decoded embedded defaults, fresh/legacy browser acceptance, no deployed secrets, and correct native model selection. Backend model availability/Base64 delivery and real async close/reopen are separate paid-provider gates; use only explicitly authorized test credentials, not customer keys.

## Production and rollback boundary

After preview acceptance, obtain production merge/promotion authorization. Deliver the validated tree while preserving main history. Record the current Worker version/deployment before promotion and verify the real domain/assets afterward.

Restoring an old Worker is not a browser-data rollback: old v0.7.11 may not open an upgraded v4 database. Before promotion, establish a validated compatible fallback or forward-fix path; do not clear website data or add an untested downgrade. Retain async profile/provider/key compatibility for accepted tasks and leave backend tasks/storage unchanged. No compatibility rollback package is claimed tested by this document.
