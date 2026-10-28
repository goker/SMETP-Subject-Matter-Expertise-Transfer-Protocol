# Methodology review — October 2026 credit-risk benchmark

**Status:** Synthesis complete (2026-10-27). Method and application only. No case was re-run.

> **Methodology review (Oct 2026).** We asked three different LLMs (Gemini 3.1 Pro, GPT-5.6 Sol, Claude Opus 5.5) to judge the **method and application** of our synthetic credit-risk PoC — not to re-score the 139 cases. Rubric dimensions covered construct validity, oracle independence, leakage, reproducibility, baseline fairness, metrics, external validity, reporting honesty, and fit to expert-system / hybrid eval practice.
>
> **Results:** one judge rated the work **industry-standard** for a *synthetic expert-policy / hybrid LLM evaluation* (mean 4.4/5); two rated it **partially** (means 3.8 and 3.2). Shared strengths: explicit construct and non-goals, implementation-separate oracle, multi-metric design (including escalation and citation), and honest disclosure of RUNS=1 and synthetic limits. Shared gaps: harness not yet public, incomplete consistency measurement, and residual policy-shared oracle risk.
>
> **We do not claim regulated credit-model validation.** We treat this review as a map of documentation and reproducibility upgrades (publish the harness; tighten claim language; optionally re-measure consistency at k≥5 on the same protocol), not as a substitute for real-outcome or multi-model studies.

## Verdicts

**Majority verdict: partially.** This is not a unanimous industry-standard rating, and it is not accreditation or peer review.

| Judge | Verdict | Mean (D1–D9, out of 5) |
|-------|---------|-----:|
| Gemini 3.1 Pro | industry-standard, **only** as a synthetic expert-policy / hybrid LLM evaluation | 4.4 |
| GPT-5.6 Sol | partially | 3.8 |
| Claude Opus 5.5 | partially | 3.2 |

All three judges applied the same qualifier: *synthetic expert-policy / hybrid LLM eval — not regulated credit-model validation*. The mean of the three judge means is 3.8.

All three scored reproducibility (D4) and baseline fairness (D5) at 3. They flagged the then-private harness, one run per case, and the synthetic hybrid input. External-validity disclosure (D7) scored highest (5, 5, 4). No judge scored any dimension at 2 or below.

The judges disagreed most on construct validity, oracle independence, and metrics. The strictest review held that the plain LLM is a no-policy control rather than a competitor, that the hybrid's comparison is confounded by extraction into an oracle-mirroring graph, and that citation and overreach definitions were too loose.

All three judges reported that they quoted numbers only from the methods package and did not attempt a re-run.

## Since the review

These are documentation and publication changes. No case was re-run and no score changed.

- **Harness published.** [`benchmarks/2026-10-credit-risk/`](../../benchmarks/2026-10-credit-risk/README.md) has the frozen `kg.py`, `gen_cases.py`, `bench.py`, `cons.py`, `cases.json`, `results.json`, and `kg_validation.txt`, with SHA-256 hashes. The graph reproduces offline from a clone. The xAI response cache is not published.
- **Claim language tightened** in the [human report](./2026-10-credit-risk.md) and the [methods companion](./2026-10-credit-risk-methods.md): an inline by-construction note on the KG's 100% cells; the oracle described as implementation-independent and policy-shared; plain LLM framed as a no-policy control; citation defined as presence, not correctness; one 31-case escalate denominator; "calibrated escalation" and lending-compliance language removed; unmeasured "where LLMs win" points moved to hypotheses; and a written miss analysis for the two 97.1% setups.
- **Still open:** consistency at k≥5 for every LLM setup on the same model, confidence intervals, a citation-correctness check, a second-author oracle or path coverage, genuinely messy hybrid inputs, and the raw-type guard ([#10](https://github.com/goker/SMETP-Subject-Matter-Expertise-Transfer-Protocol/issues/10)).

The judges reviewed the package before these changes. Their scores are not updated to reflect them.
