# SMETP documentation index

## Methodology (this repository)

| Document | Description |
| -------- | ----------- |
| [FRAMEWORK.md](../FRAMEWORK.md) | Full SMETP methodology |
| [GETTING_STARTED.md](../GETTING_STARTED.md) | Onboarding, by hand |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | How to contribute |
| [IMPROVEMENTS.md](../IMPROVEMENTS.md) | Roadmap notes (older drafts; see the benchmark before quoting a number) |
| [benchmarks/2026-10-credit-risk.md](./benchmarks/2026-10-credit-risk.md) | October 2026 synthetic credit-risk benchmark (the only published numbers) |
| [benchmarks/2026-10-credit-risk-methods.md](./benchmarks/2026-10-credit-risk-methods.md) | Methods companion: construct, application, claims |
| [benchmarks/methodology-review.md](./benchmarks/methodology-review.md) | Methodology review placeholder (in progress; not a re-run) |
| [benchmarks/discussions-draft.md](./benchmarks/discussions-draft.md) | Discussion posts to paste once Discussions are enabled |

## Reference implementation — operations

> **Not published (October 2026).** The guides below are a handoff plan mirrored from a product monorepo. This public protocol repo has no `packages/` tree and no published npm packages. It also has no drop-in adapter for Claude, ChatGPT, Gemini, or MCP. Do not treat the commands in those guides as something a clone of this repo can run. The README states the same limit.

| Document | Description |
| -------- | ----------- |
| [reference-implementation/SETUP.md](./reference-implementation/SETUP.md) | Production setup and smoke tests |
| [reference-implementation/DEPLOYMENT.md](./reference-implementation/DEPLOYMENT.md) | Vercel CI/CD and operations |
| [reference-implementation/README_HANDOFF.md](./reference-implementation/README_HANDOFF.md) | Maintainer handoff and architecture pointers |
| [reference-implementation/ENVIRONMENT.md](./reference-implementation/ENVIRONMENT.md) | Environment variables and where to obtain them |
| [reference-implementation/PUBLISHING.md](./reference-implementation/PUBLISHING.md) | Handoff notes for a future npm publish (nothing is published) |
| [reference-implementation/PACKAGES.md](./reference-implementation/PACKAGES.md) | Planned package roles (no package tree in this repo) |
| [reference-implementation/PACKAGES_MONOREPO_OVERVIEW.md](./reference-implementation/PACKAGES_MONOREPO_OVERVIEW.md) | Planned package overview (not a release) |
| [reference-implementation/WHY_OPEN.md](./reference-implementation/WHY_OPEN.md) | Why the protocol surface is open source |

To refresh this folder from the product repo, copy the listed files into `docs/reference-implementation/` and open a PR.
