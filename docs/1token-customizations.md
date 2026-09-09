# 1Token customization authority

This is the authoritative inventory of intentional differences from `CookSleep/gpt_image_playground`. Each update starts from a clean official Release; do not mechanically merge upstream main or replay old trigger commits.

## Current baseline

- Upstream: **v0.7.11**, commit `f14caf3115d17aae99372dbd25bb4cba43a631ec`.
- Upstream repository: https://github.com/CookSleep/gpt_image_playground
- Fork repository: https://github.com/qwertysc/gpt_image_playground

## CUS-AGENT-HYBRID-001 — Hybrid defaults and durable migration

New users default to Hybrid. Legacy users adopt the dual-profile preset once. Preserve `agentPresetDefaultsVersion=1`; later reloads or preset removal/re-adoption must not overwrite an explicit user choice. Async enablement does not bump this migration version.

Surface: `src/lib/apiProfiles.ts`, `src/store.ts`, `src/lib/persistedState.ts` and their existing tests. Keep upstream request builders, function schemas and IndexedDB schema intact.

## CUS-AGENT-KEY-001 — One browser key, narrow request-time inheritance

An empty Hybrid text key may inherit the selected image key only when:

1. the text provider is `openai`;
2. the image provider is the built-in `openai` or `sb2api-async`;
3. normalized Base URLs and effective direct/proxy routes match;
4. the image key is non-empty.

An explicit text key always wins. Never extend this rule to arbitrary custom providers. Inheritance returns an effective request profile; it does not copy secrets into stored text profiles, deployment presets, source, logs or static assets. Settings availability uses the same effective-key resolution.

Surface: `src/lib/apiProfiles.ts`, `src/components/SettingsModal.tsx`, `src/lib/apiProfiles.test.ts`.

## CUS-IMAGE-ASYNC-001 — Native Sub2API asynchronous images

- Retain image profile ID **`default-openai`**, preserving existing browser keys and references.
- Use built-in provider **`sb2api-async`**, model **`gpt-image-2`**, Base URL **`https://edge.1token-store.com`**, Images API, non-streaming and direct routing.
- Gallery and Hybrid image execution use `/v1/images/generations/async` or `/v1/images/edits/async`, then poll `/v1/images/tasks/{task_id}`.
- Reuse upstream submission, polling and restart recovery. Do not create a second async engine or replay old synchronous tasks.
- Explicit `transparentBackgroundMethod=local` preserves the existing background-removal workflow. A software upgrade must not silently switch the deployed model to GPT Image 2.5 or enable API-native transparency.
- Agent text retains profile **`1token-agent`**, **`gpt-5.6-sol`**, Responses API, **`streamImages=true`** and **`streamPartialImages=0`**. Image streaming remains false. Do not remove UI controls.

Surface: `gpt-image-config.1token.json`, `src/lib/oneTokenPreset.test.ts`, existing async tests in `src/lib/api.test.ts` / `src/store.test.ts`.

### Recovery boundary

Close/reopen is supported after the server accepts the task and its ID is persisted in IndexedDB. Use the same browser profile, origin, API profile and API key; do not clear site data. This does not guarantee recovery if the page closes during upload or before the task-ID write completes. The backend's task/URL retention and server-restart behavior are separate limits.

## CUS-DEPLOY-1TOKEN-001 — Deterministic build, target and branding

- `npm run build` embeds `gpt-image-config.1token.json`; `build:base` remains the unbranded escape hatch.
- Preserve preset-only and locked-parameter policies. Locked preset updates keep each user's local key.
- Worker: `gpt-image-playground-1token-store`; domain: `gpt-image-playground.1token-store.com`.
- Cloudflare Workers Builds is authoritative; keep GitHub Actions disabled and do not enable upstream Vercel/Pages deployments.
- README retains TokenToken, removes the agreed sponsorship/affiliate sections, and preserves upstream license and attribution.
- Keep real `.env` files ignored; the harmless upstream `.env.test` remains tracked.

## Acceptance and rollback

1. New and existing browsers need only one image key; text/image routing remains separated.
2. Provider migration keeps `default-openai`, browser key, tasks and images; no IndexedDB schema change.
3. Wrong providers, different URLs or different effective proxy routes cannot inherit keys.
4. Accepted async tasks resume polling after reload without a second submission; both generation and editing work.
5. Test/build and exact-SHA Cloudflare preview pass before production promotion.
6. Final main tree must equal the preview-validated tree; no force-push.
7. Rollback retains async task lookup compatibility. Returning the same profile ID to `openai` can strand uncollected async tasks; preserve a compatible async profile/key lookup or retrieve affected results first.
