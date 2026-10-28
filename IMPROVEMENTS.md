# SMETP Improvements & Enhancement Roadmap

> **October 2026:** Accuracy and speed figures in the examples below were never measured. They have been removed or replaced with a pointer to the only published run: [`docs/benchmarks/2026-10-credit-risk.md`](docs/benchmarks/2026-10-credit-risk.md). Folder trees in this file are proposals. They are not directories in the repo. There are no published npm packages and no drop-in chat adapters.

## Core Improvements (Immediate)

### 1. **Benchmarking Framework**
**Problem**: How do we measure a captured skill against a plain LLM on the same cases?

**Solution**: Standardized benchmarking approach
- Define baseline: Plain Claude on same inputs
- Measure: Accuracy, speed, confidence calibration, auditability
- Report: Side-by-side comparison metrics
- Public: Publish benchmarks for each domain

**What exists:** the October 2026 synthetic credit-risk run (plain LLM, LLM plus the expert docs, hybrid, graph only). Read that report before adding another comparison. The frozen harness is in [`benchmarks/2026-10-credit-risk/`](benchmarks/2026-10-credit-risk/README.md).

### 2. **Edge Case Catalog**
**Problem**: Each domain has recurring edge cases that break simple logic

**Solution**: Shared edge case library
```
finance/edge_cases.json:
- Bankruptcy (7-year rule)
- Self-employed (2yr average income)
- Recent immigrant (no US credit history)
- Co-applicant relationship (marriage stability)
- Medical debt (different than credit card)

healthcare/edge_cases.json:
- Rare presentation (<1% prevalence)
- Atypical demographics (age doesn't fit diagnosis)
- Medication interactions (breaks normal pathway)
- Recent surgery (explains symptoms)
- Environmental exposure (history matters)
```

### 3. **Confidence Calibration Method**
**Problem**: How do SMEs assign confidence? How do we avoid overconfidence?

**Solution**: Structured confidence approach
```
Confidence = BaseConfidence × AdjustmentFactors

BaseConfidence by scenario:
- Straightforward case: 95%
- Borderline case: 75%
- Complex/rare case: 55%

AdjustmentFactors:
- Missing key information: ×0.8
- Patient/applicant stability: ×1.1
- Recent similar cases: ×1.05
- SME uncertainty noted: ×0.7

Example:
Straightforward case (95%) × missing info (0.8) = 76% confidence
→ Escalate if confidence < 80%
```

### 4. **Versioning & Updates**
**Problem**: How do we update skills as new data/cases emerge?

**Solution**: Version control for skills
```
skill_v1.json: Initial extraction
skill_v1.1.json: Bug fix (bankruptcy logic)
skill_v1.2.json: Added new edge case (recent immigrant)
skill_v2.0.json: Major update (new confidence model)

Each version includes:
- Change log
- New test cases added
- Performance delta (accuracy before/after)
- Backward compatibility notes
```

### 5. **Integration Patterns**
**Problem**: How does a skill actually run?

**Status**: not shipped. This repo has no `/integrations/` tree and no drop-in adapter for a chat product or MCP host. A draft Agent Skills file for the credit-risk example is `examples/credit-risk/SKILL.md` (example only). The roadmap is a validator, a compiler, and an MCP server with `decide` / `explain` / `validate`.

### 6. **Comparative Analysis Framework**
**Problem**: How do we show SMETP is better than alternatives?

**Status**: the only published comparison is the October 2026 credit-risk table (plain LLM, LLM with the expert docs in the prompt, hybrid, graph only). Fine-tuning was not measured. Do not add a matrix of unpublished percentages.

---

## Domain-Specific Improvements

### 7. **Finance Domain Enhancements**
- Add scoring models (not just thresholds)
- Interest rate recommendations
- Fraud score integration
- Collateral valuation logic
- Early warning signals

### 8. **Healthcare Domain Enhancements**
- ICD-10 code recommendations
- Differential diagnosis ordering (by likelihood)
- Must-not-miss diagnoses flagging
- Treatment protocol recommendations
- Drug interaction checking

### 9. **Legal Domain Enhancements**
- Contract clause templates
- Risk scoring by clause type
- Precedent recommendations
- Negotiation points ranking
- Jurisdiction-specific guidance

---

## Tooling Improvements

### 10. **Interactive Skill Builder**
```
UI Mockup:
┌─────────────────────────────────────┐
│ SMETP Skill Builder                  │
├─────────────────────────────────────┤
│ Domain: Finance                      │
│ Role: Credit Analyst                 │
│                                      │
│ Question 1: "Your first factor?"     │
│ Answer: [___________________]        │
│                                      │
│ Skill Preview (auto-updating):       │
│ {                                    │
│   "inputs": {                        │
│     "credit_score": {...}            │
│   },                                 │
│   "decision_tree": {...}             │
│ }                                    │
│                                      │
│ [Next] [Save] [Export]               │
└─────────────────────────────────────┘
```

### 11. **Validation Dashboard**
```
Show SMEs:
- Accuracy metrics in real-time
- Test case pass/fail
- Edge cases covered
- Confidence calibration chart
- Comparison vs baseline
```

### 12. **Skill Marketplace Analytics**
```
For SMEs selling skills:
- Downloads by domain
- User satisfaction ratings
- Common use cases
- Revenue tracking
- Version adoption (v1 vs v2)
```

### 13. **SME Skill Comparison Tool**

Not measured. There is no peer accuracy ranking in this repo. Do not invent one.

---

## Research Improvements

### 14. **Scientific Validation Studies**
- Publish accuracy vs LLM benchmarks
- Case studies across domains
- Confidence calibration research
- Edge case effectiveness studies

### 15. **Domain Ontology Integration**
- Finance: XBRL taxonomy
- Healthcare: SNOMED CT, ICD-10
- Legal: Legal taxonomy
- Supply Chain: SCOR model

---

## Community Improvements

### 16. **Certification Program**

There is no certification, marketplace listing, or revenue share. Do not describe one as if it exists. A future program would need its own measured benchmark, not a percentage written into a roadmap sketch.

### 17. **Domain Communities**
- Finance: Credit experts sharing skills
- Healthcare: Clinicians sharing diagnostic logic
- Legal: Attorneys collaborating on templates
- Manufacturing: Engineers sharing QA logic

### 18. **Open Research Grants**
- Fund research on SMETP effectiveness
- Sponsor domain-specific case studies
- Support tooling development
- Fund community contributions

---

## Immediate Wins (This Week)

### Quick Adds:
1. ✅ Domain subdirectories with guidance
2. ✅ Interview templates per domain
3. ✅ Move example skills to framework
4. ✅ Getting-started guide
5. Edge case catalog (JSON)
6. Confidence calibration worksheet
7. Benchmarking template
8. Integration examples (1 per format)

---

## Competitive Positioning

### Why SMETP vs Alternatives

| vs Fine-tuning | vs RAG | vs Custom Agents | vs Plain LLM |
|---|---|---|---|
| No model retraining | Deterministic logic | Structured extraction | Auditable decisions |
| Works with any LLM | Faster than LLM calls | Reusable across orgs | Edge cases explicit |
| One extraction | Human-readable | Lower hallucination | Domain-specific heuristics |

---

## Success Metrics

### For SMETP Platform:
- 100 skills extracted
- 90%+ average accuracy
- $100k+ skill sales revenue
- 1,000+ developers using skills

### For SMETP Framework:
- 1,000+ GitHub stars
- 100+ community contributors
- 50+ published papers citing SMETP
- 5+ Fortune 500 companies using

---

## The Big Opportunity

**SMETP could become the standard for SME→AI transfer**, like:
- Git became standard for version control
- Docker became standard for containers
- Kubernetes became standard for orchestration

**If we**:
1. Keep it open-source and community-driven
2. Publish rigorous benchmarks
3. Build great tooling
4. Support 20+ domains
5. Create certification program
6. Build supportive community

**Then**: SMETP becomes the trusted standard for expertise transfer.
