# 1Token customization authority

This document is the authoritative inventory of intentional differences from the official `CookSleep/gpt_image_playground` release. Future upstream updates must begin from a clean official release tag and re-evaluate each item below. Do not mechanically merge a long-lived customized branch.

## Current baseline

```text
Upstream release: v0.7.5
Upstream commit: 47f83ffdd836aa7d1e644b88e02fe4331be4beea
Upstream repository: https://github.com/CookSleep/gpt_image_playground
Fork repository: https://github.com/qwertysc/gpt_image_playground
```

## CUS-AGENT-HYBRID-001 — Hybrid is the default Agent mode

**Requirement**

- New users start with `agentApiConfigMode=hybrid`.
- Existing legacy users adopt Hybrid once when the new preset configuration first takes ownership.
- A persisted migration version prevents later reloads or preset removal/re-adoption from repeatedly overwriting a user choice.

**Expected implementation surface**

- `src/lib/apiProfiles.ts`
- `src/store.ts`
- `src/lib/persistedState.ts`
- focused tests in `src/lib/apiProfiles.test.ts`, `src/store.test.ts`, and `src/lib/persistedState.test.ts`

**Must not change**

- Agent function schemas;
- Responses request construction;
- Images request construction;
- IndexedDB schema.

## CUS-AGENT-KEY-001 — Hybrid text and image profiles share one browser key

**Requirement**

The selected Hybrid text profile may inherit the selected image profile key only when:

1. the text profile's own key is empty;
2. both profiles use the OpenAI provider;
3. their normalized Base URLs are exactly equal;
4. the image profile has a non-empty key.

The text profile's own key always wins. Different providers or Base URLs must never share credentials. Inheritance is request-time only; the key is not copied into the text profile, preset JSON, source, logs, or static assets.

**Expected implementation surface**

- `src/lib/apiProfiles.ts`
- `src/components/SettingsModal.tsx`
- optional explanatory copy in `src/components/settings/AgentSettingsTab.tsx`
- focused tests in `src/lib/apiProfiles.test.ts`

## CUS-DEPLOY-1TOKEN-001 — Deterministic 1Token profiles and Cloudflare target

**Requirement**

- Gallery/image profile ID remains `default-openai` to preserve legacy browser keys.
- Gallery and Agent image execution use `gpt-image-2` through Images API.
- Agent text uses `gpt-5.6-sol` through Responses API.
- Build embeds `gpt-image-config.1token.json`.
- Preset-only and locked-parameter policies are enabled.
- Cloudflare Worker remains `gpt-image-playground-1token-store` with custom domain `gpt-image-playground.1token-store.com`.

**Expected implementation surface**

- `gpt-image-config.1token.json`
- `package.json`
- `wrangler.jsonc`
- `DEPLOYMENT.md`

## Acceptance checks

1. A fresh browser needs one API key only.
2. Agent opens in Hybrid without manual switching.
3. Agent planner request uses `/v1/responses` and model `gpt-5.6-sol`.
4. Agent image execution uses `/v1/images/generations` or `/v1/images/edits` and model `gpt-image-2`.
5. Text and image Authorization values match for the same user.
6. Different Base URLs do not share keys.
7. A legacy `default-openai` key survives the preset migration.
8. Repository and build artifacts contain no real credentials.
9. Cloudflare preview validation passes before production promotion.
