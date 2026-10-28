# Examples

Three worked JSON examples of the SMETP method:

| File | Domain |
| --- | --- |
| [`finance_credit_risk_assessment.json`](finance_credit_risk_assessment.json) | Consumer credit risk (fictional expert) |
| [`healthcare_differential_diagnosis.json`](healthcare_differential_diagnosis.json) | Differential diagnosis |
| [`legal_contract_risk_assessment.json`](legal_contract_risk_assessment.json) | Contract risk |

[`credit-risk/SKILL.md`](credit-risk/SKILL.md) is a **draft / example-only** compile of the finance JSON into an Agent Skills shape. It is not a published adapter and it does not run in Claude, ChatGPT, Gemini, or MCP by itself.

## Do not cite the accuracy fields inside the JSON

Each example has a `validation` block, and some have a `benchmarking` block, carried over from earlier drafts. Those figures are **not** measurements. The proof notes for the October 2026 run say the historical accuracy lines have no dataset behind them.

The only published numbers are the synthetic credit-risk benchmark:

[docs/benchmarks/2026-10-credit-risk.md](../docs/benchmarks/2026-10-credit-risk.md)

That run used `finance_credit_risk_assessment.json` as the skill file. The decision tree and the five published test cases were left as-is so the report still matches the file. Where a test case disagrees with the tree, the tree was treated as authoritative and the disagreement is an `example-bug` issue — not a quiet edit.

Known finance mismatches (see Issues):

- 2 of 5 published test cases contradict the tree
- `check_recent_bankruptcy` only runs when the score is under 650
- `has_2yr_tax_returns` and `tax_return_trend` are tested but not declared in `inputs`
- Some DENY reason strings do not match the condition that fires
- DENY and ESCALATE outcomes omit confidence
- Heuristics and edge cases are prose; the tree does not execute them
