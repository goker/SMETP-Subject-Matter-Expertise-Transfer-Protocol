# Finance Domain: Credit Analyst Interview Template

**Duration**: 60-90 minutes
**Role**: Senior Credit Analyst, Credit Underwriter, Risk Manager
**Goal**: Extract credit decision-making expertise into a reusable skill

---

## Stage 1: Background & Context (5 min)

### Question 1: Role Overview
**Q**: "Tell me about your role and experience. How long have you been making credit decisions?"

**Why**: Establishes expertise level and domain of knowledge
- Expected: 10+ years experience, clear focus on credit/lending decisions
- Listen for: Consistency of experience, scope (consumer vs commercial vs both)
- Follow-up: "What types of loans do you typically evaluate?" (personal, business, mortgage, auto, etc.)

---

## Stage 2: Decision Workflow (15 min)

### Question 2: First Factor
**Q**: "Walk me through a typical credit decision. What's the very first thing you look at?"

**Why**: Identifies primary decision factor (usually credit score)
- Expected: "Credit score" or "Financial history" as first screen
- Listen for: Whether they use a hard threshold or range
- Follow-up: "What credit score range triggers an automatic approval or denial?"

### Question 3: Sequential Logic
**Q**: "If that first factor is marginal, what do you look at next? Walk me through a borderline case."

**Why**: Maps decision sequence and conditional logic
- Expected: Order of factors (DTI, employment, savings, etc.)
- Listen for: Decision tree structure emerging
- Example answer: "If score is 680-720, I check DTI. If DTI is under 43%, I look at employment stability..."

### Question 4: Information Requirements
**Q**: "What information do you absolutely need to make a decision? What can you skip?"

**Why**: Identifies required inputs vs optional refinements
- Expected: Credit score, income, debt, employment, assets, debt type
- Listen for: What's negotiable vs must-have
- Follow-up: "If someone can't provide X, how do you adjust?"

---

## Stage 3: Decision Rules & Thresholds (20 min)

### Question 5: Hard Thresholds
**Q**: "Do you have specific thresholds? For example, what's your minimum credit score? Your maximum DTI?"

**Why**: Extracts explicit decision rules
- Expected: Specific numbers (minimum 620, DTI max 43%, employment min 2 years, etc.)
- Listen for: Rules that vary by loan type or applicant tier
- Follow-up: "Do these thresholds ever change based on other factors?"

### Question 6: Tier System
**Q**: "Do you categorize applicants into tiers or risk buckets? Describe each."

**Why**: Identifies risk stratification
- Expected: PRIME (750+), STANDARD (650-750), SUBPRIME (<650) or similar
- Listen for: Confidence levels per tier, terms that differ by tier
- Example: "Prime gets standard terms, standard gets 2% higher rate, subprime needs cosigner"

### Question 7: Conditional Logic
**Q**: "Give me a specific example of when you would approve someone that most lenders might deny. What factors override a low score?"

**Why**: Captures heuristics and compensating factors
- Expected: Strong employment history, large savings, recent improvement trend, etc.
- Listen for: Tacit rules (pattern recognition)
- Example: "If someone has been at the same job 15 years, I can overlook a 640 score if DTI is low"

### Question 8: Red Flags
**Q**: "What red flags automatically mean rejection? What's a deal-breaker?"

**Why**: Identifies hard stops and edge cases
- Expected: Bankruptcy <7 years, recent delinquency, fraud, negative trends, etc.
- Listen for: Hard rules vs judgment calls
- Follow-up: "Are there any exceptions to these red flags?"

---

## Stage 4: Heuristics & Patterns (20 min)

### Question 9: Patterns You've Noticed
**Q**: "What patterns do you notice over time? What's a common mistake other analysts make?"

**Why**: Captures tacit pattern recognition and wisdom
- Expected: Employment instability predicts default, multiple inquiries = desperation, medical debt is different, etc.
- Listen for: Rules of thumb that aren't formalized
- Example: "People who just maxed out a credit card usually default within 18 months"

### Question 10: Success Stories
**Q**: "Tell me about someone you approved that surprised you with how well they did. What were the key factors?"

**Why**: Reveals positive signals and compensating factors
- Expected: Story showing good judgment on borderline case
- Listen for: What convinced them despite one weak factor
- Reason: Creates heuristic pattern for future decisions

### Question 11: Tough Decisions
**Q**: "Tell me about a decision that you had to escalate or that you still think about. What made it difficult?"

**Why**: Reveals edge cases and confidence calibration
- Expected: Unusual combination of factors, unclear precedent, conflicting signals
- Listen for: What creates doubt or requires manager review
- Follow-up: "What would have made you more confident?"

---

## Stage 5: Historical Validation (15 min)

### Question 12: Past Cases
**Q**: "Give me 5 past decisions you made — 3 approvals and 2 denials. For each, tell me the key factors and the outcome."

**Why**: Provides test cases for validation
- Capture: Credit score, DTI, employment, savings, decision, confidence, actual outcome
- Listen for: How outcomes validated or challenged their logic
- Format: Create a table:
  ```
  | Credit Score | DTI | Employment Yrs | Decision | Confidence | Outcome |
  |---|---|---|---|---|---|
  | 720 | 0.38 | 5 | APPROVE | 90% | Repaid successfully |
  | 580 | 0.50 | <1 | DENY | 85% | (Would have defaulted) |
  ```

### Question 13: Accuracy
**Q**: "Over the past 100 decisions you made, what percentage do you think performed as expected?"

**Why**: Self-assessment of accuracy
- Expected: 85%+ success rate
- Listen for: Where failures happened (score too optimistic, missed pattern, market changed)
- Follow-up: "Which segment has your highest accuracy — prime, standard, or subprime?"

---

## Stage 6: Edge Cases & Exceptions (10 min)

### Question 14: Edge Cases You Handle
**Q**: "What unusual situations do you encounter? Examples: self-employed income, bankruptcy, recent immigrant, divorce, co-applicants, medical debt?"

**Why**: Reveals special handling rules
- Expected: Specific approach to 5-10 edge cases
- Listen for: How you adjust rules for unusual situations
- Document: Each edge case with the SME's special rule

### Question 15: Confidence Calibration
**Q**: "How sure are you in different scenarios? When are you 95% confident? When are you only 60% confident?"

**Why**: Captures confidence scoring
- Expected: Different confidence for prime vs subprime, clear decisions vs marginal
- Listen for: What creates uncertainty
- Example: "95% confident on 750+ score, only 70% on <600 unless other factors strong"

---

## Stage 7: Closing (5 min)

### Question 16: How Would You Automate This?
**Q**: "If you had to write rules for a computer to make 80% of these decisions automatically, what would you tell it?"

**Why**: Forces explicit rule articulation
- Expected: Clear decision tree, thresholds, and exceptions
- Listen for: Rules that might be hard to formalize

### Question 17: Blind Spots
**Q**: "What would break this process? What am I missing?"

**Why**: Reveals gaps and risks
- Expected: Market changes, fraud, policy changes, new regulations
- Listen for: What SME worries about

---

## Interview Captures Template

Use this template to organize the interview output:

```json
{
  "metadata": {
    "domain": "finance",
    "role": "credit_analyst",
    "smeYearsExperience": 20,
    "interviewDate": "2025-01-15",
    "interviewDuration": "75 minutes"
  },

  "keyMetrics": {
    "primaryFactor": "credit_score",
    "scoreRange": { "min": 620, "max": 850 },
    "secondaryFactors": ["debt_to_income", "employment_stability", "savings_buffer"]
  },

  "thresholds": {
    "minimumScore": 620,
    "maximumDti": 0.43,
    "minimumEmploymentYears": 2,
    "minimumSavingsMonths": 3
  },

  "tiers": {
    "prime": { "scoreMin": 750, "confidence": 0.95 },
    "standard": { "scoreMin": 650, "confidence": 0.85 },
    "subprime": { "scoreMin": 600, "confidence": 0.70 }
  },

  "redFlags": [
    { "flag": "bankruptcy_recent", "rule": "If years_since < 7: DENY", "confidence": -0.30 },
    { "flag": "recent_delinquency", "rule": "If late_payment_months < 12: DENY", "confidence": -0.25 }
  ],

  "heuristics": [
    { "pattern": "employment_stability", "rule": "15+ years same job overrides lower score", "confidenceBoost": 0.10 },
    { "pattern": "inquiry_velocity", "rule": "3+ hard inquiries in 6mo = desperation", "confidencePenalty": -0.15 }
  ],

  "edgeCases": [
    { "case": "self_employed", "smeApproach": "Use 2-year average of tax returns" },
    { "case": "recent_immigrant", "smeApproach": "Request international credit reference + larger down payment" }
  ],

  "pastDecisions": [
    { "creditScore": 720, "dti": 0.38, "employmentYears": 5, "decision": "APPROVE", "confidence": 0.90, "outcome": "repaid_successfully" }
  ]
}
```

---

## Follow-Up Questions (If Time)

- "What percentage of decisions are escalated to management review?"
- "How do you handle ties or 50-50 decisions?"
- "What's changed in credit decisions over your career?"
- "Which single factor is most predictive of default?"
- "Do you use any external data sources? (Credit bureaus, alternative data?)"

---

## Notes for Interviewer

1. **Listen for implicit rules** — SMEs often won't state all their decision logic explicitly. Listen for "usually", "typically", "I've found that", etc.
2. **Push on boundaries** — "What if the score is 749? What if DTI is 43.1%?" reveals where rules are hard vs soft
3. **Ask for examples** — Concrete past decisions reveal patterns better than abstract rules
4. **Confidence matters** — Track how confident they are in different scenarios
5. **Edge cases are gold** — Unusual situations reveal the SME's deepest expertise
6. **Validate outcomes** — Make sure their decisions actually performed as expected (no confirmation bias)

---

**Next Step**: After interview, use this data to create a decision tree and validate against 50+ historical cases.
