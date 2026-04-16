# Healthcare Domain: Clinician Interview Template

**Duration**: 60-90 minutes
**Role**: Physician, Nurse Practitioner, Specialist, Emergency Medicine Doctor
**Goal**: Extract diagnostic and treatment decision-making expertise

---

## Stage 1: Background & Context (5 min)

### Question 1: Clinical Background
**Q**: "Tell me about your clinical experience. How many years have you been making diagnostic/treatment decisions in your specialty?"

**Why**: Establishes expertise scope and domain
- Expected: 10+ years, clear specialty (internal medicine, emergency, cardiology, etc.)
- Listen for: Mix of patient types (inpatient vs outpatient, complex vs simple)
- Follow-up: "What's your typical patient population?"

---

## Stage 2: Clinical Workflow (15 min)

### Question 2: Initial Assessment
**Q**: "Walk me through your approach to a typical patient. What's the first thing you assess?"

**Why**: Reveals initial filtering and triage logic
- Expected: Chief complaint, vital signs, key history elements
- Listen for: What triggers alarm vs "wait and see"
- Example: "Chest pain — immediately check vitals and EKG. Fever — check temperature and vital signs first."

### Question 3: Differential Diagnosis
**Q**: "For a patient with [common presentation], what's your differential diagnosis? What's most likely?"

**Why**: Maps diagnostic reasoning
- Expected: List of diagnoses in order of likelihood, with base rates
- Listen for: How they weight common vs uncommon diagnoses
- Key insight: "90% of chest pain is MSK, but 10% is ACS — I screen for ACS first"

### Question 4: Red Flag Recognition
**Q**: "What red flags would make you escalate or change your approach immediately?"

**Why**: Identifies must-not-miss diagnoses
- Expected: Sepsis signs, acute abdomen, unstable vitals, etc.
- Listen for: What pattern triggers reflexive action
- Example: "Altered mental status in elderly = sepsis until proven otherwise"

---

## Stage 3: Decision Rules & Algorithms (20 min)

### Question 5: Diagnostic Criteria
**Q**: "For your top 5 diagnoses in your specialty, what are the diagnostic criteria? Do you use scoring systems?"

**Why**: Extracts explicit diagnostic frameworks
- Expected: Specific criteria (SIRS, qSOFA, Framingham, etc.) or clinical rules
- Listen for: Whether they use validated scores or intuition
- Follow-up: "How often do you follow the algorithm vs override it?"

### Question 6: Test Ordering Logic
**Q**: "Walk me through when you order tests — labs, imaging, etc. What triggers each type?"

**Why**: Maps diagnostic pathway
- Expected: Threshold-based (vital signs abnormal → CXR), symptom-based (chest pain → EKG)
- Listen for: Pretest probability thinking
- Example: "Low-risk chest pain patient, I don't need CXR. High-risk, I order CT."

### Question 7: Prognostication
**Q**: "How do you estimate risk or prognosis for a patient? Do you use risk scores?"

**Why**: Captures risk stratification
- Expected: APACHE, SOFA, Wells score, Framingham, etc.
- Listen for: Intuitive vs formal risk assessment
- Follow-up: "Are these scores always right? When do you override them?"

### Question 8: Treatment Decision
**Q**: "Once you have a diagnosis, how do you decide on treatment? What factors change your treatment?"

**Why**: Reveals treatment decision logic
- Expected: Severity, patient age, comorbidities, drug interactions, etc.
- Listen for: When they escalate care vs observe
- Example: "Mild pneumonia in young, healthy patient = outpatient antibiotics. Elderly with comorbidities = admit."

---

## Stage 4: Clinical Heuristics & Patterns (20 min)

### Question 9: "Common Things are Common"
**Q**: "What's the most common diagnosis you see for [symptom]? How often do you see the rare diagnosis?"

**Why**: Captures base rate intuition (Bayesian thinking)
- Expected: Base rate for common diagnoses (80% of headaches are tension, 15% migraine, 5% serious)
- Listen for: Whether they use pretest probability
- Key insight: "I start with the common diagnosis and screen out serious causes"

### Question 10: Patterns & Shortcuts
**Q**: "What shortcuts or patterns do you use? Do you notice recurring patient profiles?"

**Why**: Captures tacit pattern recognition
- Expected: "Elderly + fall = rule out fracture," "Young woman + chest pain = anxiety usually"
- Listen for: Rules of thumb that aren't in textbooks
- Warning: Watch for bias (anchoring, confirmation)

### Question 11: Diagnostic Surprises
**Q**: "Tell me about a patient who surprised you — diagnosis you almost missed or got wrong."

**Why**: Reveals where intuition fails
- Expected: Atypical presentation, rare diagnosis, own bias
- Listen for: What changed their thinking
- Example: "I almost missed appendicitis because patient was only 20% of typical presentation"

### Question 12: Comorbidity Interactions
**Q**: "How do comorbidities change your thinking? Any dangerous combinations?"

**Why**: Captures complex patient reasoning
- Expected: Specific interactions (diabetes changes infection risk, renal disease changes dosing, etc.)
- Listen for: Which combinations trigger special caution
- Example: "Elderly + renal disease + infection = sepsis risk is 3x, I admit immediately"

---

## Stage 5: Historical Validation (15 min)

### Question 13: Case Studies
**Q**: "Give me 5 recent cases you managed — 3 straightforward diagnoses and 2 complex/surprising ones. Key findings and outcome."

**Why**: Provides concrete test cases
- Capture: Presentation, differential, diagnosis, treatment, outcome, confidence
- Example format:
  ```
  Case: 65M with chest pain and SOB
  Differential: ACS, PE, pneumonia, dissection
  Diagnosis: ACS (NSTEMI)
  Treatment: Dual antiplatelet, anticoagulation, catheterization
  Outcome: Successful PCI, recovery
  Your confidence at diagnosis: 80%
  ```

### Question 14: Diagnostic Accuracy
**Q**: "Over your last 100 patients with [common condition], what percentage did you diagnose correctly on first assessment?"

**Why**: Self-assessment of accuracy
- Expected: 85%+ overall, higher for common diagnoses
- Listen for: Which diagnoses are harder (atypical presentations)
- Follow-up: "Where do you miss cases?"

---

## Stage 6: Edge Cases & Special Populations (10 min)

### Question 15: Special Populations
**Q**: "How does your approach change for: elderly patients, children, pregnant women, immunocompromised, non-English speakers?"

**Why**: Reveals population-specific rules
- Expected: Different vital sign thresholds, different red flags, different presentation patterns
- Listen for: Safety considerations
- Example: "Elderly patient with subtle presentation = could be serious. Young patient with same = probably minor"

### Question 16: Atypical Presentations
**Q**: "What diagnoses commonly present atypically in your field? How do you catch them?"

**Why**: Captures must-not-miss patterns
- Expected: Silent MIs in diabetics, atypical appendicitis in elderly, etc.
- Listen for: What drives you to screen despite normal presentation
- Example: "Diabetics don't feel chest pain sometimes — I always check EKG if any symptoms"

### Question 17: Confidence Calibration
**Q**: "In what situations are you 95% confident in your diagnosis? When are you only 60% confident?"

**Why**: Captures confidence levels by scenario
- Expected: Different confidence for clear-cut vs atypical cases
- Listen for: When they want to observe vs treat empirically
- Example: "95% confident on textbook presentation, 70% on atypical, 50% on edge case → observe or escalate"

---

## Stage 7: Closing (5 min)

### Question 18: How to Automate?
**Q**: "If you had to teach a junior resident your diagnostic approach, what would you emphasize?"

**Why**: Forces explicit rule articulation
- Expected: Key decision points, must-not-miss diagnoses, red flags, when to escalate
- Listen for: Prioritization of learning

### Question 19: Blind Spots
**Q**: "What would break this approach? What challenges do you face?"

**Why**: Reveals gaps and limitations
- Expected: Atypical presentations, patient factors, resource constraints, new conditions
- Listen for: What worries the clinician

---

## Interview Captures Template

```json
{
  "metadata": {
    "domain": "healthcare",
    "specialty": "internal_medicine",
    "yearsExperience": 20,
    "patientVolume": "high (50+/week)"
  },

  "keyPresentations": [
    {
      "chief_complaint": "chest_pain",
      "differential": [
        { "diagnosis": "acute_coronary_syndrome", "probability": 0.10, "must_not_miss": true },
        { "diagnosis": "pulmonary_embolism", "probability": 0.05, "must_not_miss": true },
        { "diagnosis": "aortic_dissection", "probability": 0.02, "must_not_miss": true },
        { "diagnosis": "pneumonia", "probability": 0.15 },
        { "diagnosis": "musculoskeletal", "probability": 0.60 }
      ],
      "initial_screen": ["vitals", "EKG", "troponin"],
      "red_flags": ["hemodynamic_instability", "ECG_changes", "elevated_troponin"]
    }
  ],

  "diagnosticFrameworks": [
    {
      "name": "SIRS_criteria",
      "description": "Systemic Inflammatory Response Syndrome",
      "criteria": ["temp>38 or <36", "HR>90", "RR>20", "WBC>12 or <4"],
      "interpretation": "2+ = possible infection"
    }
  ],

  "riskScores": [
    { "name": "qSOFA", "use_case": "sepsis_risk", "description": "Quick SOFA" }
  ],

  "mustNotMissDiagnoses": [
    { "diagnosis": "sepsis", "red_flags": ["altered_mental_status", "lactate_elevated", "hypotension"] },
    { "diagnosis": "acute_abdomen", "red_flags": ["severe_pain", "rebound_tenderness", "shock"] }
  ],

  "population_adjustments": {
    "elderly": "Atypical presentations common. Lower vital sign thresholds.",
    "immunocompromised": "Broader differential. Rare diagnoses more likely."
  },

  "confidence_levels": {
    "straightforward_presentation": 0.92,
    "mixed_features": 0.75,
    "atypical_presentation": 0.60
  }
}
```

---

## Follow-Up Questions

- "What's the single most important finding in [common condition]?"
- "How do you handle diagnostic uncertainty?"
- "What percentage of your patients get escalated to specialists?"
- "What guidelines do you follow? How often do you deviate?"
- "What's the most common mistake junior doctors make in your field?"

---

## Notes for Interviewer

1. **Base rate thinking** — Listen for probability/likelihood thinking ("Most chest pain is MSK")
2. **Red flag identification** — Focus on must-not-miss diagnoses and how they're screened
3. **Atypical presentations** — These reveal deepest expertise and often-missed patterns
4. **Risk stratification** — How do they separate low-risk from high-risk?
5. **Treatment nuance** — Diagnosis is one thing, treatment decisions are another
6. **Outcomes validation** — Make sure their diagnoses actually matched what happened

---

**Next Step**: Create decision tree for top 5-10 presentations, validate against 50+ cases.
