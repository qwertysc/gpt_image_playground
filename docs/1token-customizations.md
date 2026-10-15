# 1Token customization authority

Baseline: **v0.8.0**, official commit `864f101514a403a534227682bec9a1abab45eb60`.
Upstream: https://github.com/CookSleep/gpt_image_playground
Fork: https://github.com/qwertysc/gpt_image_playground

Start from a clean official Release and rematerialize this inventory; do not replay historical commits wholesale. These are intended behaviors, not claims of completed deployment.

## CUS-AGENT-HYBRID-001 — Retained/adapted

New users default to Hybrid. Complete dual-role deployment presets migrate legacy settings once. Preserve durable `agentPresetDefaultsVersion=1`; reload and preset removal/re-adoption must not overwrite later user choices. Incomplete presets cannot borrow existing user profiles to qualify. Preserve upstream native preset behavior without adding a forced Agent-mode field to our preset.

Surface: `src/lib/apiProfiles.ts`, `src/store.ts`, `src/lib/persistedState.ts` and tests.

## CUS-AGENT-KEY-001 — Retained/adapted

An empty Hybrid text key may inherit the selected image key only if the text provider is `openai`, image provider is built-in `openai` or `sb2api-async`, normalized Base URLs and effective direct/proxy routes match, and the image key is nonempty. Explicit text keys win. Resolve a single selected text model before returning the effective request profile. Never persist duplicated secrets or trust arbitrary custom providers. Settings availability uses the same effective-key resolver.

Surface: `src/lib/apiProfiles.ts`, `src/components/SettingsModal.tsx`, focused tests.

## CUS-IMAGE-ASYNC-001 — Native + deployment configuration

- Stable image profile: `default-openai`, provider `sb2api-async`, Base URL `https://edge.1token-store.com`, Images API, direct, non-streaming, `transparentBackgroundMethod=local`.
- Model list, in order: `gpt-image-2,gpt-image-2.5,gpt-image-2.5-flare,gpt-image-2.5-sunburst`. Default is the first item. Use upstream's native `selectedModel` selector/persistence; send one model, never the entire list. Keep unrelated preset parameters locked.
- Enable only the existing `responseFormatB64Json=true` switch. No fork request/response implementation and no backend change. Async generation/editing, task polling and Base64/URL extraction remain upstream-native.
- Stable text profile: `1token-agent`, `openai`, `gpt-6.1-sol`, same Base URL, Responses, `streamImages=true`, `streamPartialImages=0`.
- Preserve browser-local API keys, profile/task references and accepted async-task recovery. Recovery requires acceptance plus durable task-ID storage, same origin/profile/key, and backend retention; it is not guaranteed before submission is persisted.

Surface: `gpt-image-config.1token.json`, `src/lib/oneTokenPreset.test.ts`, upstream async tests.

## CUS-WEB-UX-001 — New small customization

- Remove the desktop-client recommendation from `public/announcements.json`; retain general announcements and essential storage-upgrade/error notices.
- Do not render Header's desktop-download button, including Windows wide screens. Keep PWA install and other controls.
- Both existing Header brand-link branches open `https://1token-store.com` with `_blank` and `noopener noreferrer`. Preserve About/license attribution.
- `autoCheckUpdate` defaults and missing/invalid persisted-field fallbacks are false. Keep manual checking and user opt-in; do not overwrite an explicit true on reload/import. Current v0.7.11 settings have no field, so no extra migration marker is needed.

Surface: `src/components/Header.tsx`, `public/announcements.json`, `src/lib/apiProfiles.ts` and tests.

## CUS-DEPLOY-1TOKEN-001 — Retained

`npm run build` embeds the 1Token preset with preset-only and locked-parameter policies. `build:base` remains the explicit unbranded escape hatch. Worker/domain and Cloudflare Workers Builds remain unchanged; GitHub Actions is disabled, and no desktop/Vercel/Pages publishing is activated. Preserve TokenToken README content, remove agreed sponsorship/affiliate sections, preserve MIT and upstream attribution. Ignore real env files while retaining harmless upstream `.env.test`.

## Acceptance and rollback

Require exact-SHA Cloudflare full tests/build plus Browser Run fresh/legacy configuration, model persistence, Windows/mobile UI and history-read/export checks. Provider tests require separately authorized credentials/usage; mocked tests do not prove backend model availability or actual response format.

Keep upstream v0.8.0 IndexedDB v4 and Blob migrations unchanged; do not add fork schema changes. This supersedes the older v0.7.11 no-schema-change assumption. Back up important browser data before promotion. A v0.7.11 Worker cannot be assumed compatible with an already-upgraded v4 database: validate a compatible fallback or forward-fix path before promotion, never clear site data as rollback. Preserve async task/provider/key lookup compatibility.

Production merge/promotion requires separate authorization; final main tree must equal the preview-validated tree without force-push.
