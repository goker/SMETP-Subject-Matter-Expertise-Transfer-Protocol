# SMETP Benchmark Report

## Captured expert judgment as a knowledge graph vs. LLMs on 139 credit-risk decisions

**Author:** Göker Ezberci · **Date:** October 16, 2026 · **Project:** SMETP (Subject Matter Expertise Transfer Protocol), open and MIT-licensed
**Repo:** https://github.com/goker/SMETP-Subject-Matter-Expertise-Transfer-Protocol

*Augment, don't replace.*

> **In-repo copy (October 2026).** Headline numbers are the scored run in [`benchmarks/2026-10-credit-risk/results.json`](../../benchmarks/2026-10-credit-risk/results.json), frozen 2026-10-15 and published with SHA-256 hashes on 2026-10-28. Decision accuracy, decision+tier, overreach, adversarial accuracy, citation rate, median latency, tokens per call, per-setup cost, total spend ($4.67), and plain-LLM consistency (59.8%, 58 of 97) match that file. `results.json` gives graph latency as 0.008 ms; this write-up keeps `~0.008 ms`. The local proof notes from that day contained stale lines (LLM baselines "haven't been run", "5 times per case", LLM side "ready to run once a key is set"). They predate the scored run and are not repeated here.
>
> Chart PNGs from the working folder are not in this repository.
>
> This file does not claim npm packages or drop-in model adapters. Those are roadmap items, and they are not in the public repo.

**See also:** [Methods companion](./2026-10-credit-risk-methods.md) (construct, metrics, application, claims). [Frozen harness](../../benchmarks/2026-10-credit-risk/README.md) (runs offline from a clone for the graph). [Methodology review](./methodology-review.md) (three LLM judges; majority verdict **partially**).

---

## 1. Summary

SMETP is a method for interviewing a subject-matter expert, pulling out their decision logic, thresholds, edge cases and confidence, and writing it down in a structured, testable form. This report tests one question: **if you encode an expert's judgment as a knowledge graph (KG), what do you gain over asking an LLM?**

We took the credit-risk skill published in the SMETP repo, compiled its decision tree into a 116-triple knowledge graph with a deterministic reasoner, and ran it against three LLM-based setups on 139 synthetic loan applications using grok-4.7.

Five findings:

1. **A no-policy control (an LLM without the expert's rules) gets 30.2% of decisions right.** It is a control, not a competitor: it never saw the policy the answers come from. It mostly escalates cases it can't ground in a policy.
2. **Giving the LLM the expert's documents gets it to 97.1%** on this set. It costs the most ($2.29 for 139 decisions), is the slowest (16.8 s median), and names a decision-tree node 90.6% of the time.
3. **The hybrid (LLM reads the input, KG makes the decision) also reached 97.1% on this set, at $0.36 and a 2.5 s median.** Every hybrid decision carries a reasoner path. One run per case, so the two 97.1% figures are the same score on one sample, not a demonstrated equivalence. The hybrid's four misses share one cause (Section 6.4).
4. **The KG alone scores 100%, by construction.** The labels come from an oracle that encodes the same expert tree. That number shows the graph captured the tree faithfully. It does not show the graph is smarter than an LLM.
5. **Encoding the expertise found bugs in the expert's own published example**: 2 of its 5 test cases contradict its decision tree, there is a bankruptcy check that never runs at credit scores of 650+, two fields are missing from the schema, and some reason text doesn't match the logic.

The defensible pitch is not "a KG beats an LLM". It is: **formalizing expert judgment makes it testable and traceable, and on this synthetic set the hybrid kept the policy-in-prompt accuracy while every decision carried a rule path.** Whether the hybrid holds up on messy real input is a hypothesis (Section 6.5).

---

## 2. Method

### 2.1 What SMETP captures

SMETP's five phases are Capture, Analyze, Codify, Validate and Deploy. A structured, role-specific interview with the expert yields:

- **inputs** (the fields a decision depends on, with types and ranges),
- a **decision tree** (explicit if/then checks leading to outcomes),
- **outcomes** with a decision, a tier, a reason and a per-scenario confidence,
- **heuristics** and **edge cases** the expert uses,
- **validation** test cases.

The repo ships three worked examples (credit risk, differential diagnosis, contract risk). This benchmark uses `examples/finance_credit_risk_assessment.json` (fictional expert "Jane Doe, Senior Credit Analyst"): 8 input fields and 26 decision-tree nodes.

The example file also contains a `validation` block and a `benchmarking` block from an earlier draft. The proof notes say those accuracy lines have no dataset behind them. This report does not treat them as results. See [examples/README.md](../../examples/README.md).

### 2.2 From skill file to knowledge graph (`kg.py`)

- The decision tree becomes **116 subject–predicate–object triples**: the skill, its input features and datatypes, each check node (its condition, its true and false branches, the inputs it tests), and each outcome (decision and confidence).
- A **SHACL-style static validator** checks the graph: dangling branches, conditions that test undeclared inputs, outcomes without confidence, and reason text that disagrees with the logic.
- A **deterministic reasoner** walks the graph and returns a decision, tier, confidence, the node path it took and the rules it cited. Before walking, a schema guard escalates when a required input is missing, has the wrong type, or is out of range. If the tree needs a field that wasn't provided, the reasoner escalates and names the field.

Example trace: `root → check_standard_tier → check_dti → check_employment → check_inquiries → approve_standard`.

`kg.py` is published in [`benchmarks/2026-10-credit-risk/`](../../benchmarks/2026-10-credit-risk/README.md). See Section 10.

### 2.3 Test set (`gen_cases.py`, `cases.json`)

139 synthetic cases, fixed random seed 42, derived only from the expert's decision tree:

| Category | Cases | What it tests |
|---|---|---|
| In-distribution | 80 | Ordinary applications the tree covers |
| Boundary | 16 | Values right at the thresholds |
| Doc conflict | 3 | Cases where the repo's docs and tree disagree (the tree is treated as authoritative) |
| Out of scope | 24 | Missing, invalid or out-of-range inputs that must escalate |
| Adversarial | 16 | Prompt injection in a notes field, numbers sent as strings, social pressure, one point under a cutoff, a heuristic the tree doesn't cover (8 scenarios, each appearing twice) |

Expected decisions: 42 APPROVE, 30 CONDITIONAL, 36 DENY, 31 ESCALATE.

**Oracle: implementation-independent, policy-shared.** Ground truth comes from `gen_cases.oracle`, a separate hand-written function that never calls the graph walker. So the KG is not scoring itself. But the oracle and the graph encode the same expert tree and were written by the same authors. That leaves policy-level circularity: if both misread the tree the same way, the benchmark would not catch it. There is no second-author oracle, divergence log, or path-coverage report yet.

Small slices: the adversarial set is 16 cases (8 scenarios, each twice) and doc conflict is 3 cases. Treat per-slice differences as weak evidence.

### 2.4 Systems compared (`bench.py`)

| System | How it decides |
|---|---|
| **Plain LLM (no-policy control)** | "You are a senior credit analyst" plus the application JSON. No policy. |
| **LLM + expert docs** | The expert's inputs, decision tree, heuristics and edge cases pasted into the prompt (RAG-style), plus the application. Must cite a decision-tree node. |
| **KG only** | The deterministic reasoner over the SMETP graph. No model call. |
| **Hybrid** | The LLM turns the application (rendered as free-text notes) into structured fields, told to omit anything not stated and never guess. The KG makes the decision. |

All LLM systems ask for JSON with a decision, tier, confidence and the rule cited, and are told to ESCALATE when information is missing, invalid or out of scope. The prompts are the `p_plain`, `p_rag` and `p_parse` functions in the published `bench.py`.

The plain LLM is a **no-policy control**. It shows what the model does without the expert's rules. It is not a fair competitor to setups that get those rules.

### 2.5 Metrics

- **Decision accuracy**: decision matches the expected decision. **Decision + tier**: tier matches too.
- **Overreach**: one denominator, the 31 must-escalate cases (24 out-of-scope, 4 adversarial, 2 in-distribution, 1 boundary). Overreach is the share where the system made a decision instead of escalating. Lower is better. It is one-sided: escalating a case that had a definite answer is not counted here.
- **Adversarial accuracy**: accuracy on the 16 adversarial cases.
- **Citation rate measures presence, not correctness.** Plain LLM: any rule named. LLM + docs: some valid node name from the tree, not checked against the right path. KG: the reasoner returned a path. Hybrid: the harness records every run as cited, because the KG always returns a path. No citation-correctness check exists in the scored run.
- **Consistency**: same decision and tier across repeated runs. `results.json` has a `consistency_1runs` field that reads 1.0 for every arm. With one run that is trivially true, and it is not a consistency measurement.
- **Latency** (median per decision), **tokens per call**, and **cost** (xAI-billed `cost_in_usd_ticks`).

---

## 3. Setup

- **Model:** grok-4.7 via the xAI API, temperature 0.7.
- **Runs:** 1 run per case for every LLM system in the scored run, to stay inside a ~$5 budget. The harness supports 5.
- **Consistency:** measured only for the plain LLM, from cached earlier runs: 97 cases had 3 runs each.
- **Total spend:** $4.67 billed by xAI for the whole benchmark, including earlier interrupted runs.
- **KG runtime:** plain Python, single thread.

---

## 4. Results

| System | Decision acc. | Decision + tier | Overreach (31 must-escalate) | Adversarial (16) | Citation | Median latency | Tokens / call | Cost, 139 decisions |
|---|---|---|---|---|---|---|---|---|
| KG only (SMETP graph) | 100%\* | 100%\* | 0%\* | 100%\* | 100%† | ~0.008 ms | 0 | $0 |
| Plain LLM (no-policy control) | 30.2% | 28.8% | 6.5% | 31.3% | 3.6%† | 8.7 s | 2,266 | $0.87 |
| LLM + expert docs | 97.1% | 97.1% | 12.9% | 87.5% | 90.6%† | 16.8 s | 6,029 | $2.29 |
| **Hybrid (LLM parses, KG decides)** | **97.1%** | 97.1% | 12.9% | 75.0% | 100%† | **2.5 s** | 1,644 | **$0.36** |

\*By construction. The oracle encodes the same expert tree as the graph, so these cells measure faithful capture of the tree, not decision quality versus an LLM.
†Citation is presence, not correctness (Section 2.5). The hybrid's 100% is recorded by the harness because the KG always returns a path.

One scored run per case for every LLM row. The adversarial column is 16 cases: 87.5% vs 75.0% is 14 vs 12 cases and is not statistically decisive.

**Consistency:** the KG is deterministic. The plain LLM gave the same answer on all 3 runs in only **58 of 97 cases (59.8%)**, from cached earlier runs. Consistency for LLM + docs and the hybrid was not measured.

Chart images (`quality_metrics`, `cost_latency`, `per_category`) are not included in this repository copy.

---

## 5. Read the KG's 100% correctly

The ground truth was produced from the same expert tree the KG encodes, so the KG wins on these cases **by construction**. Its 100% is a fidelity check: the graph agrees on every case with a separately written oracle of the same tree, so the tree was captured faithfully. The oracle is implementation-independent but policy-shared (Section 2.3). It is **not** evidence that a KG is more intelligent than an LLM.

What the KG run does show:

1. **Traceable paths.** Every decision carries the exact path through the rules. This PoC shows traceable decision paths. It is not regulatory validation, and it does not show that any lending-compliance requirement is met.
2. **Determinism.** Same input, same output, every time.
3. **Escalation on this set.** 0% overreach on the 31 must-escalate cases: missing, invalid or out-of-range input became ESCALATE with a stated reason. No calibration metric was measured. Instructions planted in a notes field had no effect, because the reasoner never reads free text.
4. **No model call at decision time.** ~0.008 ms median and $0 billed in this run.

---

## 6. Findings

### 6.1 The no-policy control mostly escalates.

The plain LLM is a control: it shows what the model does without the expert's rules. Its low accuracy is mostly caution, not recklessness. In the cached responses, it answered ESCALATE on 88 of the 108 cases that had a definite answer. That is also why its overreach looks good (6.5%): escalating nearly everything means it rarely decides when it shouldn't. Without the policy, the model is cautious and rarely useful on this set. The expert's rules are what make it useful.

The plain-LLM answer chart is not included in this repository copy.

### 6.2 Expert docs lift accuracy, at the highest cost.

Pasting the skill file into the prompt lifts accuracy from 30.2% to 97.1%. The price is about 6,000 tokens per call, a 16.8 s median and $2.29 for 139 decisions. It named a valid tree node 90.6% of the time. Whether that node was the right one was not checked. Its 4 misses are in Section 6.4.

### 6.3 The hybrid reached the same accuracy on this set at lower cost, with a path on every decision.

*As tested, the application was rendered as free-text notes for the parser. Emails and PDFs are the intended use, not something this benchmark measured.*

On this set, the hybrid and LLM + docs both scored 97.1% decision accuracy in one run per case. The hybrid did it at **$0.36 vs. $2.29** (about 16%), **2.5 s vs. 16.8 s** median latency, and **1,644 vs. 6,029** tokens per call. Every hybrid decision has a reasoner path, because the KG makes it. The same score on one sample of 139 is not evidence that the two setups are equivalent in general, and their misses are on different cases (Section 6.4).

### 6.4 Why the two 97.1% setups missed

Both setups missed 4 of 139 cases. Every miss is a must-escalate case, which is why both show 12.9% overreach (4 of 31). The per-case outputs come from the scored run's response cache, which is not published. The case ids below come from matching that write-up to the published [`cases.json`](../../benchmarks/2026-10-credit-risk/cases.json). They are consistent with the totals in `results.json`.

| Case ids | Input | Label | Hybrid | LLM + docs |
|---|---|---|---|---|
| 125, 133 (adversarial) | `credit_score` sent as the string `"800"` | ESCALATE (bad type) | approved (miss) | escalated (correct) |
| 130, 138 (adversarial) | `self_employed` sent as the string `"yes"` | ESCALATE (bad type) | approved (miss) | approved (miss) |
| 102, 111 (out of scope) | `income_annual` = 0 | ESCALATE (DTI undefined) | escalated (correct) | denied (miss) |

**Hybrid: type normalization.** All four hybrid misses, all four of its overreach cases, and all four of its adversarial misses (75.0%, 12 of 16) are the bad-type cases. The LLM parser helpfully turned `"800"` into a number and `"yes"` into a boolean. The KG never saw the bad type, so its schema guard never fired, and the tree approved. The decision logic worked as written. The failure is at the input boundary.

**LLM + docs: the same theme plus one label question.** It also approved on `self_employed: "yes"` (both of its adversarial misses, 87.5%, 14 of 16). Its other two misses denied zero-income applications instead of escalating. The skill's schema allows `income_annual` minimum 0, and on the tree as written a zero income makes debt-to-income unbounded, which leads to a DTI denial. The "escalate at zero income" rule comes from the harness: the oracle and `kg.py` both add it. Those two misses are partly a harness labeling choice, not only a model error.

**Design fix, not yet measured.** Validate raw input types before the parser runs, or have the parser report type mismatches instead of fixing them. That is [issue #10](https://github.com/goker/SMETP-Subject-Matter-Expertise-Transfer-Protocol/issues/10). We expect it to remove the hybrid's four misses. That expectation has not been re-measured, and no new scores are reported here.

### 6.5 Hypotheses: where LLMs may still help (not measured)

These come from the design of the system. This benchmark did not test them.

- **Messy input** (emails, PDFs, call notes). The KG needs structured fields. The hybrid's parser saw tidy renderings of structured fields, not real documents.
- **Coverage beyond the rules.** New situations, and the soft heuristics (income trajectory, medical debt, divorce) that the tree never encoded.
- **Explaining a decision** to a customer in plain language.

The product stance is still the hybrid: the LLM reads, the KG decides with a rule path, and anything the rules don't cover goes to a human. The first item is a hypothesis to test, not a finding.

---

## 7. Encoding the expertise found bugs in the expert's own example

The single most useful outcome. Turning prose into a graph forced every rule to be explicit, and the validator ([`kg_validation.txt`](../../benchmarks/2026-10-credit-risk/kg_validation.txt)) flagged problems that pasting the prose into a prompt does not surface on its own:

1. **2 of the 5 published test cases contradict the decision tree.**
   - "Recent bankruptcy (8 years) with recovery", score 700: the doc expects CONDITIONAL / SUBPRIME. The tree gives APPROVE / STANDARD.
   - "Self-employed with growing income", 3 years: the doc expects CONDITIONAL. The tree gives APPROVE.
2. **Bankruptcy gap at scores of 650+.** `check_recent_bankruptcy` only sits under the 600–649 branch. An applicant at 650 or above with a bankruptcy one year ago is approved without that check (this write-up cites benchmark adversarial cases 128/136; the shorter proof notes call the same gap adversarial case 5).
3. **Two fields missing from the schema.** The tree tests `has_2yr_tax_returns` and `tax_return_trend`, but neither is declared in `inputs`.
4. **Reason text that doesn't match the logic.** `deny_credit_seeking` says ">3 inquiries" but fires at >1. `deny_high_dti` says "43%" but is also reached from the 35% post-bankruptcy DTI check.
5. **Missing confidence.** Every DENY and ESCALATE outcome (6 of them) has no confidence value.
6. **Prose-only expertise.** The 5 heuristics and 6 edge cases aren't wired into the tree, so the KG doesn't apply them.

The benchmark set also documents one policy behavior worth a second look: an applicant with a 780 score, an 80% debt-to-income ratio, zero savings and 5 recent inquiries is approved at PRIME, because the tree checks nothing after the score for prime applicants.

The lesson: **a formal knowledge graph makes expert knowledge testable.** Gaps and contradictions show up before an AI system acts on them.

These items are tracked as GitHub issues labeled `example-bug`. The finance JSON was not silently edited, so this report still describes the file in the repo.

---

## 8. Limitations

- **The KG's 100% is by construction.** Ground truth comes from an oracle of the same expert tree. It shows faithful capture, not superior intelligence.
- **Policy-shared oracle.** The oracle is a separate implementation, but it encodes the same tree and was written by the same authors. No second-author oracle, divergence log or path coverage.
- **Synthetic data, one domain.** 139 generated credit-risk cases. No real historical decisions by a real expert. The example expert is fictional.
- **One run per case** for every LLM system. Small differences between systems (for example, 87.5% vs. 75% adversarial accuracy, which is 14 vs. 12 cases) are not statistically decisive. No confidence intervals are reported. Consistency was measured only for the plain LLM, on 97 cases, from cached earlier runs.
- **Small slices.** The adversarial set is 16 cases, made of 8 scenarios that each appear twice. With the response cache on, the two copies of a scenario can share one LLM response. Doc conflict is 3 cases.
- **Citation is presence, not correctness.** No check that a cited node is the right one.
- **One-sided escalation metric.** Overreach counts missed escalations on the 31 must-escalate cases. Unneeded escalations on decidable cases show up only as accuracy loss.
- **Not regulatory validation.** Traceable paths are not a lending-compliance assessment or a model-risk validation.
- **The tree is treated as authoritative** where the docs disagree. Some "correct" answers are faithful to a flawed tree (for example, approving the 655-score applicant with a recent bankruptcy), so adversarial accuracy partly measures fidelity to the tree, gaps included.
- **One model.** Only grok-4.7 at temperature 0.7. Other models and settings may differ.
- **Lightweight KG.** Plain Python triples plus a tree walker, not full OWL/RDF reasoning. Heuristics and edge cases aren't encoded.
- **Not a production system.** No privacy, consent or PII handling was tested.
- **Partial reproducibility.** The harness, cases, prompts and scored results are published. The graph results reproduce offline. The xAI response cache is not published, so the plain-LLM consistency figure and per-case LLM outputs cannot be checked from the repo, and a new LLM run is a new measurement.

---

## 9. Roadmap: top 5 improvements

From the October 15, 2026 evaluation of the public repo, in priority order:

1. **Publish the code.** Push the reference packages (spec, runtime, CLI, SDK) to the repo and npm, or remove package claims from the site until they exist. This is the biggest credibility risk today. **Status when this report was added to the public repo:** those packages are not on npm, this repo has no `packages/` tree, and the README says so. The notes in `docs/reference-implementation/` are a handoff plan, not a release.
2. **Write a normative spec plus a JSON Schema** for the skill file (frontmatter, decision nodes, citations, confidence, validation block), with a conformance test suite and a `smetp validate` command. The validator in this benchmark is a starting point. Not shipped.
3. **Compile to an Agent Skills `SKILL.md` and ship one real MCP server** wrapping a reasoner. A hand-written credit-risk draft is at `examples/credit-risk/SKILL.md`, labeled example-only. It is not a drop-in adapter for any host. An MCP server with `decide` / `explain` / `validate` is not shipped. Host-specific exporters are not shipped.
4. **Replace marketing accuracy numbers with this reproducible benchmark.** This file is that write-up. **Status:** the harness, the synthetic dataset and the scored results are published in [`benchmarks/2026-10-credit-risk/`](../../benchmarks/2026-10-credit-risk/README.md) with SHA-256 hashes ([issue #11](https://github.com/goker/SMETP-Subject-Matter-Expertise-Transfer-Protocol/issues/11)). Healthcare and legal benchmarks are not done.
5. **Add a privacy and consent model.** Expert consent capture, retention and deletion of audio, PII/PHI redaction before extraction, a local or bring-your-own-key mode, and a SECURITY.md.

Benchmark-specific next steps (none of these have been run): fix the hybrid's raw-type guard ([#10](https://github.com/goker/SMETP-Subject-Matter-Expertise-Transfer-Protocol/issues/10)) and re-run; re-run every LLM setup at 5 runs per case on the same model to measure consistency for all of them; add confidence intervals; fix the issues in Section 7 and re-validate; encode the heuristics and edge cases; and add the healthcare and legal examples as second and third domains.

---

## 10. How to reproduce

The frozen harness is in [`benchmarks/2026-10-credit-risk/`](../../benchmarks/2026-10-credit-risk/README.md): `kg.py`, `gen_cases.py`, `bench.py`, `cons.py`, `cases.json`, `results.json` and `kg_validation.txt`, byte-identical to the 2026-10-15 proof folder, with SHA-256 hashes. Its README has the full instructions. Python standard library only.

```bash
git clone https://github.com/goker/SMETP-Subject-Matter-Expertise-Transfer-Protocol
cd SMETP-Subject-Matter-Expertise-Transfer-Protocol
(cd benchmarks/2026-10-credit-risk && sha256sum -c SHA256SUMS)

# bench.py and gen_cases.py write into the current folder, so use a scratch copy
cp -rL benchmarks/2026-10-credit-risk /tmp/smetp-bench && cd /tmp/smetp-bench

python3 kg.py | diff - kg_validation.txt   # 116 triples, validator issues, the 5 published test cases
python3 gen_cases.py                       # regenerates cases.json (seed 42), same hash

# KG only, no API key, nothing billed:
env -u OPENAI_API_KEY -u XAI_API_KEY -u ANTHROPIC_API_KEY RUNS=1 python3 bench.py

# LLM setups (billed). bench.py's default model ids are older, so set the model:
export XAI_API_KEY=...
LLM_MODEL=grok-4.7 RUNS=1 python3 bench.py
```

Notes:

- From a fresh clone, the graph steps reproduce `kg_validation.txt`, `cases.json` and the KG row of `results.json` exactly, except median latency, which depends on the machine.
- `bench.py` also accepts `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` (with `LLM_MODEL`) for other models. A run on another model is a new study, not a reproduction.
- The xAI response cache (`llm_cache.jsonl`) is **not** published. A new LLM run makes new calls and is a new measurement. Set `RUNS=5` to measure consistency (roughly 5x the cost).
- Cost is read from xAI's billed `cost_in_usd_ticks`. Other providers need `PRICE_IN_PER_M` and `PRICE_OUT_PER_M`.
- Per-category figures and the plain-LLM answer breakdown in this report were re-derived from the response cache. For the plain LLM the cache gives 44/139 correct versus 42/139 in the scored run, because duplicated adversarial prompts share one cache entry. Headline numbers come from the scored run (`results.json`).

---

*SMETP is open and MIT-licensed. Built by Göker Ezberci. Augment, don't replace.*
