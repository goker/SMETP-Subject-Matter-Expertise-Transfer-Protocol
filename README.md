# SMETP — Subject Matter Expertise Transfer Protocol

**Capture how your best expert decides. Make it testable. Let AI read, let the expert's rules decide.**

SMETP is an open (MIT) method for interviewing a subject-matter expert and writing down their
decision logic — inputs, thresholds, edge cases, confidence, and when to escalate — in a
structured form you can validate and run.

**Augment experts, don't replace them.**

### What's in this repo today

- The method: [`FRAMEWORK.md`](FRAMEWORK.md), [`GETTING_STARTED.md`](GETTING_STARTED.md)
- Interview templates in [`templates/`](templates/)
- Three worked examples (JSON): finance credit risk, healthcare differential diagnosis, legal contract risk — see [`examples/README.md`](examples/README.md)
- A hand-written **draft** Agent Skills file for the credit-risk example: [`examples/credit-risk/SKILL.md`](examples/credit-risk/SKILL.md). It is an example compile target, not a shipped product.

### What we've measured (Oct 2026, synthetic)

On 139 synthetic credit-risk cases built from [`examples/finance_credit_risk_assessment.json`](examples/finance_credit_risk_assessment.json)
(grok-4.7, 1 scored run per case):

| Setup | Decision accuracy | Rule citation | Median latency | Cost (139) |
|---|---|---|---|---|
| Plain LLM (no-policy control) | 30.2% | 3.6% | 8.7 s | $0.87 |
| LLM + expert docs in prompt | 97.1% | 90.6% | 16.8 s | $2.29 |
| **Hybrid: LLM parses, SMETP graph decides** | **97.1%** | **100%** | **2.5 s** | **$0.36** |
| SMETP graph alone (structured input) | 100%\* | 100% | ~0.008 ms | $0 |

\*By construction — the test answers come from an oracle of the same expert tree. It shows faithful capture, not a smarter system.
Rule citation counts whether a rule was named, not whether it was the right one.
Caveats: synthetic data, one domain, one model, one run per case. Total spend: $4.67.
Full report: [October 2026 credit-risk benchmark](docs/benchmarks/2026-10-credit-risk.md)
Methods: [how the run was designed and applied](docs/benchmarks/2026-10-credit-risk-methods.md).
Harness: [`benchmarks/2026-10-credit-risk/`](benchmarks/2026-10-credit-risk/README.md), frozen with SHA-256 hashes. The graph results reproduce offline from a clone, no API key needed.
Methodology review: [three LLM judges, majority verdict "partially"](docs/benchmarks/methodology-review.md). One judge said industry-standard, only as a synthetic expert-policy evaluation. Not regulated credit-model validation.

Encoding the example as a graph also found bugs in it (2 of 5 published test cases contradict
the tree; a bankruptcy check never runs at scores of 650+; undeclared fields). Tracked here:

- [#14](https://github.com/goker/SMETP-Subject-Matter-Expertise-Transfer-Protocol/issues/14) — published test "bankruptcy 8 years ago, score 700" expects CONDITIONAL/SUBPRIME; the tree returns APPROVE/STANDARD
- [#3](https://github.com/goker/SMETP-Subject-Matter-Expertise-Transfer-Protocol/issues/3) — published test "self-employed, 3 years" expects CONDITIONAL; the tree returns APPROVE
- [#4](https://github.com/goker/SMETP-Subject-Matter-Expertise-Transfer-Protocol/issues/4) — `check_recent_bankruptcy` never runs at scores of 650+
- [#5](https://github.com/goker/SMETP-Subject-Matter-Expertise-Transfer-Protocol/issues/5) — `has_2yr_tax_returns` and `tax_return_trend` are tested but not declared
- [#6](https://github.com/goker/SMETP-Subject-Matter-Expertise-Transfer-Protocol/issues/6) — reason text on `deny_credit_seeking` and `deny_high_dti` does not match the branch
- [#7](https://github.com/goker/SMETP-Subject-Matter-Expertise-Transfer-Protocol/issues/7) — DENY and ESCALATE outcomes have no confidence
- [#8](https://github.com/goker/SMETP-Subject-Matter-Expertise-Transfer-Protocol/issues/8) — five heuristics and six edge cases are prose only
- [#9](https://github.com/goker/SMETP-Subject-Matter-Expertise-Transfer-Protocol/issues/9) — score 780 with DTI 80%, zero savings, and 5 inquiries is approved PRIME

Benchmark follow-up: [#10](https://github.com/goker/SMETP-Subject-Matter-Expertise-Transfer-Protocol/issues/10).
Roadmap: [#11](https://github.com/goker/SMETP-Subject-Matter-Expertise-Transfer-Protocol/issues/11) harness (published in `benchmarks/2026-10-credit-risk/`), [#12](https://github.com/goker/SMETP-Subject-Matter-Expertise-Transfer-Protocol/issues/12) SKILL.md compiler, [#13](https://github.com/goker/SMETP-Subject-Matter-Expertise-Transfer-Protocol/issues/13) MCP server.

The product stance from that run: **hybrid**. An LLM reads the input. The expert's rules decide, cite the path, and escalate what the rules do not cover. Messy real documents are the intended input. This run did not test them.

### Not shipped yet (roadmap)

- A JSON Schema + validator for skill files
- Compile to Agent Skills `SKILL.md` (credit-risk draft is in-repo; no compiler yet)
- An MCP server exposing `decide` / `explain` / `validate`
- Healthcare and legal benchmarks

There are **no published npm packages** and **no drop-in adapters** for Claude, ChatGPT,
Gemini or other tools yet. We'll update this section when they exist.

Notes under [`docs/reference-implementation/`](docs/reference-implementation/) are a handoff plan for a future codebase. They are not install instructions, and this repository has no package tree.

Example JSON files still contain validation fields from earlier drafts. Those fields are not measurements. Read [`examples/README.md`](examples/README.md) before quoting anything inside an example.

### Try it

- **By hand:** follow [`GETTING_STARTED.md`](GETTING_STARTED.md) with the interview templates.
- **Tell us what to capture next:** open an Issue with the domain-request template. GitHub Discussions are not enabled on this repo yet. Paste-ready posts are in [`docs/benchmarks/discussions-draft.md`](docs/benchmarks/discussions-draft.md).

## License

MIT License - See [LICENSE](LICENSE) for details.

Built by Goker Ezberci.

Questions and corrections: GitHub Issues. Email: contact@ieataiforbreakfast.com
