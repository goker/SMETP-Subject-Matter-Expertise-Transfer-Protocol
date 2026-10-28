# SMETP Benchmark Report

## Captured expert judgment as a knowledge graph vs. LLMs on 139 credit-risk decisions

**Author:** Göker Ezberci · **Date:** October 16, 2026 · **Project:** SMETP (Subject Matter Expertise Transfer Protocol), open and MIT-licensed
**Repo:** https://github.com/goker/SMETP-Subject-Matter-Expertise-Transfer-Protocol

*Augment, don't replace.*

> **In-repo copy (October 2026).** Headline numbers were cross-checked against the proof notes dated 2026-10-15. Decision accuracy, decision+tier, overreach, adversarial accuracy, citation rate, median latency, per-setup cost, total spend ($4.67), and plain-LLM consistency (59.8%, 58 of 97) match. The proof table prints graph latency as `0.008 ms`; this write-up keeps `~0.008 ms`. Token counts appear in this write-up only. The proof notes end with a line that LLM baselines had not been run; that line disagrees with the scored-run table in the same notes and with this report. Headline numbers below are the scored run.
>
> Chart PNGs from the working folder are not in this repository.
>
> This file does not claim npm packages or drop-in model adapters. Those are roadmap items, and they are not in the public repo.

---

## 1. Summary

SMETP is a method for interviewing a subject-matter expert, pulling out their decision logic, thresholds, edge cases and confidence, and writing it down in a structured, testable form. This report tests one question: **if you encode an expert's judgment as a knowledge graph (KG), what do you gain over asking an LLM?**

We took the credit-risk skill published in the SMETP repo, compiled its decision tree into a 116-triple knowledge graph with a deterministic reasoner, and ran it against three LLM-based setups on 139 synthetic loan applications using grok-4.7.

Five findings:

1. **An LLM without the expert's rules gets 30.2% of decisions right.** It is mostly cautious, not reckless: it escalates most cases it can't ground in a policy.
2. **Giving the LLM the expert's documents gets it to 97.1%**, but it costs the most ($2.29 for 139 decisions), is the slowest (16.8 s median), and cites a valid rule 90.6% of the time.
3. **The hybrid (LLM reads the input, KG makes the decision) matches that 97.1% at about a sixth of the cost ($0.36) and 2.5 s median latency, with a rule citation on 100% of decisions.** Its four misses share one fixable cause (Section 6.3).
4. **The KG alone scores 100%, but by construction.** The ground truth comes from the same rules. That number shows the graph captured the expert's tree faithfully. It does not show the graph is smarter than an LLM.
5. **Encoding the expertise found bugs in the expert's own published example**: 2 of its 5 test cases contradict its decision tree, there is a bankruptcy check that never runs at credit scores of 650+, two fields are missing from the schema, and some reason text doesn't match the logic.

The defensible pitch is not "a KG beats an LLM". It is: **formalizing expert judgment makes it testable, traceable and cheap to run, and the hybrid gives you auditable decisions without giving up the LLM's ability to read messy input.**

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

`kg.py` is not in this public repository yet. See Section 9 and Section 10.

### 2.3 Test set (`gen_cases.py`, `cases.json`)

139 synthetic cases, fixed random seed 42, derived only from the expert's decision tree:

| Category | Cases | What it tests |
|---|---|---|
| In-distribution | 80 | Ordinary applications the tree covers |
| Boundary | 16 | Values right at the thresholds |
| Doc conflict | 3 | Cases where the repo's docs and tree disagree (the tree is treated as authoritative) |
| Out of scope | 24 | Missing, invalid or out-of-range inputs that must escalate |
| Adversarial | 16 | Prompt injection in a notes field, numbers sent as strings, social pressure, one point under a cutoff, a heuristic the tree doesn't cover (8 scenarios, each appearing twice) |

Expected decisions: 42 APPROVE, 30 CONDITIONAL, 36 DENY, 31 ESCALATE. Ground truth comes from a **separate hand-written oracle**, not from the graph walker, so the KG is checked against an independent reading of the same tree.

### 2.4 Systems compared (`bench.py`)

| System | How it decides |
|---|---|
| **Plain LLM** | "You are a senior credit analyst" plus the application JSON. No policy. |
| **LLM + expert docs** | The expert's inputs, decision tree, heuristics and edge cases pasted into the prompt (RAG-style), plus the application. Must cite a decision-tree node. |
| **KG only** | The deterministic reasoner over the SMETP graph. No model call. |
| **Hybrid** | The LLM turns the application (rendered as free-text notes) into structured fields, told to omit anything not stated and never guess. The KG makes the decision. |

All LLM systems ask for JSON with a decision, tier, confidence and the rule cited, and are told to ESCALATE when information is missing, invalid or out of scope.

### 2.5 Metrics

- **Decision accuracy**: decision matches the expected decision. **Decision + tier**: tier matches too.
- **Overreach**: share of the 31 must-escalate cases where the system made a decision instead of escalating. Lower is better.
- **Adversarial accuracy**: accuracy on the 16 adversarial cases.
- **Citation rate**: Plain LLM, any rule named. LLM + docs, a valid node name from the tree. KG and hybrid, the reasoner's path.
- **Consistency**: same decision and tier across repeated runs.
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
| KG only (SMETP graph) | **100%** | 100% | **0%** | **100%** | **100%** | ~0.008 ms | 0 | $0 |
| Plain LLM | 30.2% | 28.8% | 6.5% | 31.3% | 3.6% | 8.7 s | 2,266 | $0.87 |
| LLM + expert docs | 97.1% | 97.1% | 12.9% | 87.5% | 90.6% | 16.8 s | 6,029 | $2.29 |
| **Hybrid (LLM parses, KG decides)** | **97.1%** | 97.1% | 12.9% | 75.0% | **100%** | **2.5 s** | 1,644 | **$0.36** |

**Consistency:** the KG is deterministic. The plain LLM gave the same answer on all 3 runs in only **58 of 97 cases (59.8%)**. Consistency for LLM + docs and the hybrid was not measured.

Chart images (`quality_metrics`, `cost_latency`, `per_category`) are not included in this repository copy.

---

## 5. Read the KG's 100% correctly

The ground truth was produced from the same rules the KG encodes, so the KG wins on these cases **by construction**. Its 100% is a fidelity check: the graph agrees with an independent oracle on every case, so the expert's tree was captured faithfully. It is **not** evidence that a KG is more intelligent than an LLM.

What the KG does show, and what an auditor cares about:

1. **Traceability.** Every decision carries the exact path through the rules. That is the kind of record FCRA and ECOA reviews ask for.
2. **Consistency.** Same input, same output, every time.
3. **Calibrated escalation.** Missing, invalid or uncovered input becomes ESCALATE with a stated reason instead of a confident guess. Instructions planted in a notes field have no effect, because the reasoner never reads free text.
4. **Near-zero marginal cost and latency.**

---

## 6. Findings

### 6.1 Without the rules, the LLM doesn't guess. It escalates.

The plain LLM's low accuracy is mostly caution, not recklessness. In the cached responses, it answered ESCALATE on 88 of the 108 cases that had a definite answer. That is also why its overreach looks good (6.5%): escalating nearly everything means it rarely decides when it shouldn't. A policy-free LLM is safe-ish and almost useless. The expert's knowledge is what makes it useful.

The plain-LLM answer chart is not included in this repository copy.

### 6.2 Expert docs fix accuracy but cost the most.

Pasting the skill file into the prompt lifts accuracy from 30.2% to 97.1%. The price is about 6,000 tokens per call, a 16.8 s median and $2.29 for 139 decisions. Citations are good (90.6%) but not guaranteed, because the model writes them. Its 4 misses: two zero-income applications it denied instead of escalating, and two where `self_employed` arrived as the string "yes" and it approved.

### 6.3 The hybrid keeps the accuracy, cuts cost to about a sixth, and always cites.

*As tested, the application was rendered as free-text notes for the parser. Emails and PDFs are the intended use, not something this benchmark measured.*

The hybrid matches LLM + docs on decision accuracy (97.1%) at **$0.36 vs. $2.29** (about 16%), **2.5 s vs. 16.8 s** median latency, and **1,644 vs. 6,029** tokens per call. Every decision has a rule path, because the KG makes it.

All four hybrid misses (and all four of its overreach cases) have the same cause. The adversarial set sends `credit_score` as the string "800" and `self_employed` as the string "yes". The ground truth says escalate on the bad type. The LLM parser helpfully normalized them to a number and a boolean, so the KG never saw the bad type and approved. That is a design fix, not a capability limit: **validate raw input types before the parser runs**, or have the parser report type mismatches instead of fixing them. Re-running after that fix is the first item on the benchmark roadmap.

### 6.4 Where LLMs still win

- **Messy input** (emails, PDFs, call notes). The KG needs structured fields.
- **Coverage beyond the rules.** New situations, and the soft heuristics (income trajectory, medical debt, divorce) that the tree never encoded.
- **Explaining a decision** to a customer in plain language.

So the realistic product is the hybrid: the LLM reads, the KG decides with a citation, and anything unknown goes to a human.

---

## 7. Encoding the expertise found bugs in the expert's own example

The single most useful outcome. Turning prose into a graph forced every rule to be explicit, and the validator (`kg_validation.txt`) flagged problems that a prompt-stuffing approach would quietly paper over:

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

- **The KG's 100% is by construction.** Ground truth comes from the same rules. It shows faithful capture, not superior intelligence.
- **Synthetic data, one domain.** 139 generated credit-risk cases. No real historical decisions by a real expert. The example expert is fictional.
- **One run per case** for every LLM system. Small differences between systems (for example, 87.5% vs. 75% adversarial accuracy, which is 14 vs. 12 cases) are within noise. Consistency was measured only for the plain LLM, on 97 cases.
- **Small adversarial set.** 16 cases, made of 8 scenarios that each appear twice.
- **The tree is treated as authoritative** where the docs disagree. Some "correct" answers are faithful to a flawed tree (for example, approving the 655-score applicant with a recent bankruptcy), so adversarial accuracy partly measures fidelity to the tree, gaps included.
- **One model.** Only grok-4.7 at temperature 0.7. Other models and settings may differ.
- **Lightweight KG.** Plain Python triples plus a tree walker, not full OWL/RDF reasoning. Heuristics and edge cases aren't encoded.
- **Not a production system.** No privacy, consent or PII handling was tested.
- **The harness isn't public yet.** `kg.py`, `gen_cases.py`, `bench.py` and `cases.json` are not in the public repo today.

---

## 9. Roadmap: top 5 improvements

From the October 15, 2026 evaluation of the public repo, in priority order:

1. **Publish the code.** Push the reference packages (spec, runtime, CLI, SDK) to the repo and npm, or remove package claims from the site until they exist. This is the biggest credibility risk today. **Status when this report was added to the public repo:** those packages are not on npm, this repo has no `packages/` tree, and the README says so. The notes in `docs/reference-implementation/` are a handoff plan, not a release.
2. **Write a normative spec plus a JSON Schema** for the skill file (frontmatter, decision nodes, citations, confidence, validation block), with a conformance test suite and a `smetp validate` command. The validator in this benchmark is a starting point. Not shipped.
3. **Compile to an Agent Skills `SKILL.md` and ship one real MCP server** wrapping a reasoner. A hand-written credit-risk draft is at `examples/credit-risk/SKILL.md`, labeled example-only. It is not a drop-in adapter for any host. An MCP server with `decide` / `explain` / `validate` is not shipped. Host-specific exporters are not shipped.
4. **Replace marketing accuracy numbers with this reproducible benchmark.** This file is that write-up. The synthetic dataset and the scripted eval are not public yet. Publish `benchmarks/` (`kg.py`, `gen_cases.py`, `bench.py`, `cases.json`). Healthcare and legal benchmarks are not done.
5. **Add a privacy and consent model.** Expert consent capture, retention and deletion of audio, PII/PHI redaction before extraction, a local or bring-your-own-key mode, and a SECURITY.md.

Benchmark-specific next steps: fix the hybrid's raw-type guard and re-run, run 5 times per case to measure consistency for every system, fix the issues in Section 7 and re-validate, encode the heuristics and edge cases, and add the healthcare and legal examples as second and third domains.

---

## 10. How to reproduce

The harness is **not in this repository**. The files lived in a local proof folder when this report was written (`kg.py`, `gen_cases.py`, `bench.py`, `cases.json`, next to a clone of the repo). Publishing them is a roadmap item. The commands below describe that working folder. They will not run from a fresh clone of this repo today.

```bash
git clone https://github.com/goker/SMETP-Subject-Matter-Expertise-Transfer-Protocol repo
# kg.py, gen_cases.py, bench.py sit next to repo/  (not published yet)

python3 kg.py          # builds the graph, prints 116 triples, validator issues and the 5 published test cases
python3 gen_cases.py   # regenerates cases.json (seed 42)

# KG only, no API key needed:
RUNS=1 python3 bench.py

# All four systems (xAI). bench.py defaults to grok-3-mini, so set the model:
export XAI_API_KEY=...
LLM_MODEL=grok-4.7 RUNS=1 python3 bench.py   # writes results.json
```

Notes from the working folder:

- `bench.py` also accepts `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` (with `LLM_MODEL`) for other models.
- Responses are cached in `llm_cache.jsonl`. Delete it for a fresh run. Set `RUNS=5` to measure consistency (roughly 5x the cost).
- Cost is read from xAI's billed `cost_in_usd_ticks`. Other providers need `PRICE_IN_PER_M` and `PRICE_OUT_PER_M`.
- Per-category figures and the plain-LLM answer breakdown in this report were re-derived from the response cache. For the plain LLM the cache gives 44/139 correct versus 42/139 in the scored run, because duplicated adversarial prompts share one cache entry. Headline numbers come from the scored run (`results.json`).

---

*SMETP is open and MIT-licensed. Built by Göker Ezberci. Augment, don't replace.*
