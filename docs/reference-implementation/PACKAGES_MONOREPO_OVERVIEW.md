# SMETP open-source packages

This folder contains the open-source pieces of the **Subject Matter
Expertise Transfer Protocol** (SMETP) — the methodology and tooling that
power [ieataiforbreakfast.com](https://ieataiforbreakfast.com).

| Package          | What it is                                                                 | Status |
| ---------------- | -------------------------------------------------------------------------- | ------ |
| `@smetp/spec`    | Versioned JSON Schema + zod for the insight + skill document shape         | alpha  |
| `@smetp/sdk`     | `runInterview({ provider, domain, role, persistence })` — BYO LLM          | alpha  |
| `@smetp/cli`     | `npx @smetp/cli interview --domain finance --out skill.json`               | alpha  |
| `@smetp/runtime` | `runSkill(skill, input)` — execute a compiled skill document              | alpha  |

## Why open?

The interview methodology, the schema, and the local runner are MIT. The
hosted multi-tenant **knowledge graph** that compounds across thousands of
SME interviews is proprietary and lives in `lib/knowledge-graph/` in this
repo. See [WHY_OPEN.md](./WHY_OPEN.md) for the full philosophy.

The packages are written as plain Node ESM TypeScript and have **zero
runtime dependencies on Next.js**. They are intentionally small so you can
read them top to bottom, audit them, and embed them in your own stack.

## Local development

The root `package.json` defines **npm workspaces** for all four packages.
After `npm install` at the repo root, workspace links resolve `@smetp/*`
imports between packages. The Next.js app still resolves `@smetp/spec` and
`@smetp/runtime` via `tsconfig` path aliases for fast iteration without
reinstalling.

```bash
npm install
npm run smetp:build
```

## Publishing

See [PUBLISHING.md](./PUBLISHING.md) and [ENVIRONMENT.md](./ENVIRONMENT.md).

Quick path:

```bash
npm run smetp:publish -- --dry-run   # verify tarballs
npm run smetp:publish                # publish @smetp/spec → runtime → sdk → cli
```

From another project after publish:

```json
{
  "dependencies": {
    "@smetp/sdk": "^0.1.0",
    "@smetp/cli": "^0.1.0"
  }
}
```
