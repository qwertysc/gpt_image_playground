# 1Token Cloudflare deployment

This public fork follows official `CookSleep/gpt_image_playground` Releases and deploys through Cloudflare Workers Builds.

- Baseline: **v0.7.11** / `f14caf3115d17aae99372dbd25bb4cba43a631ec`.
- Worker: `gpt-image-playground-1token-store`.
- Domain: https://gpt-image-playground.1token-store.com
- Policies: [customizations](docs/1token-customizations.md), [release sync](docs/upstream-sync.md).

## Embedded profiles

`gpt-image-config.1token.json` is compiled into the Vite bundle, not fetched as a standalone public JSON file. It must contain no API keys.

| Role | ID | Provider | Model | Protocol |
|---|---|---|---|---|
| Gallery / Hybrid image executor | default-openai | sb2api-async | gpt-image-2 | Images async, non-streaming |
| Agent text planner | 1token-agent | openai | gpt-5.6-sol | Responses, streaming |

Both use `https://edge.1token-store.com`. The empty text key may inherit the selected image key at request time only when the trusted-provider, normalized URL and effective-route checks pass. Explicit text keys override inheritance. Image transparency remains local post-processing.

## Workers Builds

Existing Git integration targets this fork and Worker. Check live branch/trigger settings before pushing; do not reconnect or modify credentials as an incidental upgrade step.

```text
Production branch: main
Root directory: /
Build command: npm ci && npm test && npm run build
Production deploy: npx wrangler deploy
Non-production deploy: npx wrangler versions upload
Build variable: NODE_VERSION=20
```

`npm run build` invokes `build:1token`, setting `VITE_DEFAULT_API_URL=./gpt-image-config.1token.json`, `VITE_SHOW_PRESET_CONFIG_ONLY=true` and `VITE_LOCK_PRESET_CONFIG_PARAMS=true`. `build:base` is the explicit unbranded escape hatch. Never use it for production acceptance by mistake.

GitHub Actions stays disabled; upstream workflow files remain unchanged. Do not deploy via a second Actions/Vercel/Pages path or local Wrangler builds.

## Existing browsers

Keep profile ID `default-openai` when changing the provider from `openai` to `sb2api-async`; locked-preset merging retains the user's browser-local API key. Existing tasks and pictures remain untouched. `agentPresetDefaultsVersion=1` prevents repeated Hybrid migration.

Async endpoints require Sub2API object storage to be enabled/configured. Accepted tasks return `task_id`; the application stores it in IndexedDB and restores polling after reload. Close the page only after acceptance and local task-ID persistence. Reopen using the same browser profile, origin and API key, without clearing site data. The backend default task TTL is 24 hours, refreshed on completion; image URL expiry depends on storage configuration. Downloaded local history and remote retention are different guarantees.

## Acceptance

- Full test/build success for the exact candidate SHA through Workers Builds.
- Fresh and existing browser settings retain the intended IDs, keys, Hybrid mode and independent streaming settings.
- Authorized generation, editing and Hybrid image calls use async endpoints.
- Close/reopen polls the same accepted task without another generation POST; resulting images download successfully.
- Verify actual production asset/config after promotion, not only the green check.
- Real provider tests require an authorized test credential and may incur usage; do not use customer keys or claim unperformed tests passed.

## Rollback

Record the current Worker deployment/version and asset before promotion. Verify that main receives the preview-validated tree without rewriting production history.

Do not blindly restore a synchronous preset while accepted async tasks remain uncollected: task recovery requires the current profile provider to match the task's provider. Prefer a compatibility rollback retaining the async profile/key resolution, or retrieve affected results before changing it. Leave the enabled Sub2API backend, task records, object-storage images and browser data alone.
