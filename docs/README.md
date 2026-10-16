# SMETP documentation index

## Methodology (this repository)

| Document | Description |
| -------- | ----------- |
| [FRAMEWORK.md](../FRAMEWORK.md) | Full SMETP methodology |
| [GETTING_STARTED.md](../GETTING_STARTED.md) | Onboarding |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | How to contribute |
| [IMPROVEMENTS.md](../IMPROVEMENTS.md) | Roadmap and improvements |
| [knowledge-graph-and-traceability.md](./knowledge-graph-and-traceability.md) | Ontology, claim-level knowledge graph, traceable LLM answers (v0.6 draft) |

## Reference implementation — operations

The hosted product at [ieataiforbreakfast.com](https://ieataiforbreakfast.com) ships the `@smetp/*` npm packages alongside the Next.js app. The guides below are maintained in that product monorepo and mirrored here so protocol adopters can run, deploy, and publish without hunting through private notes.

| Document | Description |
| -------- | ----------- |
| [reference-implementation/SETUP.md](./reference-implementation/SETUP.md) | Production setup and smoke tests |
| [reference-implementation/DEPLOYMENT.md](./reference-implementation/DEPLOYMENT.md) | Vercel CI/CD and operations |
| [reference-implementation/README_HANDOFF.md](./reference-implementation/README_HANDOFF.md) | Maintainer handoff and architecture pointers |
| [reference-implementation/ENVIRONMENT.md](./reference-implementation/ENVIRONMENT.md) | Environment variables and where to obtain them |
| [reference-implementation/PUBLISHING.md](./reference-implementation/PUBLISHING.md) | Publishing `@smetp/*` packages to npm |
| [reference-implementation/PACKAGES.md](./reference-implementation/PACKAGES.md) | Package roles and dependency graph |
| [reference-implementation/PACKAGES_MONOREPO_OVERVIEW.md](./reference-implementation/PACKAGES_MONOREPO_OVERVIEW.md) | High-level `@smetp/*` overview |
| [reference-implementation/WHY_OPEN.md](./reference-implementation/WHY_OPEN.md) | Why the protocol surface is open source |

To refresh this folder from the product repo, copy the listed files into `docs/reference-implementation/` and open a PR.
