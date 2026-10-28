# SMETP packages reference

> **Not in this repo (October 2026).** The packages named below are a plan. They are not published, and this repository does not contain them. No drop-in Claude, ChatGPT, Gemini, or MCP adapter ships from here.

All packages live under `packages/`, are **MIT**, and ship as **ESM** TypeScript compiled to `dist/`.

## `@smetp/spec`

- **Role:** Single source of truth for `LLMInsight`, `SkillDocument`, and related Zod types + `SPEC_VERSION`.
- **Consumers:** Next.js app (via `tsconfig` path alias), `@smetp/sdk`, `@smetp/runtime`, `@smetp/cli`.
- **Peer:** `zod` ^4.

## `@smetp/sdk`

- **Role:** `runInterview({ provider, domain, role, … })` using the Vercel AI SDK v6 (`LanguageModel` + structured output). No Next.js, no hosted graph.
- **Depends on:** `@smetp/spec`, `ai`, `zod`.

## `@smetp/runtime`

- **Role:** `runSkill(skillDocument, input, options)` — execute exported skills (decision paths, formulas, optional LLM steps).
- **Depends on:** `@smetp/spec`.
- **Peer (optional):** `ai` for LLM-backed nodes.

## `@smetp/cli`

- **Role:** `smetp` binary wrapping the SDK for terminal interviews and `skill.json` output.
- **Depends on:** `@smetp/sdk`, `@smetp/spec`, `@ai-sdk/anthropic`, `ai`.

## What stays proprietary

The multi-tenant **knowledge graph** (`lib/knowledge-graph/`), billing, and hosted routes under `app/api/` are not part of these packages. See [WHY_OPEN.md](./WHY_OPEN.md).

## Monorepo commands

```bash
npm install              # links workspaces
npm run smetp:build      # tsc all four packages
npm run smetp:publish    # build + npm publish (see PUBLISHING.md)
```
