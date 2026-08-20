# 1Token Cloudflare deployment

This public fork tracks official `CookSleep/gpt_image_playground` releases and deploys the approved customized tree with Cloudflare Workers Builds.

## Production target

- Worker: `gpt-image-playground-1token-store`
- Domain: `https://gpt-image-playground.1token-store.com`
- Current upstream baseline: `v0.7.5`
- Upstream commit: `47f83ffdd836aa7d1e644b88e02fe4331be4beea`
- Customization authority: [`docs/1token-customizations.md`](docs/1token-customizations.md)
- Future release workflow: [`docs/upstream-sync.md`](docs/upstream-sync.md)

## Deterministic production configuration

`gpt-image-config.1token.json` is embedded during the Vite build. It contains no API key or other secret.

Expected browser configuration:

| Role | Profile | Model | API mode |
|---|---|---|---|
| Gallery and Agent image executor | `default-openai` | `gpt-image-2` | Images |
| Agent text planner | `1token-agent` | `gpt-5.6-sol` | Responses |

Agent defaults to Hybrid mode. When the Agent text profile has no key, it may reuse the selected image profile key only when both profiles are OpenAI profiles with the same normalized Base URL. The inherited key is not copied into the text profile or build output.

## Cloudflare Workers Builds

Connect this GitHub repository to the existing Worker in **Worker → Settings → Builds**.

Recommended settings:

```text
Production branch: main
Root directory: /
Build command: npm ci && npm test && npm run build:1token
Deploy command: npx wrangler deploy
Non-production branch builds: enabled
Non-production deploy command: npx wrangler versions upload
Build variable: NODE_VERSION=20
```

A failed test or build stops before deployment. Non-production branches upload preview versions without promoting production traffic.

GitHub Actions is disabled on this fork; the upstream workflow files are retained unchanged to minimize release-sync conflicts. Cloudflare Workers Builds is the authoritative CI/CD system for this deployment.

The first GitHub connection requires Dashboard authorization of the Cloudflare Workers & Pages GitHub App. A normal Workers API token cannot perform that OAuth installation step.

## Existing-browser migration

The image profile intentionally retains ID `default-openai` so the locked preset merge preserves the user's browser-local API key while replacing the old Responses/gpt-5.5 settings with Images/gpt-image-2.

`VITE_LOCK_PRESET_CONFIG_PARAMS=true` is required for the first upgrade from the legacy deployment because those browsers do not yet have a v0.7.4+ preset snapshot.

On first qualifying dual-profile preset adoption, existing users are migrated to Hybrid mode once. A persisted migration version prevents later reloads or temporary preset removal/re-adoption from overwriting an explicit user choice.

## Secrets

Never commit or compile:

- user API keys;
- Cloudflare API tokens/account credentials;
- Sub2API credentials;
- signed deployment URLs.

User API keys remain in browser storage only.

## Rollback

Before production promotion, record the current Cloudflare deployment/version ID and static asset hash. If migration, routing, PWA caching, or credential reuse fails, restore the previous Cloudflare deployment before making further changes.
