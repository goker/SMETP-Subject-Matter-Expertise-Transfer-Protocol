# Why is SMETP open source?

> **Not in this repo (October 2026).** This note describes a split between a future open package set and a hosted product. The packages it names are not published, and they are not in this repository. The public repo today is the method, templates, examples, and the October 2026 benchmark write-up.

Short answer: **the methodology has to be open or nobody will adopt it.
The graph has to be closed or there is no business.**

This document explains the split — what's MIT under `packages/`, what's
proprietary in the hosted product, and why I think this is the only
honest way to ship a protocol that wants to become a standard.

---

## What's open (MIT)

- **`@smetp/spec`** — the JSON Schema + zod for insights and skill
  documents. Version it like a wire protocol; the package's semver is the
  protocol's semver.
- **`@smetp/sdk`** — the local interview runner. Bring your own LLM via
  the [`ai`](https://sdk.vercel.ai) v6 `LanguageModel` interface. Bring
  your own persistence. Run it on your laptop, in your CI, in your own
  Kubernetes cluster. No phone-home, no required SaaS account.
- **`@smetp/cli`** — a thin terminal wrapper. `npx @smetp/cli interview
  --domain finance --role underwriter --sme "Jane Doe" --out skill.json`.

If a Fortune 500 wants to run the protocol entirely on their own
infrastructure with their own model and never touch the hosted product,
they can. That is a feature, not a bug.

---

## What's proprietary (this repo's root)

- The **knowledge graph** in `lib/knowledge-graph/` and
  `db/migrations/003_knowledge_graph.sql` — concepts, formulas, regulations,
  edges, embeddings, the cross-tenant canonicalization cron.
- The **multi-tenant Next.js application** — Supabase auth, Stripe
  billing, the consultancy workspace, the live `/graph` visualization,
  the curated domain packs.
- The **corpus**: every anonymized, opted-in expert interview that has
  ever flowed through the platform.

---

## Why the split is honest

A protocol's reach is bounded by how easy it is to adopt without paying.
A SaaS product's value is bounded by what it can do that you can't do
alone. The two goals point in opposite directions when you wrap them in
the same artifact. So I unwrap them.

The **methodology is the easy thing to copy** — once you read the
spec and the SDK, you can re-implement them. That's fine. I want the
methodology copied. The more SMETP runs the world over, the more people
recognize "oh, this is the way to ship a domain skill," and the more
likely they are to bring the hard interviews — the ones where they want
a human consultant in the loop, the ones where they want a hosted graph
that is already populated for their domain — to the place that has the
moat.

The **graph is the hard thing to copy.** Even if you fork every line of
code in this repository today, you cannot fork the thousands of expert
interviews that have flowed through the platform. You cannot fork the
canonical clusters that emerged from running the cron for two years.
That graph compounds the way Wikipedia compounded — slowly,
unsexily, and then suddenly, overwhelmingly.

---

## Why this beats "fully closed"

A fully-closed protocol would force every prospective customer to take a
leap of faith on day one. They would need to upload their domain
expertise to a black box on the promise that something useful comes out.
Most won't. The ones who do will hedge by running their own thing on the
side. SMETP wants to be the **side thing** — the local CLI experts run
when they're skeptical — and the **main thing** — the hosted graph
they migrate to when they realize the side thing is sharper inside the
hosted product.

## Why this beats "fully open"

A fully-open protocol with no proprietary surface has no business model.
There is no SMETP Inc. fund to keep the spec maintained, the cron
running, the canonical layer growing. The graph would never compound,
because nobody would have an incentive to host it. The protocol would
ossify into a forgotten Postman collection.

---

## What changes for contributors

If you want to contribute to the **protocol**:

- File issues against `@smetp/spec` for proposed schema changes. Discuss
  before PR.
- Send PRs against `@smetp/sdk` and `@smetp/cli` for new features,
  providers, or bug fixes.

If you want to contribute to the **proprietary surface** (graph, cron,
hosted app):

- Open an issue first. PRs are accepted at the maintainer's discretion.
- Anything graph-shaped that should live in the protocol gets pulled
  upstream into `@smetp/spec` first.

---

## A note on data

The hosted product never moves a tenant's private extractions into the
shared canonical layer without an explicit `visibility` flag. The
nightly canonicalization cron (`/api/cron/canonicalize`) only operates
over rows where `visibility IN ('shared', 'public')`. Tenants opt their
data into the shared graph; nothing private is ever auto-promoted. See
the migration in `db/migrations/003_knowledge_graph.sql` and the cron in
`app/api/cron/canonicalize/route.ts`.

---

**Goker Ezberci**
[ieataiforbreakfast.com](https://ieataiforbreakfast.com)
