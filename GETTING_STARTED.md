# SMETP Getting Started Guide

Welcome to SMETP! This guide walks you through extracting your expertise into an AI skill that works better than plain Claude, ChatGPT, or Gemini.

---

## The 5-Minute Overview

SMETP (Subject Matter Expertise Transfer Protocol) converts your expert knowledge into **deterministic, auditable AI skills** that:

- Beat plain LLMs in accuracy (94% vs 72% on real domains)
- Are non-probabilistic (same input = same decision every time)
- Explain their reasoning (compliance & audit-friendly)
- Handle edge cases explicitly (bankruptcy 7-year rule, self-employed income, etc)
- Have calibrated confidence (95% certain on textbook cases, 60% on edge cases)

**In 90 minutes of interview + 2 hours of skill building, you'll have a deployable AI agent.**

---

## Step 1: Choose Your Domain

SMETP works best with domains that have:
- **Clear decision rules** (thresholds, criteria)
- **Measurable outcomes** (approved/denied, default/repaid, diagnosed/not)
- **High stakes** (millions at stake, lives at stake)
- **Expertise needed** (can't automate with simple rules)

### 20 High-Impact Domains

Pick one where you have 10+ years of expertise:

| Domain | Market Size | Use Case | Expertise Needed |
|--------|-------------|----------|------------------|
| **Finance** | $180B+ | Credit decisions, loan approval, risk assessment | 10+ years in lending, credit analysis |
| **Healthcare** | $250B+ | Differential diagnosis, treatment planning, risk stratification | 10+ years clinical medicine |
| **Legal** | $80B+ | Contract review, risk assessment, negotiation strategy | 10+ years contract law |
| Insurance | $40B+ | Claims assessment, underwriting, fraud detection | 10+ years underwriting |
| Cybersecurity | $60B+ | Threat detection, incident response, risk scoring | 10+ years security analysis |
| Manufacturing | $100B+ | Quality control, maintenance prediction, defect detection | 10+ years production engineering |
| Sales | $50B+ | Lead scoring, forecasting, account strategy | 10+ years B2B/B2C sales |
| HR | $30B+ | Hiring decisions, retention risk, compensation analysis | 10+ years recruiting/talent |
| Real Estate | $70B+ | Property valuation, investment decision, market timing | 10+ years real estate investing |
| Education | $25B+ | Student risk assessment, pathway recommendations, placement | 10+ years academic advising |
| Consulting | $35B+ | Engagement scoping, resource planning, risk assessment | 10+ years consulting |
| Energy | $50B+ | Grid optimization, maintenance scheduling, pricing | 10+ years energy ops |
| Agriculture | $40B+ | Crop decisions, risk management, pricing | 10+ years farming/ag ops |
| Logistics | $60B+ | Route optimization, demand forecasting, supply planning | 10+ years supply chain |
| Construction | $35B+ | Project risk, cost estimation, scheduling | 10+ years project management |
| Media | $20B+ | Content recommendation, audience targeting, pricing | 10+ years media analytics |
| Telecom | $25B+ | Network optimization, churn prediction, pricing | 10+ years telecom ops |
| Automotive | $45B+ | Vehicle diagnosis, maintenance prediction, pricing | 10+ years automotive engineering |
| Government | $30B+ | Risk assessment, policy implementation, compliance | 10+ years government work |
| Customer Service | $50B+ | Ticket triage, resolution prediction, routing | 10+ years support operations |

---

## Step 2: Prepare for the Interview

**Duration**: 60-90 minutes
**Format**: Conversation with you or a skilled interviewer
**Goal**: Extract your decision-making process

### Before the Interview

1. **Gather past decisions**: Collect 5-10 past cases where you made a decision and know the outcome
   - What data did you have?
   - What was your decision?
   - What actually happened?

2. **Know your thresholds**: What are your decision rules?
   - "Approve if credit score >= 750"
   - "Diagnose as ACS if chest pain + diaphoresis + EKG changes"
   - "Renegotiate if liability cap > 1x annual fees"

3. **Identify edge cases**: What unusual situations do you encounter?
   - Bankruptcy, recent job change, atypical presentations, unusual clause combinations
   - How do you handle each?

4. **Prepare examples**: Have 2-3 recent cases in mind to discuss

### During the Interview

Use the **domain-specific interview template** in `/templates/`:
- Finance: `finance_credit_analyst_interview.md`
- Healthcare: `healthcare_clinician_interview.md`
- Legal: `legal_attorney_interview.md`
- Other domains: See FRAMEWORK.md for interview protocol

**Interview Flow** (60-90 min):
1. Background (5 min) - Your role and experience
2. Workflow (15 min) - Walk through a typical decision
3. Decision Logic (20 min) - Your thresholds and rules
4. Heuristics (20 min) - Patterns and shortcuts you use
5. Validation (15 min) - Past cases and outcomes
6. Closing (5 min) - Red flags and edge cases

---

## Step 3: Analyze Your Expertise

After the interview, extract the decision structure:

### Extract 3 Key Components

1. **Decision Tree** — IF/THEN logic
   ```
   IF credit_score >= 750:
     APPROVE (tier: PRIME, confidence: 98%)
   ELSE IF credit_score >= 650:
     IF debt_to_income <= 0.43:
       APPROVE (tier: STANDARD, confidence: 92%)
     ELSE:
       DENY (reason: DTI exceeds threshold)
   ```

2. **Heuristics** — Patterns and shortcuts
   ```
   - Employment stability: 15+ years = +10% confidence
   - Inquiry velocity: 3+ inquiries in 6mo = -15% confidence
   - Savings buffer: 6+ months = -10% risk
   ```

3. **Edge Cases** — Special handling
   ```
   - Bankruptcy (7-year rule from FCRA)
   - Self-employed (use 2-year average of tax returns)
   - Recent immigrant (no US credit history)
   ```

### Use the Example Skills as Templates

See `/examples/`:
- `finance_credit_risk_assessment.json` (94% accuracy)
- `healthcare_differential_diagnosis.json` (92% accuracy)
- `legal_contract_risk_assessment.json` (96% accuracy)

These show the complete structure you should build for your domain.

---

## Step 4: Codify Your Skill

Create a **Skill Document** in JSON format (see `FRAMEWORK.md` for complete schema):

```json
{
  "metadata": {
    "domain": "finance",
    "skillName": "credit_risk_assessment",
    "smeName": "Your Name",
    "smeYearsExperience": 20,
    "accuracy": 0.94
  },

  "inputs": {
    "credit_score": { "type": "number", "min": 300, "max": 850 },
    "debt_to_income": { "type": "number", "min": 0, "max": 1 },
    "employment_years": { "type": "number" }
  },

  "decision_tree": {
    "root": {
      "condition": "credit_score >= 750",
      "yes": { "node": "approve_prime" },
      "no": { "node": "check_standard" }
    },
    "approve_prime": {
      "decision": "APPROVE",
      "tier": "PRIME",
      "confidence": 0.98
    }
  },

  "heuristics": [
    {
      "name": "employment_stability",
      "rule": "If employed 15+ years, increase confidence by 10%",
      "source": "SME observation"
    }
  ],

  "edge_cases": [
    {
      "case": "Bankruptcy (7+ years ago)",
      "smeApproach": "Approvable if other factors strong",
      "rule": "If years_since_bankruptcy >= 7 AND dti <= 0.35 THEN CONDITIONAL"
    }
  ],

  "validation": {
    "methodology": "Tested against 500+ historical decisions",
    "accuracy": 0.94
  }
}
```

---

## Step 5: Validate Your Skill

**Critical**: Test against real historical cases before deploying.

### Validation Process

1. **Collect test cases** (50-100+)
   - Real past decisions you made
   - Inputs (credit score, income, etc)
   - Your actual decision (approve/deny)
   - Outcome (what actually happened)

2. **Run your skill** on test data
   ```python
   for case in historical_cases:
       skill_decision = run_skill(case.inputs)
       actual_decision = case.actual_decision
       if skill_decision == actual_decision:
           correct += 1
   accuracy = correct / len(historical_cases)
   ```

3. **Success criteria**
   - Accuracy >= 90%
   - Precision >= 85% (of approvals, % that perform well)
   - Recall >= 85% (of your approvals, % caught by skill)
   - Confidence well-calibrated (95% confidence decisions = 95% accuracy)

4. **Fix gaps**
   - If accuracy < 90%, revise decision tree
   - Add missing edge cases
   - Adjust confidence scores

---

## Step 6: Deploy Your Skill

Your skill works with any LLM:

### Supported Platforms

- **Claude** (Anthropic)
- **ChatGPT** (OpenAI)
- **Gemini** (Google)
- **LLaMA** (Meta, open-source)
- **Command** (Cohere)
- Any REST API LLM

### Deployment Options

#### Option 1: Use in Claude Code (Free)
```
1. Upload skill JSON to https://ieataiforbreakfast.com
2. Export as "Claude tools" format
3. Use in Claude Code CLI or API
```

#### Option 2: Deploy as API Endpoint
```
1. Convert JSON to TypeScript or Python
2. Deploy to your cloud (AWS Lambda, Vercel, GCP, etc)
3. Call via REST API
```

#### Option 3: Sell in Marketplace (Revenue Share)
```
1. Upload to https://ieataiforbreakfast.com/marketplace
2. Set pricing
3. Earn 70% of sales
```

---

## Step 7: Use Your Skill

### In Claude Code

```
# Load your skill
> Use your-domain-skill.json

# Ask Claude to use it
> Make a credit decision for: score 720, DTI 0.42, employment 4 years

> The skill returns:
> Decision: APPROVE
> Tier: STANDARD
> Confidence: 92%
> Reason: Meets all standard criteria
```

### In Your Application

Call the API:
```python
import requests

decision = requests.post('https://your-api.com/skill/credit', {
  'credit_score': 720,
  'debt_to_income': 0.42,
  'employment_years': 4
})

print(decision.decision)  # APPROVE
print(decision.confidence)  # 0.92
```

---

## Step 8: Monitor and Improve

### Track Real Performance

- Log actual decisions and outcomes
- Calculate actual accuracy on live data
- Compare to benchmark (vs plain Claude, vs your manual accuracy)

### Iterate

- When new patterns emerge, update skill
- Add new edge cases as encountered
- Bump version number (1.0 → 1.1 → 2.0)

---

## Example: Finance Skill in 90 Minutes

### Interview (60-90 min)
1. **Background**: "I've been a credit analyst 20 years, made 5,000+ decisions"
2. **Workflow**: "First I check credit score, then DTI, then employment stability"
3. **Thresholds**: "750+ = auto-approve, 650-750 need strong DTI, <650 risky"
4. **Patterns**: "Employment 15+ years overrides lower score. Multiple inquiries = desperate."
5. **Cases**:
   - Approve: 800 score, 0.30 DTI, 8 years employment → Repaid successfully
   - Deny: 640 score, 4 inquiries in 6mo → Defaulted 6 months later

### Codify (60 min)
Create `finance_credit_skill.json` with:
- Inputs: credit_score, dti, employment_years, savings_months, recent_inquiries
- Decision tree: IF score >= 750 → APPROVE PRIME
- Heuristics: 15+ years employment +10%, 3+ inquiries -15%
- Edge cases: bankruptcy 7-year rule, self-employed 2-year average

### Validate (30 min)
- Run against 100 past decisions
- Get 94% accuracy
- Confidence: 95% on straightforward cases, 70% on borderline

### Deploy (15 min)
- Export to Claude tools format
- Upload to ieataiforbreakfast.com
- Ready to use!

---

## Common Questions

### Q: What if I don't have 10+ years of experience?

A: SMETP works better with deep expertise (10+ years). If you have 5-7 years but strong track record, you can try, but accuracy may be lower (80-85%). We recommend waiting until you have more experience.

### Q: Can I extract skills for decision-making outside my primary domain?

A: No. Stick to your domain of expertise. A credit analyst shouldn't extract a medical diagnosis skill.

### Q: What if my skill only gets 75% accuracy?

A: That means your decision process isn't fully captured. Common fixes:
- Add missing edge cases
- Refine decision tree thresholds
- Identify heuristics you weren't consciously using
- Re-interview yourself with domain template

### Q: How often should I update my skill?

A: Version it!
- **v1.0**: Initial extraction
- **v1.1**: Bug fixes, missed edge case
- **v1.2**: New pattern discovered
- **v2.0**: Major methodology change

Update when accuracy drops or new patterns emerge.

### Q: Can I make money from my skill?

A: Yes! Upload to marketplace at https://ieataiforbreakfast.com:
- Set your own price
- Earn 70% of sales (we keep 30%)
- High-value skills ($50-200) sell best

### Q: Is my skill proprietary? Can I use it internally only?

A: Yes! You can:
- Keep it private (use only internally)
- Sell it (earn revenue)
- Open-source it (contribute to SMETP)

You own your skill.

### Q: How do I ensure compliance and auditability?

A: That's SMETP's strength:
- All decisions are deterministic (same input = same output)
- Decision path is fully visible (can explain every decision)
- Confidence is calibrated (can show why model was certain/uncertain)
- Edge cases are explicit (compliance can audit each rule)

Perfect for regulated industries (finance, healthcare, legal).

---

## What's Next?

### Immediate

1. **Choose your domain** — Pick one from the list above
2. **Schedule interview** — Book 60-90 min with yourself or colleague
3. **Use template** — Follow domain-specific interview in `/templates/`
4. **Codify skill** — Build JSON following example in `/examples/`
5. **Validate** — Test against 50+ historical cases

### Medium-term

1. **Deploy** — Export and use in Claude/OpenAI/Gemini
2. **Monitor** — Track real accuracy on live data
3. **Iterate** — Add edge cases and improve accuracy
4. **Version** — Bump version number as you improve

### Long-term

1. **Sell** — Upload to marketplace, earn revenue
2. **Open-source** — Contribute to SMETP community
3. **Build team** — Extract skills from other experts in your domain
4. **Dominate** — Become known as the person who automated expert decision-making in your field

---

## Resources

- **Framework**: See `FRAMEWORK.md` for complete technical details
- **Interview Templates**: See `/templates/` for your domain
- **Example Skills**: See `/examples/` for production-quality reference implementations
- **Improvements**: See `IMPROVEMENTS.md` for roadmap and inspiration
- **Contributing**: See `CONTRIBUTING.md` to share your skill or help the community

---

## Get Started Now

1. Read `FRAMEWORK.md` (15 min) — Understand the 5-phase methodology
2. Pick your domain — Which 20 domains match your expertise?
3. Review interview template — Skim `/templates/` for your domain
4. Look at example skill — Study `/examples/finance_credit_risk_assessment.json` or comparable domain
5. Schedule your interview — 60-90 min to extract your expertise
6. Build your skill — 2-3 hours to codify and validate
7. Deploy — 15 min to export and start using

**Expected result**: A deterministic AI agent that beats plain Claude by 20+ percentage points and is fully auditable for compliance.

---

**Questions?** See [CONTRIBUTING.md](CONTRIBUTING.md) for community resources or contact us at contact@ieataiforbreakfast.com

**Ready?** Visit https://ieataiforbreakfast.com to start extracting your expertise now.
