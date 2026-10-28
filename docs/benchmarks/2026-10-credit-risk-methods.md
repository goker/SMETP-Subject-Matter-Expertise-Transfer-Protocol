# SMETP October 2026 credit-risk benchmark — methods

**Status:** Public methods companion for peer review. Not a new scored run.
**As of:** 2026-10-28 (America/Los_Angeles). First published 2026-10-27; updated when the harness was published and after the [methodology review](./methodology-review.md).
**Domain:** Finance credit-risk (synthetic).
**Human report:** [`docs/benchmarks/2026-10-credit-risk.md`](./2026-10-credit-risk.md)
**Frozen harness:** [`benchmarks/2026-10-credit-risk/`](../../benchmarks/2026-10-credit-risk/README.md)
**Skill under test:** [`examples/finance_credit_risk_assessment.json`](../../examples/finance_credit_risk_assessment.json)

Figures below are the scored run in [`benchmarks/2026-10-credit-risk/results.json`](../../benchmarks/2026-10-credit-risk/results.json), the same figures as the human report. This file does not add measurements.

Do not read this file as an npm release, a “94% accuracy” result, or a drop-in adapter for Claude, ChatGPT, or Gemini. None of those ship in this repo.

The harness is published. `kg.py`, `gen_cases.py`, `bench.py`, `cons.py`, `cases.json`, `results.json`, and `kg_validation.txt` are byte-identical to the 2026-10-15 proof folder and listed with SHA-256 hashes in the harness README. The graph results reproduce offline from a clone. The xAI response cache (`llm_cache.jsonl`) is not published.

---

## 1. Goal and construct

**What this benchmark measures**

1. **Graph fidelity** — whether encoding the published SMETP credit-risk decision tree as a knowledge graph plus a deterministic walker reproduces a separately written oracle of the same tree.
2. **Comparison systems** — how four decision setups behave on the same synthetic cases: a no-policy LLM control, LLM with expert docs in the prompt, KG alone, and hybrid (LLM parses, KG decides).

**What this benchmark does not claim**

- That a knowledge graph is smarter than an LLM.
- That 100% KG decision accuracy is an intelligence win. It is **by construction** for in-scope rule fidelity (see §3 and §8).
- That results generalize to real historical credit decisions, other domains, or other models without further evidence.
- Production readiness, fairness under real applicant populations, regulatory certification, or lending-compliance sufficiency.

One-sentence construct: *fidelity of expert-tree capture plus relative behavior of hybrid vs LLM setups on synthetic credit-risk decisions with escalation and citation requirements.*

---

## 2. Systems under test

From [`bench.py`](../../benchmarks/2026-10-credit-risk/bench.py). The human report §2.4 describes the same four setups. Prompts are the `p_plain`, `p_rag`, and `p_parse` functions in `bench.py`, verbatim.

| ID | Name | What it does |
|----|------|----------------|
| `kg` | KG (SMETP graph) | Deterministic reasoner over 116 subject–predicate–object triples compiled from the skill JSON. Returns decision, tier, confidence, node path, and cited rules. Escalates on missing, invalid, or out-of-range input. No model call. |
| `llm_plain` | Plain LLM (no-policy control) | Prompt: senior credit analyst plus the application JSON. No policy document. Asks for JSON `{decision, tier, confidence, rule_cited}` and to ESCALATE when out of scope. |
| `llm_rag` | LLM + expert docs | Same output format. Prompt includes the skill `inputs`, `decision_tree`, `heuristics`, and `edge_cases` (RAG-style paste). `rule_cited` should be a decision-tree node name. |
| `hybrid` | Hybrid (LLM parses, KG decides) | Application rendered as free-text notes. LLM extracts structured fields (omit if not stated, never guess). KG `reason()` makes the decision. Citation comes from the reasoner path. |

The plain LLM never sees the policy the labels come from. It is a **no-policy control** that shows what the policy adds. It is not a peer competitor to the setups that get the policy.

Scored model for every arm that calls a model: **grok-4.7** via xAI (`results.json` `_notes.model`; human report §3).

---

## 3. Dataset construction

139 synthetic cases, fixed random seed 42 (`random.seed(42)` in `gen_cases.py`), derived only from the expert decision tree. `python3 gen_cases.py` regenerates [`cases.json`](../../benchmarks/2026-10-credit-risk/cases.json) byte-for-byte.

| Property | Value |
|----------|-------|
| N cases | 139 |
| Random seed | 42 |
| Origin | Synthetic only; derived from the expert decision tree |
| In-distribution | 80 |
| Boundary | 16 |
| Doc conflict | 3 |
| Out of scope | 24 |
| Adversarial | 16 (8 scenarios × 2) |
| Expected decisions | 42 APPROVE, 30 CONDITIONAL, 36 DENY, 31 ESCALATE |

**Oracle: implementation-independent, policy-shared.** Ground truth (`expected_decision`, `expected_tier`) comes from `gen_cases.oracle`, a separate hand-written function. It does not call `kg.reason`, so the graph is not scoring itself. But the oracle and the graph encode the same expert tree and were written by the same authors. The residual risk is policy-level circularity: a shared misreading of the tree would not be caught. It is not implementation self-scoring. There is no second-author oracle, divergence log, or path-coverage report. The KG’s perfect score on these labels is therefore **by construction** for rules the tree already contains.

Where published prose disagrees with the decision tree, the **tree is treated as authoritative** (human report §8). Some labels therefore faithfully encode known tree gaps, for example approving a 650+ applicant with a recent bankruptcy.

The oracle and `kg.py` also add rules the skill does not state. Both escalate when `income_annual` is 0 (“DTI undefined”), although the skill’s schema allows a minimum of 0. Both escalate on wrong input types, such as a score sent as a string, following the schema’s declared `type`. These are harness labeling choices. They matter for the miss analysis in §7.

Adversarial themes in the generator: prompt injection in a `notes` field; wrong data types (a score sent as a string, `self_employed` as `"yes"`); social pressure; one point under a cutoff; a heuristic that appears in prose and is not wired into the tree.

**Small slices.** Adversarial is 16 cases built from 8 scenarios, each appearing twice. Doc conflict is 3 cases. Per-slice differences are weak evidence.

---

## 4. Metrics

Definitions as implemented in `metrics()` in `bench.py`. Primary scoring is a **deterministic verifier** against oracle labels, not an LLM-as-judge.

| Metric | Definition | Direction |
|--------|------------|-----------|
| Decision accuracy | Fraction of runs where `decision == expected_decision` | Higher better |
| Decision+tier | Decision and tier both match (`null` / `None` normalized) | Higher better |
| Consistency | Fraction of cases where all k runs agree on `(decision, tier)` | Higher better |
| Overreach | Among the 31 must-escalate cases, fraction with `decision != ESCALATE` | Lower better |
| Adversarial accuracy | Accuracy on `category == adversarial` (16 cases) | Higher better |
| Citation rate | Fraction of runs with a citation **present** (see below) | Higher better |
| Median latency | Median wall time per call | Context |
| Tokens per call | Prompt, completion, and reported reasoning tokens per call, from provider usage | Context |
| Cost | xAI billed `cost_in_usd_ticks`, reported as USD, for LLM arms; $0 for KG | Context |

**One escalate denominator.** The code selects cases with `category == "out_of_scope"` or `expected_decision == "ESCALATE"`. In `cases.json` that is exactly the 31 must-escalate cases: 24 out-of-scope, 4 adversarial, 2 in-distribution, 1 boundary. Overreach is one-sided. Escalating a decidable case is counted only as an accuracy loss.

**Citation is presence, not correctness.** Plain LLM: any non-empty `rule_cited`. LLM + docs: `rule_cited` is some node name in the tree, not checked against the path the oracle takes. KG: the reasoner returned a path. Hybrid: the harness records every run as cited (`cited=True`), because the KG always returns a path. The scored run has no citation-correctness check.

**Consistency at one run is not consistency.** `results.json` reports `consistency_1runs: 1.0` for every arm. With `RUNS=1` each case trivially agrees with itself. The only measured LLM consistency is plain LLM from cache (§5).

---

## 5. Application notes

These deviations matter for a validity review. They come from `results.json` `_notes`, the harness code, and the human report §3.

| Design (harness default) | Actual scored run | Implication |
|--------------------------|-------------------|-------------|
| `RUNS` default 5 (`bench.py`) | **1 run per case** for every scored LLM arm, to stay inside a ~$5 budget | Consistency not measured for LLM + docs or hybrid |
| Multi-run consistency for all LLM arms | Plain LLM consistency from **cache**: 3 runs on **97** cases, **58 of 97 (59.8%)** (`cons.py`) | Partial consistency evidence only. Not re-derivable without the unpublished cache |
| Budget | Total xAI spend including interrupted runs: **$4.67** | Cost-constrained application |
| Model | **grok-4.7** | Single-model study |
| Temperature | 0.7 (set in `bench.py` for OpenAI-compatible backends, including xAI) | Stochastic LLM arms |
| Independent samples | Response cache keyed by model, prompt, and run index | Cases with identical inputs can reuse one cached response, so the duplicated adversarial and out-of-scope cases are not all independent samples |

**KG encoding checks** ([`kg_validation.txt`](../../benchmarks/2026-10-credit-risk/kg_validation.txt), reproduced exactly by `python3 kg.py`). Encoding found doc-versus-tree mismatches, a bankruptcy coverage gap at scores of 650 and above, undeclared inputs tested by the tree, reason-text mismatches, missing confidence on DENY and ESCALATE outcomes, and heuristics and edge cases that are not wired into the tree. These are validation findings, not accuracy-table rows. Counted findings are in the human report §7. The finance JSON was not edited for this write-up.

The local proof notes from 2026-10-15 contained stale lines written before the scored run: LLM baselines “haven’t been run,” each system “runs 5 times per case,” and the LLM side “is ready to run once a key is set.” They contradict the scored table and `results.json`. The scored table is the run this file describes.

---

## 6. Verified results

Quote only. Same figures as the human report §4, from `results.json`.

| System | Decision acc | Decision+tier | Consistency | Overreach (31 escalate) | Adversarial (16) | Citation (presence) | Median latency | Tokens / call | Cost (139 calls) |
|--------|-------------:|--------------:|-------------|------------------------:|------------:|---------:|---------------:|-----:|-----------------:|
| KG (SMETP graph) | 100%\* | 100%\* | 100% (deterministic) | 0%\* | 100%\* | 100% | 0.008 ms | 0 | $0 |
| Plain LLM (no-policy control) | 30.2% | 28.8% | 59.8% across 3 runs (97 cases, from cache) | 6.5% | 31.3% | 3.6% | 8.7 s | 2,266 | $0.87 |
| LLM + expert docs | 97.1% | 97.1% | not measured | 12.9% | 87.5% | 90.6% | 16.8 s | 6,029 | $2.29 |
| Hybrid (LLM parses, KG decides) | 97.1% | 97.1% | not measured | 12.9% | 75.0% | 100%† | 2.5 s | 1,644 | $0.36 |

\*By construction: the oracle encodes the same expert tree as the graph. These cells measure faithful capture, not decision quality versus an LLM.
†Recorded by the harness on every hybrid run, because the KG always returns a path.

Raw fractions in `results.json`: plain `decision_acc` 0.302158… (42 of 139), LLM + docs and hybrid 0.971223… (135 of 139), overreach 0.0645… (2 of 31) and 0.129… (4 of 31), adversarial 0.3125 / 0.875 / 0.75 (5, 14, and 12 of 16). Billed costs 0.870274 / 2.29255 / 0.359988 USD. Total billed `_notes.total_billed_usd_xai`: **4.67**. Per-arm costs are for the 139 scored calls. The $4.67 total includes earlier interrupted runs, so it is larger than the sum of the three arm costs. The human report prints KG latency as `~0.008 ms`.

The human report §10 records a plain-LLM cache recount of 44/139 correct versus 42/139 in the scored run, because duplicated adversarial prompts share one cache entry. Headline accuracy is the scored run.

The KG consistency cell is 100% because the reasoner is deterministic, not because repeated scored runs were made.

---

## 7. Miss analysis for the two 97.1% setups

Same run, no new scores. Per-case LLM outputs come from the scored run’s response cache (not published), as written up in the human report §6.4. Case ids are matched against the published `cases.json`. They agree with the totals in `results.json`.

| Case ids | Input | Label | Hybrid | LLM + docs |
|---|---|---|---|---|
| 125, 133 (adversarial) | `credit_score` = `"800"` (string) | ESCALATE | approved (miss) | escalated |
| 130, 138 (adversarial) | `self_employed` = `"yes"` (string) | ESCALATE | approved (miss) | approved (miss) |
| 102, 111 (out of scope) | `income_annual` = 0 | ESCALATE | escalated | denied (miss) |

- **Hybrid.** All four misses, all four overreach cases (12.9%), and all four adversarial misses (75.0%) are the bad-type cases. The LLM parser normalized `"800"` to a number and `"yes"` to a boolean, so the KG’s schema guard never saw the bad type and the tree approved. The failure is at the input boundary, not in the decision logic.
- **LLM + docs.** Same theme on `self_employed: "yes"` (both adversarial misses, 87.5%). The two zero-income misses denied instead of escalating. The tree as written would reach a DTI denial at zero income, and the escalate label comes from the harness rule noted in §3. Those two misses are partly a labeling choice.
- **Fix, not yet measured.** Validate raw input types before the parser runs, or have the parser report mismatches instead of fixing them: [issue #10](https://github.com/goker/SMETP-Subject-Matter-Expertise-Transfer-Protocol/issues/10). No re-run has been made.

Because the two setups miss different cases, matching 97.1% scores on one run are not evidence that the setups are equivalent.

---

## 8. Claims and non-claims

**Defensible, with the limitations in §10:**

1. **Fidelity / encoding check.** KG 100% agreement with a separately written oracle shows the graph encodes the tree faithfully. That agreement is **by construction** for labels derived from the same tree. It is not evidence that the graph is more intelligent than an LLM.
2. **Traceable paths.** Every KG decision, and every hybrid decision, carries an exact rule path (for example `root → check_standard_tier → … → approve_standard`). That is traceability, not regulatory validation.
3. **Determinism.** The KG is deterministic. The plain LLM agreed with itself on 58 of 97 cached cases (59.8%) across 3 runs.
4. **Escalation on this set (KG).** 0% overreach on the 31 must-escalate cases. No calibration metric was measured. Injection text in notes does not affect the reasoner, because the reasoner does not read free text.
5. **Cost and latency in this run.** Hybrid $0.36 and 2.5 s median, against LLM + docs at $2.29 and 16.8 s, with both at 97.1% decision accuracy on this set in one run per case. KG alone: no model call, 0.008 ms median, $0 billed.
6. **Formalization as a testability tool.** Static validation surfaced concrete bugs in the published example (`kg_validation.txt`). The counted list is human report §7.

**Do not headline these:**

- “KG smarter than LLM,” or open-domain QA superiority.
- That the hybrid “matches” LLM + docs in general. One run, different misses.
- “Calibrated escalation,” lending-compliance readiness, or audit certification.
- Unsupported historical marketing figures (“94% on 500+ cases”, “Claude 72%”). This benchmark does not confirm them, and the human report does not use them.
- npm packages or drop-in adapters. They are not shipped.
- External validity to real portfolios, other jurisdictions, messy real documents, or multi-model robustness without new evidence.
- That the adversarial gap (87.5% vs 75.0%, 14 vs 12 of 16) is statistically decisive.
- That the benchmark is “industry-standard validated.” The methodology review’s majority verdict is **partially** ([methodology review](./methodology-review.md)).

---

## 9. Product stance

The stance from this run is **hybrid**. An LLM reads the input. The expert’s rules decide, cite the path, and escalate what the rules do not cover. On this synthetic set, the hybrid kept the policy-in-prompt accuracy while every decision carried a reasoner path.

As tested, the hybrid parser saw free-text renderings of structured fields. That the hybrid holds up on emails, PDFs, and call notes is a **hypothesis**, not a finding. So is the idea that LLMs add value on soft heuristics the tree never encoded, or on customer-facing explanations.

---

## 10. Limitations

- Synthetic test data. Ground truth is rule-derived. **One domain** (credit risk). The KG’s 100% decision accuracy is **by construction**: it shows the graph captured the tree, not that a KG is smarter than an LLM.
- **Policy-shared oracle.** Implementation-independent, same tree and authors. No second-author oracle, divergence log, or path coverage.
- **No real historical decisions** from a real expert were used. The example expert is fictional.
- Where docs conflict, the **decision tree is authoritative**, so some “correct” labels encode known tree gaps. A few labels (zero-income escalation) are harness rules, not skill rules.
- The KG is **plain Python triples plus a tree walker**, not full OWL/RDF reasoning. Heuristics and edge cases remain prose-only.
- Scored LLM arms: **1 run per case**, single model (**grok-4.7**, temperature 0.7). Consistency not measured for LLM + docs or hybrid. No confidence intervals.
- Citation rate is presence, not correctness. Overreach is one-sided.
- Hybrid, as tested, used free-text **renderings of structured fields**, not real emails or PDFs.
- The adversarial slice is 16 cases (8 scenarios, each twice) and doc conflict is 3. Duplicated inputs can share a cached response.
- **Partial reproducibility.** Harness, cases, prompts, and scored results are public, and the graph reproduces offline. The response cache is not public, and a new LLM run is a new measurement.
- **Contamination.** The skill JSON and now the cases are public and may enter training corpora. `cases.json` has no canary string.

---

## 11. Fit to industry practice

Three LLM judges reviewed this method and its application, without re-running cases. Majority verdict: **partially** aligned with common published-eval practice for a synthetic expert-policy PoC. One judge said industry-standard under that same narrow qualifier. Details, scores, and the shared gaps are in the [methodology review](./methodology-review.md). This is not accreditation and not regulated credit-model validation.

The practices the review compared against:

- **HELM-style transparency:** scenarios, metrics beyond accuracy, disclosure of prompts and setup, public raw artifacts when possible (Liang et al., HELM).
- **Construct-validity checklists** for LLM benchmarks (for example Bean et al. / OxRML “Measuring what Matters”): define the construct, control confounds, contamination awareness, sample size and uncertainty, error analysis, justified limitations.
- **BIG-bench task criteria:** specificity, thoroughness, contamination awareness, justification of what is measured.
- **Financial model-validation themes:** data lineage, independent challenge of labels, leakage and contamination controls, reproducibility, documentation suitable for a second-line review (Bank of England, Deloitte, and IBM-style model-validation primers; the BSI AI-in-finance test-criteria catalogue as an adjacent reference).

The closest classical analog is expert-system / decision-policy fidelity evaluation: a traceable rule path, escalation, and contradiction surfacing. It is not a GraphRAG multi-hop QA task and not a text-to-SQL task.

---

## 12. What a reviewer has

- This file and the [human report](./2026-10-credit-risk.md).
- The [frozen harness](../../benchmarks/2026-10-credit-risk/README.md): `kg.py`, `gen_cases.py` (oracle and generator), `bench.py` (prompts and metrics), `cons.py`, `cases.json`, `results.json`, `kg_validation.txt`, with SHA-256 hashes.
- The [skill JSON](../../examples/finance_credit_risk_assessment.json).
- The [methodology review](./methodology-review.md).

Not available: the xAI response cache, so per-case LLM outputs and the plain-LLM consistency count cannot be checked from the repo.
