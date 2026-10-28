---
name: credit-risk-assessment
description: >-
  Draft Agent Skills compile of the SMETP finance credit-risk example.
  Evaluate loan applicant creditworthiness (APPROVE / CONDITIONAL / DENY / ESCALATE)
  with tier and rule citations. EXAMPLE ONLY — not a published adapter or npm package.
license: MIT
metadata:
  smetp_source: examples/finance_credit_risk_assessment.json
  smetp_status: draft_example
  smetp_domain: finance
  sme_role: Senior Credit Analyst
  caveat: >-
    Not a drop-in Claude/ChatGPT/Gemini adapter. Compiles method JSON into SKILL.md shape
    for distribution research. Prefer hybrid (LLM parses, rules decide) in product messaging.
---

# Credit Risk Assessment (SMETP draft example)

> **Label: DRAFT / EXAMPLE ONLY.**
> Compiled by hand from the public SMETP finance JSON example for distribution research
> (“compile to Agent Skills `SKILL.md`”). **Not** a published npm package, **not** a
> shipping Claude/ChatGPT/Gemini/MCP adapter, **not** a claim of production readiness.
> Source skill metadata: Credit Risk Assessment v1.0.0 (2025-01-15).

## When to use

Use this skill when deciding consumer/loan creditworthiness from **structured** applicant
features and you need a **citable rule path** plus calibrated **ESCALATE** for out-of-scope
inputs. For messy PDFs/emails, parse fields first (hybrid), then apply the tree.

## Inputs

- `credit_score` (number, required, range [300, 850]): FICO credit score
- `income_annual` (number, required, min 0): Annual gross income in USD
- `debt_monthly` (number, required, min 0): Total monthly debt payments in USD
- `employment_years` (number, required, min 0): Years employed in current position
- `savings_months` (number, required, min 0): Months of emergency savings (e.g., 3 = 3 months expenses saved)
- `recent_inquiries` (number, required, min 0): Hard inquiries in past 6 months
- `bankruptcy_years_ago` (number, optional, min 0): Years since bankruptcy discharge (null if no bankruptcy)
- `self_employed` (boolean, optional): Whether applicant is self-employed

**Also referenced by the tree but undeclared in the published inputs schema** (known PoC finding):
`has_2yr_tax_returns` (boolean), `tax_return_trend` (string). Treat missing values as escalate-worthy
when those branches are reached.

Derived: `debt_to_income = debt_monthly / (income_annual / 12)` (undefined / escalate if income ≤ 0).

## Outputs

- `decision`: one of `APPROVE, CONDITIONAL, DENY, ESCALATE`
- `tier`: one of `PRIME, STANDARD, SUBPRIME` or null
- `confidence`: 0–1 when the outcome node defines it (DENY/ESCALATE nodes often omit it — known gap)
- `cited_rules` / path: decision-tree node names traversed

## Decision tree (checks)

- `root`: `credit_score >= 750` → yes `approve_prime` / no `check_standard_tier`
- `check_standard_tier`: `credit_score >= 650` → yes `check_dti` / no `check_subprime`
- `check_dti`: `debt_to_income <= 0.43` → yes `check_employment` / no `deny_high_dti`
- `check_employment`: `employment_years >= 2` → yes `check_inquiries` / no `check_self_employed`
- `check_inquiries`: `recent_inquiries <= 1` → yes `approve_standard` / no `conditional_high_inquiries`
- `check_self_employed`: `self_employed == true` → yes `check_self_employed_details` / no `escalate_short_employment`
- `check_self_employed_details`: `has_2yr_tax_returns == true` → yes `check_tax_return_growth` / no `deny_no_documentation`
- `check_tax_return_growth`: `tax_return_trend == 'growing'` → yes `conditional_self_employed_growth` / no `conditional_self_employed_stable`
- `check_subprime`: `credit_score >= 600` → yes `check_recent_bankruptcy` / no `deny_score_too_low`
- `check_recent_bankruptcy`: `bankruptcy_years_ago == null` → yes `check_subprime_inquiries` / no `check_bankruptcy_age`
- `check_subprime_inquiries`: `recent_inquiries <= 1` → yes `conditional_subprime_no_bankruptcy` / no `deny_credit_seeking`
- `check_bankruptcy_age`: `bankruptcy_years_ago >= 7` → yes `check_post_bankruptcy_dti` / no `deny_recent_bankruptcy`
- `check_post_bankruptcy_dti`: `debt_to_income <= 0.35` → yes `conditional_recovered_bankruptcy` / no `deny_high_dti`

## Outcomes

- `approve_prime`: **APPROVE** `PRIME` — Excellent credit history qualifies for best terms
- `approve_standard`: **APPROVE** `STANDARD` — Meets all standard criteria
- `conditional_high_inquiries`: **CONDITIONAL** `STANDARD` — High inquiry velocity suggests credit seeking behavior
- `conditional_self_employed_growth`: **CONDITIONAL** `STANDARD` — Self-employed with growing income shows viability
- `conditional_self_employed_stable`: **CONDITIONAL** `STANDARD` — Self-employed with stable (not growing) income requires extra scrutiny
- `escalate_short_employment`: **ESCALATE** — Employment < 2 years in current role requires manager review
- `conditional_subprime_no_bankruptcy`: **CONDITIONAL** `SUBPRIME` — Lower credit score but no recent bankruptcy and inquiry velocity OK
- `conditional_recovered_bankruptcy`: **CONDITIONAL** `SUBPRIME` — Past bankruptcy but demonstrated recovery with good metrics
- `deny_recent_bankruptcy`: **DENY** — Recent bankruptcy discharge (< 7 years) - Federal credit reporting rule
- `deny_high_dti`: **DENY** — Debt-to-income ratio exceeds maximum threshold of 43%
- `deny_score_too_low`: **DENY** — Credit score below minimum threshold of 600
- `deny_credit_seeking`: **DENY** — High inquiry velocity indicates credit-seeking behavior (>3 in 6 months)
- `deny_no_documentation`: **DENY** — Self-employed applicant did not provide required 2-year tax returns

## Prose heuristics (not executed by the PoC KG)

- **employment_stability_signal**: If employed >= 8 years in same role, increase confidence by 10%. If employed >= 15 years, add 15% (not cumulative). *(prose heuristic — not wired into the decision tree in the PoC KG)*
- **inquiry_velocity_desperation**: If 3+ hard inquiries in past 6 months, applicant likely desperate for credit. Reject unless strong compensating factors. *(prose heuristic — not wired into the decision tree in the PoC KG)*
- **savings_safety_net**: If savings >= 6 months, reduce risk by 10%. If savings >= 12 months, reduce risk by 15%. *(prose heuristic — not wired into the decision tree in the PoC KG)*
- **trajectory_player**: If applicant is young (age 25-35) AND income growing 30%+ YoY AND credit improving, approve at 80% confidence despite lower absolute score. *(prose heuristic — not wired into the decision tree in the PoC KG)*
- **medical_debt_less_predictive**: Medical debt counts as 50% toward DTI, not 100%. Medical hardship is temporary, recoverable. *(prose heuristic — not wired into the decision tree in the PoC KG)*

## Edge-case notes from the SME capture

- **Bankruptcy discharge (7+ years ago)**: Approvable if all other factors strong. Document recovery narrative. Rule sketch: IF years_since_bankruptcy >= 7 AND dti <= 0.35 AND employment >= 2 THEN CONDITIONAL with higher rate and cosigner
- **Self-employed with high income variance**: Use 2-year average of tax returns, not year-to-date or 1099s. Require business license and tax ID. Rule sketch: IF self_employed THEN use avg_of_2yr_tax_returns AND require_business_license AND require_tax_id
- **Recent job change (< 6 months)**: High risk unless (a) same industry, (b) promotion signal, or (c) very strong savings. Rule sketch: IF employment_years < 0.5 AND same_industry == false THEN DENY unless savings >= 12 months
- **Recent immigrant with no US credit history**: Request international credit reference if available. Check US bill payment history. Use ITIN if available. Rule sketch: IF no_us_credit_score THEN require_itin AND require_bill_payment_history AND request_international_reference
- **Co-applicant income (married vs dating)**: Married = more stable, keep co-applicant income. Dating = higher risk, use only if very stable. Rule sketch: IF co_applicant AND married THEN keep_income ELSE IF co_applicant AND dating THEN require_cohabit_3yr
- **Divorce or legal separation**: Verify divorce decree. Understand alimony/child support obligations. May significantly reduce available income. Rule sketch: IF recently_divorced THEN verify_decree AND subtract_alimony_obligation AND subtract_child_support

## Escalation / schema guards

Escalate (do not guess) when:

- A required input is missing, non-numeric/non-boolean as required, or outside declared min/max (e.g. FICO outside 300–850).
- Income is zero (DTI undefined).
- A branch needs an undeclared or missing field (e.g. tax-return fields for self-employed short tenure).

## Known doc ↔ tree issues (do not paper over)

From the Oct 2026 proof (`kg_validation.txt` / the benchmark write-up):

- Two published validation examples disagree with the tree (bankruptcy-8y / self-employed paths).
- Bankruptcy is only checked under score 600–649 (coverage gap above 650).
- Some reason strings disagree with firing thresholds (inquiries, DTI).

Formalizing expertise makes these **testable**. The graph-only score in the benchmark is faithful capture of this tree, including its gaps. It is not a claim that the graph is smarter than an LLM.

## Hybrid recommendation

1. LLM (or form) extracts fields from messy input — never invent missing regulated fields.
2. Deterministic tree/KG decides and cites nodes.
3. Anything unknown → `ESCALATE` to a human.

Verified synthetic credit-risk numbers (seed 42, 139 cases, grok-4.7, one scored run per case) are in
[`docs/benchmarks/2026-10-credit-risk.md`](../../docs/benchmarks/2026-10-credit-risk.md).
Cite that table, with the caveats in the report. Do not add accuracy figures that the report does not contain.

## Tooling hooks (roadmap — not shipped here)

Thin MCP-shaped verbs for a future reasoner: `decide`, `explain`, `validate`. This file does
**not** implement them.
