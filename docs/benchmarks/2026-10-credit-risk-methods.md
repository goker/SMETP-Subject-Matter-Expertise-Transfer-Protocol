# SMETP October 2026 credit-risk benchmark — methods

**Status:** Public methods companion for peer review. Not a new scored run.
**As of:** 2026-10-27 (America/Los_Angeles), published with the human report.
**Domain:** Finance credit-risk (synthetic).
**Human report:** [`docs/benchmarks/2026-10-credit-risk.md`](./2026-10-credit-risk.md)
**Skill under test:** [`examples/finance_credit_risk_assessment.json`](../../examples/finance_credit_risk_assessment.json)

Figures below are the scored run already published in the human report. That report was cross-checked against local proof notes dated 2026-10-15 and `results.json`. Those proof files are not in this repository. This file does not add measurements.

Do not read this file as an npm release, a “94% accuracy” result, or a drop-in adapter for Claude, ChatGPT, or Gemini. None of those ship in this repo.

The harness is not in this public repository. `kg.py`, `gen_cases.py`, `bench.py`, and `cases.json` lived in a local proof folder. Publishing them under `benchmarks/` is a roadmap item (human report §9 and §10). Commands in the human report’s reproduce section do not run from a fresh clone.

---

## 1. Goal and construct

**What this benchmark measures**

1. **Graph fidelity** — whether encoding the published SMETP credit-risk decision tree as a knowledge graph plus a deterministic walker reproduces an independent hand-written oracle of the same tree.
2. **Comparison systems** — how four decision setups behave on the same synthetic cases: plain LLM, LLM with expert docs in the prompt, KG alone, and hybrid (LLM parses, KG decides).

**What this benchmark does not claim**

- That a knowledge graph is smarter than an LLM.
- That 100% KG decision accuracy is an intelligence win. It is **by construction** for in-scope rule fidelity (see §7).
- That results generalize to real historical credit decisions, other domains, or other models without further evidence.
- Production readiness, fairness under real applicant populations, or regulatory certification.

One-sentence construct: *fidelity of expert-tree capture plus relative behavior of hybrid vs LLM baselines on synthetic credit-risk decisions with escalation and citation requirements.*

---

## 2. Systems under test

From the proof notes (“What was built”) and `bench.py` (not in this repo). The human report §2.4 describes the same four setups.

| ID | Name | What it does |
|----|------|----------------|
| `kg` | KG (SMETP graph) | Deterministic reasoner over 116 subject–predicate–object triples compiled from the skill JSON. Returns decision, tier, confidence, node path, and cited rules. Escalates on missing, invalid, or out-of-range input. No model call. |
| `llm_plain` | Plain LLM | Prompt: senior credit analyst plus the application JSON. No policy document. Asks for JSON `{decision, tier, confidence, rule_cited}` and to ESCALATE when out of scope. |
| `llm_rag` | LLM + expert docs | Same output format. Prompt includes the skill `inputs`, `decision_tree`, `heuristics`, and `edge_cases` (RAG-style paste). `rule_cited` should be a decision-tree node name. |
| `hybrid` | Hybrid (LLM parses, KG decides) | Application rendered as free-text notes. LLM extracts structured fields (omit if not stated, never guess). KG `reason()` makes the decision. Citation comes from the reasoner path. |

Scored model for every arm that calls a model: **grok-4.7** via xAI (`results.json` `_notes.model`; human report §3).

---

## 3. Dataset construction

139 synthetic cases, fixed random seed 42, derived only from the expert decision tree. Counts below match the human report §2.3. The proof notes, `gen_cases.py` (`random.seed(42)`), and `cases.json` are the local sources and are not in this repo.

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

**Oracle independence.** Ground truth (`expected_decision`, `expected_tier`) comes from `gen_cases.oracle`, a separate hand-written function, not from `kg.reason`. The proof notes say: “The ground truth comes from a separate hand-written oracle, not from the graph walker, so the test checks that the graph encodes the tree correctly.” The human report states the same check. The KG’s perfect score on these labels is agreement with that oracle, which is **by construction** for rules the tree already contains.

Where published prose disagrees with the decision tree, the **tree is treated as authoritative** (human report §8; proof-note limitations).

Adversarial themes in the generator: prompt injection in a `notes` field; wrong data types (for example a score sent as a string); social pressure; one point under a cutoff; heuristics that appear in prose and are not wired into the tree.

---

## 4. Metrics

Definitions as implemented in `bench.py` and described in the human report §2.5. Primary scoring is a **deterministic verifier** against oracle labels, not an LLM-as-judge for the accuracy table.

| Metric | Definition | Direction |
|--------|------------|-----------|
| Decision accuracy | Fraction of runs where `decision == expected_decision` | Higher better |
| Decision+tier | Decision and tier both match (`null` / `None` normalized) | Higher better |
| Consistency | Fraction of cases where all k runs agree on `(decision, tier)` | Higher better |
| Overreach on escalate cases | Among the 31 must-escalate cases, fraction with `decision != ESCALATE` | Lower better |
| Adversarial accuracy | Accuracy on `category == adversarial` (16 cases) | Higher better |
| Citation rate | Fraction of runs that produce a usable citation (plain: any rule named; LLM + docs: a valid tree node; KG and hybrid: the reasoner path) | Higher better |
| Median latency | Median wall time per call | Context |
| Cost | xAI billed `cost_in_usd_ticks`, reported as USD, for LLM arms; $0 for KG | Context |

---

## 5. Application notes

These deviations matter for a validity review. They come from the proof notes, `results.json` `_notes`, and the human report §3.

| Design (harness default) | Actual scored run | Implication |
|--------------------------|-------------------|-------------|
| `RUNS` default 5 (`bench.py`) | **1 run per case** for the final scored LLM arms. The human report states this was to stay inside a ~$5 budget. | Consistency at 5 runs was not measured for LLM + docs or hybrid |
| Multi-run consistency for all LLM arms | Plain LLM consistency from **cache**: 3 runs on **97** cases, **58 of 97 (59.8%)** | Partial consistency evidence only |
| Budget | Total xAI spend including interrupted runs: **$4.67** | Cost-constrained application |
| Model | **grok-4.7** | Single-model study |
| Temperature | 0.7 (harness and the human report of the same run) | Stochastic LLM arms |

**KG encoding checks** (qualitative; `kg_validation.txt` and the proof notes, neither in this repo). Encoding found doc-versus-tree mismatches, a bankruptcy coverage gap at scores of 650 and above, undeclared inputs tested by the tree, reason-text mismatches, missing confidence on DENY and ESCALATE outcomes, and heuristics and edge cases that are not wired into the tree. These are validation findings, not accuracy-table rows. Counted findings are in the human report §7. The finance JSON was not edited for this write-up.

The proof notes’ limitations section still contains a line that the LLM baselines had not been run. That line disagrees with the scored table in the same notes, with `results.json`, and with the human report. The scored table is the run this file describes.

---

## 6. Verified results

Quote only. Percentages are the ones published in the human report §4 and the proof-notes results table.

| System | Decision acc | Decision+tier | Consistency | Overreach (31 escalate) | Adversarial | Citation | Median latency | Cost (139 calls) |
|--------|-------------:|--------------:|-------------|------------------------:|------------:|---------:|---------------:|-----------------:|
| KG (SMETP graph) | 100% | 100% | 100% (deterministic) | 0% | 100% | 100% | 0.008 ms | $0 |
| Plain LLM | 30.2% | 28.8% | 59.8% across 3 runs (97 cases, from cache) | 6.5% | 31.3% | 3.6% | 8.7 s | $0.87 |
| LLM + expert docs | 97.1% | 97.1% | not measured | 12.9% | 87.5% | 90.6% | 16.8 s | $2.29 |
| Hybrid (LLM parses, KG decides) | 97.1% | 97.1% | not measured | 12.9% | 75.0% | 100% | 2.5 s | $0.36 |

`results.json` raw fractions for the same run, as quoted from the proof file (not reprinted in the human report): plain `decision_acc` 0.302158…, LLM + docs and hybrid 0.971223…, billed costs 0.870274 / 2.29255 / 0.359988 USD. Total billed `_notes.total_billed_usd_xai`: **4.67**. Those fractions round to the percentages and dollar amounts in the table. Per-arm costs are for the 139 scored calls. The $4.67 total includes earlier interrupted runs, so it is larger than the sum of the three LLM arm costs.

**Alignment with the human report.** Decision accuracy, decision+tier, overreach, adversarial accuracy, citation rate, median latency, per-setup cost, total spend ($4.67), and plain-LLM consistency (59.8%, 58 of 97) match. Two presentation differences, already stated in that report:

- The proof table prints graph latency as `0.008 ms`. The human report prints `~0.008 ms`.
- Token counts appear in the human report only (plain LLM 2,266; LLM + expert docs 6,029; hybrid 1,644; KG 0 per call). They are not a column in the proof results table, so they are not a column here.

The human report §10 also records a plain-LLM cache recount of 44/139 correct versus 42/139 in the scored run, because duplicated adversarial prompts share one cache entry. Headline accuracy is the scored run (30.2%, the 0.302158… fraction).

The KG consistency cell is 100% because the reasoner is deterministic, not because five scored repeats were run.

---

## 7. Claims and non-claims

**Defensible, with the limitations in §9:**

1. **Fidelity / encoding check.** KG 100% agreement with an independent oracle shows the graph encodes the tree faithfully. That agreement is **by construction** for labels derived from the same rules. It is not evidence that the graph is more intelligent than an LLM.
2. **Traceability.** Every KG decision, and every hybrid decision, can carry an exact rule path (for example `root → check_standard_tier → … → approve_standard`). The human report treats that as the audit-style record.
3. **Consistency.** The KG is deterministic. The plain LLM agreed with itself on 58 of 97 cached cases (59.8%) across 3 runs.
4. **Calibrated escalation (KG).** 0% overreach on the 31 escalate cases in this set. Injection text in notes does not affect the reasoner, because the reasoner does not read free text.
5. **Cost and latency at decision time, this run.** KG 0.008 ms and $0. Hybrid 2.5 s and $0.36, against LLM + docs at 16.8 s and $2.29, at the same 97.1% decision accuracy on this set.
6. **Formalization as a testability tool.** Static validation surfaced concrete bugs in the published example (`kg_validation.txt`, not in this repo). The counted list is human report §7.

**Do not headline these:**

- “KG smarter than LLM,” or open-domain QA superiority.
- Unsupported historical marketing figures (“94% on 500+ cases”, “Claude 72%”). The proof notes state this PoC does not confirm them. The human report does not use them.
- npm packages or drop-in adapters. They are not shipped.
- External validity to real portfolios, other jurisdictions, or multi-model robustness without new evidence.
- That the adversarial gap (87.5% vs 75.0%) is statistically decisive. The set is small. The human report notes that gap is 14 vs 12 of 16 cases and sits within noise.

---

## 8. Product stance

The stance from this run is **hybrid**. An LLM can read messy input. The expert’s rules decide, cite the path, and escalate what the rules do not cover. The defensible pitch is that formalizing expert judgment makes it testable, traceable, and cheap to run, and that the hybrid keeps a rule citation on every decision.

As tested, the hybrid parser saw free-text renderings of structured fields. Emails and PDFs are the intended use. This benchmark did not measure them. The four hybrid misses on this set are described in the human report §6.3 (type normalization). That section is the narrative; this file does not restate it as a new result.

---

## 9. Limitations

- Synthetic test data. Ground truth is rule-derived. **One domain** (credit risk). The KG’s 100% decision accuracy is **by construction**: it shows the graph captured the tree, not that a KG is smarter than an LLM.
- **No real historical decisions** from a real expert were used. The example expert is fictional.
- Where docs conflict, the **decision tree is authoritative**, so some “correct” labels encode known tree gaps.
- The KG is **plain Python triples plus a tree walker**, not full OWL/RDF reasoning. Heuristics and edge cases remain prose-only.
- Scored LLM arms: **1 run per case**, single model (**grok-4.7**, temperature 0.7). Consistency was not measured for LLM + docs or hybrid.
- Hybrid, as tested, used free-text **renderings of structured fields**, not real emails or PDFs.
- The adversarial slice is 16 cases (8 scenarios, each twice). Small differences on that slice are weak evidence.
- The harness and the cases are local proof artifacts. `kg.py`, `gen_cases.py`, `bench.py`, and `cases.json` are not in this public repository. Publishing them is a separate roadmap item.

---

## 10. Fit to industry practice

This section is a checklist for methodology reviewers. It is not a claim that the benchmark has been validated as industry-standard. No multi-model judge synthesis is published yet. See [`docs/benchmarks/methodology-review.md`](./methodology-review.md).

Reviewers can compare method and application with practices such as:

- **HELM-style transparency:** scenarios, metrics beyond accuracy, disclosure of prompts and setup, public raw artifacts when possible (Liang et al., HELM).
- **Construct-validity checklists** for LLM benchmarks (for example Bean et al. / OxRML “Measuring what Matters”): define the construct, control confounds, contamination awareness, sample size and uncertainty, error analysis, justified limitations.
- **BIG-bench task criteria:** specificity, thoroughness, contamination awareness, justification of what is measured.
- **Financial model-validation themes:** data lineage, independent challenge of labels, leakage and contamination controls, reproducibility, documentation suitable for a second-line review (Bank of England, Deloitte, and IBM-style model-validation primers; the BSI AI-in-finance test-criteria catalogue as an adjacent reference).

The closest classical analog is expert-system / decision-policy fidelity evaluation: a traceable rule path, escalation, and contradiction surfacing. It is not a GraphRAG multi-hop QA task and not a text-to-SQL task.

---

## 11. What a reviewer has

Use this file together with the [human report](./2026-10-credit-risk.md) and the [skill JSON](../../examples/finance_credit_risk_assessment.json).

Optional deeper attachments exist only as local proof artifacts until the harness is published: proof notes (`REPORT.md`), `results.json`, `kg_validation.txt`, `gen_cases.py` (oracle and generator), and the system prompts in `bench.py`.

Critique method and application only. Do not treat a request to re-run the 139 cases on another model as part of this review. A re-run would be a new study. Results of the methodology review, once synthesized, will be summarized in [`methodology-review.md`](./methodology-review.md).
