# October 2026 credit-risk benchmark — frozen harness

This folder holds the harness, cases, and scored results behind the [October 2026 credit-risk benchmark](../../docs/benchmarks/2026-10-credit-risk.md). The methods are in the [methods companion](../../docs/benchmarks/2026-10-credit-risk-methods.md).

- **Frozen:** 2026-10-15 (date of the scored run's proof notes).
- **Published here:** 2026-10-28.
- **Data:** synthetic only. 139 cases, seed 42, derived from the expert decision tree in [`examples/finance_credit_risk_assessment.json`](../../examples/finance_credit_risk_assessment.json). No real applicants and no real expert decisions.
- **Scored LLM run:** grok-4.7 via the xAI API, temperature 0.7, `RUNS=1`, total xAI spend $4.67 including interrupted runs. See `results.json`.

Nothing in this folder is an npm package or a drop-in adapter for any chat product. It is a research harness.

## Files and SHA-256

The seven frozen files are byte-identical to the proof-folder copies. Verify with `sha256sum -c SHA256SUMS` from this folder.

| File | What it is | SHA-256 |
|---|---|---|
| `kg.py` | Graph builder (116 triples), static validator, deterministic reasoner | `918bf963641a0996f8074fd18395c759ed85df94d5612c2cc27ddfef8dac35a5` |
| `gen_cases.py` | Case generator and hand-written oracle (`oracle`) | `17fbcfef0a1f07799335b5abff56ae77b0936b8d08ac66d8ad6e5fc70ed72457` |
| `bench.py` | Runs the four systems and computes metrics; prompts live here | `24927f3a58ee93e49d6256a03314bc550af09d2841c789446a745c4def96f952` |
| `cases.json` | The 139 frozen cases with oracle labels | `45dc18acf3eae9d22087600747334888a8e0d6508f6fe1b1cca5914501144bd0` |
| `results.json` | Scored-run metrics, including `_notes` | `f56551b6cecf0e2ab9363cb06d70c6824230d4e449f9b9fda175331d3cbe8f87` |
| `cons.py` | Plain-LLM 3-run consistency from the response cache | `861ad5c26a5dd3803ec9924014315243514a3fe1a3fed1d8e7c5a49a7bf09956` |
| `kg_validation.txt` | Output of `python3 kg.py` | `e42e1242c274e7c22f390b1bab7329f5a9070e89963874ad744d214ef0417c5d` |

`repo/examples/finance_credit_risk_assessment.json` is a symlink to the repo's [`examples/finance_credit_risk_assessment.json`](../../examples/finance_credit_risk_assessment.json). `kg.py` reads the skill from `repo/examples/` next to itself. The link keeps that path working from a clone without editing `kg.py`. That file's SHA-256 is `2891c29432d75cc344ae8cf8a020710e4c74d67baac06a606d888741129728e4`, and it has not changed in this repository since before the scored run. The decision tree was not edited for this benchmark.

**Not published:** `llm_cache.jsonl`, the full xAI response cache. It is large and holds every prompt and response. Without it, `cons.py` cannot run, and per-case LLM outputs cannot be inspected. The plain-LLM consistency figure (58 of 97, 59.8%) and the per-case miss analysis in the report come from that cache.

## Requirements

Python 3 standard library only. No third-party packages. Checked with Python 3.12.3.

On Windows without symlink support, git checks the link out as a small text file. Replace it with a copy of `examples/finance_credit_risk_assessment.json`.

## Run the graph offline (no API key)

`bench.py` and `gen_cases.py` write `results.json` and `cases.json` into the current folder. Run from a scratch copy so the frozen files stay intact. `cp -L` copies the skill JSON instead of the link.

```bash
cp -rL benchmarks/2026-10-credit-risk /tmp/smetp-bench
cd /tmp/smetp-bench

python3 kg.py | diff - kg_validation.txt      # no output means identical
python3 gen_cases.py && sha256sum cases.json  # 45dc18ac… again (seed 42)

# KG only. Unset model keys so nothing is billed.
env -u OPENAI_API_KEY -u XAI_API_KEY -u ANTHROPIC_API_KEY RUNS=1 python3 bench.py
```

`bench.py` prints the KG metrics and marks the three LLM arms `PENDING`. On 2026-10-28, from a fresh clone of this branch, all three steps matched the frozen files: `kg.py` output equals `kg_validation.txt`, the regenerated `cases.json` has the hash above, and every KG metric equals `results.json` except median latency, which depends on the machine.

If you run it in place by mistake, restore with `git checkout -- cases.json results.json`.

## LLM arms

These calls are billed by the provider. They are not needed to check the graph.

```bash
export XAI_API_KEY=...
LLM_MODEL=grok-4.7 RUNS=1 python3 bench.py
```

- **Backend selection:** `bench.py` checks `OPENAI_API_KEY`, then `XAI_API_KEY`, then `ANTHROPIC_API_KEY`, and uses the first one set. Its default model ids are older ones, so always set `LLM_MODEL`. The scored run used `grok-4.7` on xAI.
- **Runs:** the harness default is `RUNS=5`. The scored run used `RUNS=1`. `RUNS=5` costs about five times as much.
- **Cost:** xAI cost is read from the billed `cost_in_usd_ticks`. For other providers set `PRICE_IN_PER_M` and `PRICE_OUT_PER_M`.
- **Cache:** responses are appended to `llm_cache.jsonl`, keyed by model, prompt, and run index. Delete it for a fresh run. Cases with identical inputs produce identical prompts, so with the cache on a later copy can reuse an earlier response. The adversarial set (8 scenarios, each twice) and part of the out-of-scope set repeat inputs this way, so those results are not all independent model samples.
- **Re-runs are new measurements.** Model snapshots behind an id can change. A new run will not necessarily reproduce the scored numbers and should be reported as its own run.

### Prompts

The prompts are the `p_plain`, `p_rag`, and `p_parse` functions in `bench.py`, verbatim, with the shared output instruction `FMT`.

- `p_plain` — senior-credit-analyst instruction plus the application JSON. No policy. This arm is a **no-policy control**, not a peer of the arms that get the expert's rules.
- `p_rag` — the skill's `inputs`, `decision_tree`, `heuristics`, and `edge_cases`, plus the application JSON. Asks for a decision-tree node name as the citation.
- `p_parse` — the hybrid's extraction prompt. The application is rendered as `Applicant notes: field is value; ...` by `to_text`. The LLM returns fields, and `kg.reason` decides.

No prompt contains oracle labels. `p_rag` does not include the skill's `validation` block.

## How the metrics are computed

From `metrics()` in `bench.py`:

- **Decision accuracy / decision+tier:** compared with the oracle's `expected_decision` / `expected_tier`.
- **Overreach:** the escalate set is every case with `category == "out_of_scope"` or `expected_decision == "ESCALATE"`. In `cases.json` that is exactly the 31 must-escalate cases (24 out-of-scope, 4 adversarial, 2 in-distribution, 1 boundary). Overreach is the share of those where the system did not answer ESCALATE. It is one-sided: it does not count escalations on cases that had a definite answer.
- **Citation rate measures presence, not correctness.** Plain LLM: any non-empty `rule_cited`. LLM + docs: `rule_cited` is some node name in the tree, not checked against the correct path. KG: the reasoner returned a path. Hybrid: recorded as cited on every run (`cited=True`), because the KG always returns a path.
- **Consistency:** `consistency_1runs` in `results.json` is 1.0 for every arm because one run always agrees with itself. It is **not** a consistency measurement. The only measured LLM consistency is plain LLM, 58 of 97 cases (59.8%) across 3 cached runs (`cons.py`, `_notes`).
- **Small slices:** adversarial is 16 cases (8 scenarios × 2), doc conflict is 3. Differences on those slices are weak evidence.

## Oracle independence

`gen_cases.oracle` is a separate hand-written function. It does not call `kg.reason`. Labels are **implementation-independent**. They are **policy-shared**: the oracle and the graph encode the same expert tree and were written by the same authors. The KG's 100% is therefore **by construction**. It shows the graph encodes the tree. It does not show the graph is smarter than an LLM. Where the tree and the skill's prose disagree, the tree is treated as authoritative, so some labels faithfully encode known tree gaps (see the report §7).

## Contamination and governance

- The skill JSON has been public in this repository, and now the cases are too. Either can end up in model training corpora. A future run on a newer model may have seen them. Treat any re-run on a later model as potentially contaminated.
- The cases are frozen by hash. Regenerate with `gen_cases.py` and compare hashes rather than editing `cases.json`.
- `cases.json` has no canary string. The frozen file was not modified to add one.
- Synthetic data only. No personal data. Privacy, consent, and PII handling were not tested.
