# 🚀 Setup Guide - Build Your AI Skill System

## Quick Start

Your AI skill building system is now deployed to production at: **https://ieataiforbreakfast.com**

### Step 1: Configure LLM API (CRITICAL)

You have two options:

#### Option A: Use Anthropic API (Recommended for Testing)

1. Get your API key: https://console.anthropic.com/keys
2. Set it in Vercel environment variables:

```bash
# Add to production, preview, and development environments
vercel env add ANTHROPIC_API_KEY production main --value YOUR_KEY_HERE --yes
vercel env add ANTHROPIC_API_KEY preview --value YOUR_KEY_HERE --yes
vercel env add ANTHROPIC_API_KEY development --value YOUR_KEY_HERE --yes
```

Or via Vercel Dashboard:
1. Go to: https://vercel.com/tenxdevs/ieataiforbreakfast-com/settings/environment-variables
2. Click "Add New"
3. Key: `ANTHROPIC_API_KEY`
4. Value: Your Anthropic API key
5. Select all environments (Production, Preview, Development)
6. Click Save

#### Option B: Use Vercel AI Gateway (Recommended for Production)

```bash
# Run locally
vercel env pull

# This auto-provisions VERCEL_OIDC_TOKEN if set up in Vercel dashboard
# No manual API key needed - uses Vercel's managed authentication
```

### Step 2: Restart the Application

After adding the API key, redeploy:

```bash
vercel --prod
```

Or: Push to GitHub and it auto-deploys via Vercel's Git integration.

### Step 3: Test the System

1. Visit: https://ieataiforbreakfast.com
2. Click **"Build Your Skill"**
3. Select a domain (e.g., Finance)
4. Select a role (e.g., Credit Analyst)
5. Answer the interview questions
6. Watch the skill artifacts build in real-time:
   - ✓ Skill Insights (summary, key points, confidence)
   - ✓ Domain Concepts (extracted terminology)
   - ✓ Formulas & Tools (decision logic)
   - ✓ Compliance Rules (regulations, standards)
   - ✓ Next Step (adaptive questions)
7. View the complete generated skill with all artifacts

---

## What Gets Built

When you answer 10 interview questions, the system extracts:

| Artifact | Example | Used For |
|----------|---------|----------|
| **Heuristics** | "15+ years employment increases confidence by 10%" | Decision shortcuts |
| **Formulas** | "DTI = monthly_debt / (annual_income/12)" | Calculations |
| **Edge Cases** | "Bankruptcy 7+ years ago - approvable if DTI ≤ 0.35" | Special handling |
| **Concepts** | Credit Score, Debt-to-Income Ratio | Domain vocabulary |
| **Tools** | DTI Calculator, Credit Risk Scorer | Integration points |
| **Decision Tree** | IF score ≥ 750 → APPROVE; ELSE check DTI | Logic flow |
| **Confidence** | 95% straightforward, 75% borderline, 55% atypical | Certainty levels |
| **Inputs** | credit_score, monthly_debt, annual_income | Required data |

---

## File Structure

```
/app/extract/
├── page.tsx              ← Main "Build Your Skill" UI (4-step flow)
├── interview-flow.tsx    ← 3-column interview interface
└── page-new.tsx          ← Old version (can delete)

/app/api/interview/
├── submit-answer/route.ts      ← Answer analysis + extraction
└── complete-interview/route.ts ← Skill generation + export

/lib/
├── llm-interview-analyzer.ts   ← LLM extraction engine
├── skill-generator.ts          ← Skill assembly
├── knowledge-base.ts           ← Pre-loaded formulas, regulations
└── database-schema.ts          ← TypeScript interfaces
```

---

## API Endpoints

### 1. Submit Answer for Analysis

```bash
curl -X POST https://ieataiforbreakfast.com/api/interview/submit-answer \
  -H "Content-Type: application/json" \
  -d '{
    "interview_id": "550e8400-e29b-41d4-a716-446655440000",
    "question_id": "q1",
    "answer": "Your detailed answer here...",
    "domain": "finance",
    "role": "credit_analyst",
    "question_text": "Question text?"
  }'
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "summary": "...",
    "key_points": [...],
    "confidence": 0.85
  },
  "extracted": {
    "tools": [...],
    "regulations": [...],
    "formulas": [...],
    "concepts": [...]
  },
  "next_question": {...}
}
```

### 2. Complete Interview & Generate Skill

```bash
curl -X POST https://ieataiforbreakfast.com/api/interview/complete-interview \
  -H "Content-Type: application/json" \
  -d '{
    "interview_id": "...",
    "domain": "finance",
    "role": "credit_analyst",
    "all_answers": {...},
    "all_analyses": [...],
    "sme_name": "Expert Name",
    "sme_years_experience": 15
  }'
```

**Response:** Full SkillDocument + all exports (Claude Tools, OpenAI, JSON, TypeScript)

---

## Security Features

✅ **Active Protection:**
- Prompt injection detection (6 patterns)
- SQL injection prevention (3 patterns)
- Input sanitization (null bytes, Unicode escapes)
- 5000-character limit per answer
- 50KB max request size
- Server-side validation with no error leakage

---

## Environment Variables

### Required for Production

```bash
# LLM API (choose one)
ANTHROPIC_API_KEY=sk-ant-...  # Direct Anthropic API
# OR
VERCEL_OIDC_TOKEN=...         # Vercel AI Gateway (auto-provisioned)

# Optional: Supabase (for persistence)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Local Development

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
# Edit .env.local with your API keys
npm run dev
```

---

## Troubleshooting

### "Failed to analyze answer. Make sure ANTHROPIC_API_KEY is set"

**Solution:**
1. Add `ANTHROPIC_API_KEY` to Vercel environment variables (see Setup Step 1)
2. Redeploy: `vercel --prod`
3. Wait 30 seconds for deployment to be ready

### No artifacts appearing in interview

**Solution:**
1. Check that API key is configured
2. Check browser console for errors (F12)
3. Try a different answer with more detail
4. Refresh the page and try again

### System is slow

**Solutions:**
- LLM analysis takes 5-15 seconds per answer (normal)
- Reduce answer length if analyzing takes too long
- Try shorter, more focused answers

---

## Next Features (Roadmap)

- [ ] Durable workflows (Workflow DevKit) for long-running extractions
- [ ] Database persistence (Supabase integration)
- [ ] Skill marketplace (publish & earn)
- [ ] Team collaboration (extract with multiple SMEs)
- [ ] Version control (track skill improvements)
- [ ] A/B testing (validate skills against historical data)
- [ ] Voice input (spoken answers transcribed)

---

## Support

- **API Issues?** Check Anthropic API status: https://status.anthropic.com
- **Deployment Issues?** Check Vercel dashboard: https://vercel.com/tenxdevs/ieataiforbreakfast-com
- **Feature Requests?** Open an issue on GitHub

---

**Status:** ✅ Production Ready | Deployed 2026-04-16
