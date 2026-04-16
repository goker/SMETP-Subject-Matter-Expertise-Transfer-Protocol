# SMETP: Complete Framework Documentation

## Table of Contents

1. [Overview](#overview)
2. [The 5 Phases](#the-5-phases)
3. [Interview Protocol](#interview-protocol)
4. [Skill Document Specification](#skill-document-specification)
5. [Validation Methodology](#validation-methodology)
6. [Domain-Specific Guidance](#domain-specific-guidance)
7. [Scientific Principles](#scientific-principles)

---

## Overview

SMETP is a **structured, scientific approach** to converting tacit expert knowledge into explicit, deterministic AI skills.

### Core Insight

Expert decision-making follows **hidden patterns** that:
- Can be extracted through structured interviews
- Should be codified as decision logic, not left to probabilistic models
- Must be validated against historical data
- Need confidence calibration per scenario

### Why This Matters

Most organizations have:
- 5-10 critical decision-makers (bankers, doctors, lawyers, engineers)
- 10,000+ hours of expertise each
- **Zero documentation** of their logic

When they leave or retire, **$M or $B in expertise walks out the door**.

SMETP captures that expertise **before it's lost**.

---

## The 5 Phases

### Phase 1: Capture 📝

**Goal**: Extract expert's decision process

**Method**: Structured interview (1-2 hours)

**Questions**:
1. What's your primary responsibility?
2. Walk through a typical decision. What's first?
3. What information do you absolutely need?
4. What are your key thresholds/rules?
5. Tell me about a decision that surprised you
6. What red flags do you watch for?
7. How confident are you in different scenarios?
8. Give me 3 past decisions + outcomes
9. How accurate is your process?
10. What would make your role obsolete?

**Output**: Interview transcript + notes

---

### Phase 2: Analyze 🔍

**Goal**: Understand decision logic patterns

**Method**: LLM-assisted analysis

**Steps**:
1. Extract decision factors
2. Identify key thresholds
3. Map decision tree
4. Find heuristics (implicit rules)
5. Identify edge cases
6. Cross-reference domain ontologies

**Output**: Decision tree structure, heuristics list, edge cases

---

### Phase 3: Codify ⚙️

**Goal**: Convert to executable skill

**Method**: Generate skill document

**Components**:
- **Inputs**: What data is needed
- **Decision Logic**: Decision trees + rules
- **Heuristics**: Patterns and shortcuts
- **Edge Cases**: Special handling
- **Confidence Scoring**: Per-scenario confidence
- **Outputs**: Decision + reasoning

**Output**: Skill JSON document (see Skill Document Specification below)

---

### Phase 4: Validate ✅

**Goal**: Verify skill accuracy

**Method**: Test against historical data

**Process**:
1. Collect 50-100+ past decisions made by SME
2. Run skill on same inputs
3. Compare skill output vs. SME decision
4. Calculate metrics:
   - **Accuracy**: % decisions that match
   - **Precision**: Of approved decisions, % correct
   - **Recall**: Of actual approvals, % caught
   - **Confidence Calibration**: Does 95% confidence = 95% accuracy?

**Target**: 90%+ accuracy, well-calibrated confidence

**Output**: Validation report

---

### Phase 5: Deploy 🚀

**Goal**: Use skill in production

**Export Formats**:
- Claude Tools (use_tools schema)
- OpenAI Functions
- Anthropic Tool Use
- TypeScript executable
- Python executable
- JSON (any LLM)

**Deployment Options**:
- Use in your org only (free)
- Sell in marketplace (70/30 split)
- License to enterprises
- Open-source contribution

**Output**: Deployed skill, ready to scale

---

## Interview Protocol

### Pre-Interview Setup

**Duration**: 60-90 minutes
**Format**: Conversation (not interrogation)
**Recording**: Voice + transcription (optional)
**Goal**: Make SME comfortable explaining their expertise

### Interview Flow

#### Stage 1: Background (5 min)
```
"Tell me about your role and experience"
→ Establishes context
→ Builds rapport
```

#### Stage 2: Workflow (15 min)
```
"Walk me through a typical decision.
What's the first thing you look at?
Then what?"
→ Maps decision sequence
→ Identifies key factors
```

#### Stage 3: Decision Logic (20 min)
```
"What are your thresholds for approving/denying?
What if score is borderline?
What other factors matter?"
→ Extracts decision rules
→ Identifies conditional logic
```

#### Stage 4: Heuristics (20 min)
```
"What patterns do you notice?
What shortcuts do you take?
Tell me about an exception that surprised you"
→ Captures tacit knowledge
→ Identifies edge cases
```

#### Stage 5: Validation (15 min)
```
"Give me 5 past decisions and outcomes.
Why did you approve/deny?
How sure were you?"
→ Provides test cases
→ Reveals confidence calibration
```

#### Stage 6: Wrap-up (5 min)
```
"How would you automate your role?
What would break this process?
Any final thoughts?"
→ Identifies edge cases
→ Closes conversation
```

---

## Skill Document Specification

### JSON Schema

```json
{
  "metadata": {
    "version": "1.0",
    "domain": "finance",
    "skillName": "credit_risk_assessment",
    "displayName": "Credit Risk Assessment",
    "description": "Evaluate loan applicant creditworthiness",

    "smeName": "Jane Doe",
    "smeRole": "Senior Credit Analyst",
    "smeYearsExperience": 20,

    "createdAt": "2025-01-15",
    "updatedAt": "2025-01-15",
    "version": "1.0.0"
  },

  "whyBetterThanClaude": [
    "Claude guesses credit thresholds. This uses actual banker heuristics.",
    "Claude misses edge cases. This has bankruptcy 7-year rule explicit.",
    "Claude gives 50% confidence. This has per-scenario confidence (65%-98%)."
  ],

  "inputs": {
    "credit_score": {
      "type": "number",
      "min": 300,
      "max": 850,
      "required": true,
      "description": "Credit score (FICO)"
    },
    "income_annual": {
      "type": "number",
      "required": true,
      "description": "Annual gross income in USD"
    },
    "debt_to_income": {
      "type": "number",
      "min": 0,
      "max": 1,
      "required": true,
      "description": "Total debt / annual income"
    },
    "employment_years": {
      "type": "number",
      "required": true,
      "description": "Years employed in current position"
    }
  },

  "decision_tree": {
    "description": "Explicit decision logic",
    "root": {
      "condition": "credit_score >= 750",
      "yes": { "node": "tier_prime" },
      "no": { "node": "check_medium" }
    },
    "tier_prime": {
      "decision": "APPROVE",
      "tier": "PRIME",
      "confidence": 0.98,
      "reason": "Excellent credit history"
    },
    "check_medium": {
      "condition": "credit_score >= 650",
      "yes": { "node": "tier_standard" },
      "no": { "node": "tier_subprime" }
    }
  },

  "heuristics": [
    {
      "name": "employment_stability",
      "rule": "If employed < 2 years, increase risk by 15%",
      "source": "SME observation over 20 years",
      "scientificSupport": "Smith et al. (2023) - Employment Stability as Credit Risk",
      "confidenceAdjustment": -0.1
    },
    {
      "name": "inquiry_velocity",
      "rule": "If >3 hard inquiries in 6 months, applicant likely desperate",
      "source": "SME pattern matching",
      "scientificSupport": "Experian Credit Risk Model (2023)",
      "confidenceAdjustment": -0.15
    }
  ],

  "edge_cases": [
    {
      "case": "Recent bankruptcy discharge (7+ years ago)",
      "smeApproach": "Approvable if all other factors strong",
      "rationale": "Fair Credit Reporting Act 7-year rule",
      "rule": "If years_since_bankruptcy >= 7 AND dti <= 0.35 THEN consider",
      "confidenceAdjustment": -0.25
    },
    {
      "case": "Self-employed with high income variance",
      "smeApproach": "Use 2-year average of tax returns",
      "rationale": "Self-employed income more volatile",
      "rule": "If self_employed THEN use 2yr_avg_income",
      "confidenceAdjustment": -0.20
    }
  ],

  "outputs": {
    "decision": {
      "type": "string",
      "enum": ["APPROVE", "CONDITIONAL", "DENY", "ESCALATE"],
      "description": "Final decision"
    },
    "tier": {
      "type": "string",
      "enum": ["PRIME", "STANDARD", "SUBPRIME"],
      "description": "Applicant risk tier"
    },
    "confidence": {
      "type": "number",
      "min": 0,
      "max": 1,
      "description": "SME confidence in this decision"
    },
    "reasoning": {
      "type": "string",
      "description": "Explanation of decision"
    },
    "next_steps": {
      "type": "array",
      "items": "string",
      "description": ["verify_income", "require_cosigner"]
    }
  },

  "validation": {
    "methodology": "Tested against 500+ historical decisions",
    "accuracy": 0.94,
    "precision": 0.91,
    "recall": 0.89,
    "smeAlignment": "94% agreement with SME",
    "test_cases": [
      {
        "name": "Prime applicant",
        "inputs": { "credit_score": 800, "income_annual": 120000 },
        "expectedOutput": { "decision": "APPROVE", "tier": "PRIME", "confidence": 0.98 }
      }
    ]
  }
}
```

---

## Validation Methodology

### Preparing Test Data

1. **Collect** 50-100+ past SME decisions
2. **Extract** inputs that went into each decision
3. **Record** final decision + outcome

### Running Validation

```python
def validate_skill(skill, test_cases):
    correct = 0
    for case in test_cases:
        result = skill.execute(case['inputs'])
        if result['decision'] == case['expectedDecision']:
            correct += 1

    accuracy = correct / len(test_cases)
    return {
        'accuracy': accuracy,
        'status': 'PASS' if accuracy >= 0.90 else 'FAIL'
    }
```

### Metrics to Track

- **Accuracy**: % decisions matching SME
- **Precision**: Of decisions skill makes, % correct
- **Recall**: Of decisions SME makes, % skill catches
- **Confidence Calibration**: Does 90% confidence = 90% accuracy?
- **False Positives**: Approvals that shouldn't happen
- **False Negatives**: Denials when should approve

### Success Criteria

- ✅ Accuracy >= 90%
- ✅ Precision >= 85%
- ✅ Recall >= 85%
- ✅ Confidence well-calibrated (within 5%)

---

## Domain-Specific Guidance

### Finance Domain

**Key Metrics**:
- Credit score, debt-to-income, income stability
- Employment history, savings ratio
- Bankruptcy history, inquiry velocity

**Edge Cases**:
- Self-employed income (use 2yr average)
- Recent bankruptcy (7yr rule)
- Recent immigrants (no US credit history)

**Heuristics**:
- Employment stability predicts default
- Multiple inquiries = credit seeking
- Medical debt different than credit card debt

### Healthcare Domain

**Key Metrics**:
- Vital signs, labs, imaging
- Patient history, comorbidities
- Symptom timeline, risk factors

**Edge Cases**:
- Rare presentations
- Atypical demographics
- Medication interactions

**Heuristics**:
- Common things are common (base rates matter)
- Red flags that "must not miss"
- Anchoring bias (first diagnosis sticks)

### Legal Domain

**Key Metrics**:
- Contract type, party relationship
- Liability and indemnification terms
- Choice of law, jurisdiction

**Edge Cases**:
- Unusual party configurations
- Cross-border contracts
- Novel clauses

**Heuristics**:
- Market-standard deviations
- Hidden cross-clause implications
- Missing protections

---

## Scientific Principles

### 1. Bayesian Reasoning
- Use pretest probabilities
- Apply likelihood ratios per finding
- Calculate posttest probabilities

**Example**: Diagnosis with pretest prob 5%, likelihood ratio 10 → posttest 33%

### 2. Cognitive Psychology
- Experts develop pattern recognition (10,000 hr rule)
- Tacit knowledge must be elicited explicitly
- Confidence calibration matters

### 3. Decision Analysis
- Decision trees are deterministic
- Edge cases reduce error
- Confidence thresholds improve escalation

### 4. Knowledge Elicitation
- Structured interviews work better than free-form
- Examples reveal hidden logic
- Multiple rounds refine accuracy

### 5. Validation
- Always test against historical data
- Track all metrics (accuracy, precision, recall, calibration)
- Iterate to improve

---

## Getting Started

1. **Read this document** - Understand the framework
2. **Choose a domain** - Finance, healthcare, legal, etc.
3. **Find an SME** - Expert with 10+ years experience
4. **Run interview** - 60-90 minutes
5. **Generate skill** - Use SMETP tools
6. **Validate** - Test against 50+ historical cases
7. **Deploy** - Export and use

---

## Questions?

See [README.md](README.md) for contact info and community.
