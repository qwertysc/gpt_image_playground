# 1Token Hybrid Agent and shared-key implementation plan

## Goal

Build a minimal public fork from official release `v0.7.5` with:

- Gallery and Agent image execution through `gpt-image-2` Images API;
- Agent planning through `gpt-5.6-sol` Responses API;
- Hybrid Agent mode enabled without user switching;
- one browser-local API key shared safely by the selected same-origin Hybrid profiles;
- one-time migration of legacy browser configuration;
- Cloudflare Workers Builds as the authoritative test/build/preview/deploy pipeline.

## Architecture

Keep upstream's existing two-profile Hybrid architecture and tool orchestration. The image/default profile remains `default-openai`; the Agent text profile is `1token-agent`. The text profile does not persist a duplicate key. At request resolution it can use the selected image profile key only when both profiles are OpenAI profiles with the same normalized Base URL.

## Implementation tasks

1. Start from the exact official `v0.7.5` tag and record provenance.
2. Add failing tests for Hybrid default, legacy migration, same-origin key inheritance, own-key precedence, and异源 rejection.
3. Change the new-user Agent default from `off` to `hybrid`.
4. Apply Hybrid once during the first qualifying dual-profile preset adoption and persist a migration version so reloads or preset removal/re-adoption stay idempotent.
5. Resolve an effective Agent text profile with safe request-time key inheritance.
6. Make Agent settings validation/dropdowns use the same effective-profile logic.
7. Add `gpt-image-config.1token.json`, deterministic `build:1token`, Worker name/domain, and deployment documentation.
8. Run `npm ci && npm test && npm run build:1token` in Cloudflare Workers Builds.
9. Validate the Responses → Images → Responses route chain on a non-production branch preview.
10. Merge to `main` and deploy only after preview acceptance and rollback capture.

## Acceptance criteria

- Fresh and migrated users open Agent in Hybrid without manual switching.
- Users enter one key in `default-openai` only.
- `/v1/responses` uses `gpt-5.6-sol`.
- `/v1/images/generations` and `/v1/images/edits` use `gpt-image-2`.
- Same-origin requests use the same Authorization value.
- Different Base URLs/providers or mixed effective direct/proxy routes never inherit credentials.
- Legacy `default-openai` keys survive migration.
- Later reloads do not repeatedly overwrite Agent mode.
- Cloudflare build, tests, preview, and production deployment are auditable.

See [`../1token-customizations.md`](../1token-customizations.md), [`../upstream-sync.md`](../upstream-sync.md), and [`../../DEPLOYMENT.md`](../../DEPLOYMENT.md) for the durable maintenance contract.
