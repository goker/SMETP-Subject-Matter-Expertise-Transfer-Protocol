# Environment variables and where to get them

> **Not in this repo (October 2026).** This list belongs to a product monorepo that is not this repository. `@smetp/cli` is not published. Do not run `npx` against that name from these notes.

This guide lists every secret and config value the app and SMETP tooling expect, with **official places to copy values** (no third-party scrapers). Open each link in your browser while signed into the right account.

## Required for local LLM routes

| Variable | Where to get it |
| -------- | --------------- |
| `ANTHROPIC_API_KEY` | [Anthropic Console](https://console.anthropic.com/) → **API keys** → Create key. Used by `@ai-sdk/anthropic` everywhere (`lib/llm.ts`, `@smetp/cli`). |

## Recommended for production-like local dev

| Variable | Where to get it |
| -------- | --------------- |
| `DATABASE_URL` | [Neon](https://neon.tech/) (or Vercel → Storage → Postgres). Connection string usually starts with `postgresql://` or `postgres://`. Run `npm run db:migrate` after setting. |
| `NEXT_PUBLIC_SUPABASE_URL` | [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Settings** → **API** → Project URL. Must be a real `https://…supabase.co` URL (not a placeholder). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same **Settings** → **API** → `anon` `public` key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page → `service_role` key. **Server-only**; never expose to the client. |

## Optional but strongly recommended in production

| Variable | Where to get it |
| -------- | --------------- |
| `KV_REST_API_URL` | [Upstash Console](https://console.upstash.com/) → Redis → your database → **REST API** → copy the REST URL. This repo also accepts Upstash’s native names `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (see `lib/rate-limit.ts`). |
| `KV_REST_API_TOKEN` | Same REST API section → token. |
| `OPENAI_API_KEY` | [OpenAI API keys](https://platform.openai.com/api-keys). Improves knowledge-graph embeddings (`text-embedding-3-small`); without it, the app uses deterministic hash embeddings. |
| `CRON_SECRET` | Generate a long random string (e.g. `openssl rand -hex 32`). Set the same value in Vercel → **Cron Jobs** auth header if you protect `/api/cron/canonicalize`. |
| `STRIPE_SECRET_KEY` | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) → Secret key. |
| `STRIPE_WEBHOOK_SECRET` | Stripe → **Developers** → **Webhooks** → signing secret for your endpoint. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → **API keys** → Publishable key. |

## Vercel-hosted deploy

1. Link the project: `vercel link`
2. Pull env into `.env.local`: `vercel env pull`
3. Or set variables in [Vercel Project → Settings → Environment Variables](https://vercel.com/docs/projects/environment-variables).

## SMETP CLI only

`npx @smetp/cli` is **not** a published command. The sentence that used to live here assumed a package that is not on npm. Skip it.

## npm publishing (maintainers)

| Variable | Where to get it |
| -------- | --------------- |
| `NPM_TOKEN` | [npmjs.com](https://www.npmjs.com/) → **Access Tokens** → Granular or classic **Automation** token for CI. Local publish usually uses `npm login` instead. |

See [PUBLISHING.md](./PUBLISHING.md) for the `@smetp/*` publish workflow.
