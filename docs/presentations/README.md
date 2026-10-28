# Presentations

## SMETP campaign deck (October 2026)

- **PDF (public copy):** [`smetp-campaign.pdf`](./smetp-campaign.pdf) — 19 slides, exported from Google Slides. SHA-256 `3f406b53f8040e5d4b19ddae3d9d562013aef5572e39956f0a76a266bf19299a`.
- **Live deck:** [Pitch deck (Google Slides)](https://docs.google.com/presentation/d/1f7bCEAktVLKlUVZo5MYdazvQvN-8L3me0Zp4V01mn_Q/edit). It may ask you to sign in until its sharing is set to "anyone with the link can view". The PDF is the public copy.

This is a pitch deck for a side project. It has not been presented at or published by any conference or journal.

Every figure in the deck comes from the [October 2026 synthetic credit-risk benchmark](../benchmarks/2026-10-credit-risk.md) (139 cases, grok-4.7, one run per case). The deck was exported before the harness was published and before the methodology review. Where the deck and the repo differ, the repo is current:

| Slide | Deck says | Current |
|---|---|---|
| 13, 19 | Benchmark harness is on the roadmap / not yet public | Published with SHA-256 hashes in [`benchmarks/2026-10-credit-risk/`](../../benchmarks/2026-10-credit-risk/README.md). The graph reproduces offline from a clone. |
| 6 | "Hybrid: same accuracy, a sixth of the cost" | Both setups scored 97.1% in one run per case, with different misses. That is one sample, not shown equivalence ([report §6.3–6.4](../benchmarks/2026-10-credit-risk.md#63-the-hybrid-reached-the-same-accuracy-on-this-set-at-lower-cost-with-a-path-on-every-decision)). |
| 8 | "Agreement with an independent oracle" | The oracle is implementation-independent but policy-shared: same expert tree, same authors ([methods §3](../benchmarks/2026-10-credit-risk-methods.md#3-dataset-construction)). |
| 6, 15, 18 | Rule citation 100% | Citation counts whether a rule was named, not whether it was the right one. The hybrid's 100% is recorded because the graph always returns a path. |
| 5 | Plain LLM | A no-policy control, not a competitor to setups given the expert's rules. |
| 16 | "Open an issue or Discussion" | GitHub Discussions are not enabled yet. Use Issues. |
| — | (not in deck) | Three-LLM [methodology review](../benchmarks/methodology-review.md): majority verdict "partially". Not regulated credit-model validation. |

The deck makes no claim of npm packages, drop-in chat-product adapters, or accuracy figures from before this benchmark. Slide 15 says so directly.
