# 📚 SMETP Project Handoff - Documentation Index

> **Not in this repo (October 2026).** Maintainer handoff for a product monorepo, mirrored here. Commands in this file (`npm install`, `npm run dev`, and the rest) do not apply to a clone of the public protocol repo. There are no published npm packages here, and this file is not a release announcement.

**Project**: Subject Matter Expertise Transfer Protocol (SMETP)
**Status**: Handoff notes only. Not a statement that this public repo is production-ready.
**URL**: https://ieataiforbreakfast.com
**Last Updated**: 2026-04-16

---

## 📖 Documentation Files

This project includes comprehensive documentation to help you take over with Cursor:

### 1. **PROJECT_HANDOFF.md** ← START HERE
**Purpose**: Complete architectural decisions, implementation details, and next steps
**What You'll Learn**:
- Final architectural decisions (LLM provider, state management, security, database)
- Tech stack & dependencies
- Project file structure
- API endpoint specifications
- Environment variables setup
- How to run locally
- Key implementation details
- Common workflows (add domains, scale users)
- Production monitoring
- Security checklist
- Next phases & features

**When to Read**: First - establishes the overall project structure and decisions

---

### 2. **ARCHITECTURE.md**
**Purpose**: System diagrams, data flow, and design decisions summary
**What You'll Learn**:
- System architecture diagram (ASCII art)
- Data flow: Answer → Analysis → Artifacts
- LLM analysis with Zod schema
- Pattern-based extraction (formulas, regulations, concepts)
- Database schema (TypeScript interfaces)
- Deployment pipeline diagram
- Key design decisions summary table
- How to extend (add domains, change models, scale)
- Quick links to key resources

**When to Read**: Second - visual understanding of how everything connects

---

### 3. **DEPLOYMENT.md** ← MOST PRACTICAL FOR CI/CD
**Purpose**: Practical guide to deployments and CI/CD pipeline
**What You'll Learn**:
- How the CI/CD pipeline works (automatic on git push)
- Environment variables setup and management
- Deployment workflow (feature development process)
- Monitoring deployments
- Troubleshooting common issues
- Rollback procedures
- Quick reference of common commands
- Workflow examples (fix bug, add domain, update API key)

**When to Read**: When deploying or troubleshooting - pure practical guide

---

### 4. **SETUP.md**
**Purpose**: Initial setup and API configuration guide
**What You'll Learn**:
- Quick start to get the system deployed
- API key configuration (Anthropic API)
- Step-by-step setup instructions
- Troubleshooting guide
- Environment variables documentation
- API endpoint examples with curl

**When to Read**: If setting up from scratch or configuring new environments

---

### 5. **IMPLEMENTATION_GUIDE.md**
**Purpose**: Deep technical details of each component
**What You'll Learn**:
- Database schema in detail
- API endpoint specifications with examples
- Security implementation details
- Knowledge base structure
- Skill document JSON format
- Export format specifications

**When to Read**: When modifying specific components or understanding internals

---

## 🚀 Quick Navigation

### I want to...

**Understand what was built**
→ Read: PROJECT_HANDOFF.md (sections 1-5)

**Understand how everything works**
→ Read: ARCHITECTURE.md

**Deploy changes to production**
→ Read: DEPLOYMENT.md

**Set up for the first time**
→ Read: SETUP.md

**Add a new domain**
→ Read: PROJECT_HANDOFF.md section 10 (Common Workflows)

**Scale to more users**
→ Read: PROJECT_HANDOFF.md section 10 (Scaling)

**Debug a production issue**
→ Read: DEPLOYMENT.md section 5 (Troubleshooting)

**Understand API details**
→ Read: IMPLEMENTATION_GUIDE.md

**Understand the interview flow**
→ Read: ARCHITECTURE.md + PROJECT_HANDOFF.md section 9

---

## 📋 Key Files to Know

### Frontend
- `app/page.tsx` - Homepage with marketing
- `app/extract/page.tsx` - Main extraction flow (4-step UI)
- `app/extract/interview-flow.tsx` - 3-column interview interface

### Backend/API
- `app/api/interview/submit-answer/route.ts` - Answer analysis API
- `app/api/interview/complete-interview/route.ts` - Skill generation API

### Core Logic
- `lib/llm-interview-analyzer.ts` - LLM analysis engine (400+ lines)
- `lib/skill-generator.ts` - Skill assembly from interview data
- `lib/knowledge-base.ts` - Pre-loaded domain formulas, regulations
- `lib/database-schema.ts` - TypeScript interfaces
- `lib/domains.ts` - Domain definitions (Finance, Healthcare, Legal)

### Configuration
- `.env.local` - Local environment variables (git-ignored)
- `next.config.ts` - Next.js configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration

---

## 🔑 Key Decisions Made

### 1. LLM Provider: Anthropic (Direct SDK)
- Using `@ai-sdk/anthropic` with `anthropic('claude-opus-4.5')`
- Configured via `ANTHROPIC_API_KEY` environment variable
- NOT using Vercel AI Gateway (simpler, user already had key configured)

### 2. State Management: In-Memory During Interview
- React component state for real-time updates
- No database reads/writes during interview
- Optional database persistence on completion

### 3. Security: Server-Side Injection Detection
- 6 prompt injection patterns detected and rejected
- 3 SQL injection patterns detected and rejected
- Zod schema validation on all inputs
- Max 5000 chars/answer, 50KB total request size

### 4. Extraction: Hybrid (LLM + Pattern Matching)
- Claude for semantic understanding and analysis
- Regex patterns for formula detection
- Keyword matching for regulations and concepts
- Pre-loaded domain knowledge bases

### 5. Deployment: Vercel with Automatic CI/CD
- Git push → automatic build & deploy
- Zero configuration needed
- Environment variables managed by Vercel
- Global CDN distribution, ~30 second deployments

---

## 🎯 Current Status

The checklist below was written for the product monorepo on 2026-04-16. It was **not** re-verified when these notes were mirrored into the public protocol repo. Do not read it as a claim that npm packages, chat adapters, or a finished capture flow ship from this repository.

The original handoff marked these as done: homepage, extract flow, LLM analysis, real-time artifact extraction, UI, security hardening, Vercel deploys. Treat that list as unverified notes from the other repo.

❌ **Not Yet Implemented**
- Database persistence (optional for MVP)
- User authentication
- Skill marketplace
- Team collaboration features
- Advanced analytics

---

## 🛠️ Getting Started with Cursor

### Step 1: Review Documentation
1. Read `PROJECT_HANDOFF.md` (30 min)
2. Skim `ARCHITECTURE.md` (15 min)
3. Bookmark `DEPLOYMENT.md` for later reference

### Step 2: Set Up Local Development
```bash
# Pull latest from GitHub (if not already)
git pull origin main

# Install dependencies
npm install

# Pull environment variables from Vercel
vercel env pull

# Start development
npm run dev

# Visit http://localhost:3000
```

### Step 3: Make Your First Change
```bash
# Create a feature branch
git checkout -b feature/test-change

# Make a small change (e.g., update homepage text)
# Edit app/page.tsx

# Test locally
npm run dev
# Visit http://localhost:3000

# Commit and push
git add .
git commit -m "test: verify CI/CD pipeline works"
git push origin feature/test-change

# Merge to main (via GitHub or command line)
git checkout main
git merge feature/test-change
git push

# Watch it deploy automatically at https://ieataiforbreakfast.com
```

### Step 4: Read the Code
- Start with `app/extract/page.tsx` (user flow)
- Then `app/extract/interview-flow.tsx` (UI)
- Then `lib/llm-interview-analyzer.ts` (LLM logic)
- Then `app/api/interview/submit-answer/route.ts` (API)

---

## 📞 Support & Reference

### Common Tasks

**Deploy changes**
```bash
git add .
git commit -m "feat: description"
git push origin main
# Automatic deployment in 30 seconds
```

**Update environment variables**
```bash
vercel env add NAME --value VALUE
vercel deploy --prod --yes
```

**View production logs**
```bash
vercel logs --follow
```

**Run tests**
```bash
npm test
```

### Key Contacts/Resources
- **Vercel Dashboard**: https://vercel.com/tenxdevs/ieataiforbreakfast-com
- **Anthropic Console**: https://console.anthropic.com
- **GitHub Repo**: Check your GitHub account
- **Production URL**: https://ieataiforbreakfast.com

---

## 🎓 Learning Path

### Day 1: Understand the System
1. ✅ Read PROJECT_HANDOFF.md sections 1-3
2. ✅ Read ARCHITECTURE.md system diagram
3. ✅ Visit https://ieataiforbreakfast.com and test the system
4. ✅ Read DEPLOYMENT.md for CI/CD understanding

### Day 2: Set Up Local Environment
1. ✅ `git clone` the repo (or navigate to existing)
2. ✅ `npm install`
3. ✅ `vercel env pull`
4. ✅ `npm run dev`
5. ✅ Test locally at http://localhost:3000

### Day 3: Understand the Code
1. ✅ Read app/extract/page.tsx (main flow)
2. ✅ Read app/extract/interview-flow.tsx (UI component)
3. ✅ Read lib/llm-interview-analyzer.ts (LLM logic)
4. ✅ Read app/api/interview/submit-answer/route.ts (API)

### Day 4: Make Your First Change
1. ✅ Create feature branch
2. ✅ Make a small change (fix typo, update text, etc)
3. ✅ Test locally
4. ✅ Push to GitHub
5. ✅ Merge to main
6. ✅ Watch it deploy automatically

### Day 5+: Start Building
- Add a new domain (Finance, Healthcare, Legal, Insurance, etc.)
- Add database persistence (Supabase)
- Implement user authentication (Clerk)
- Add skill marketplace features
- Scale to handle more concurrent users

---

## 📊 Architecture Summary

```
User Browser
    ↓
Next.js App Router (app/extract/page.tsx)
    ├─ Step 1: Domain Selection
    ├─ Step 2: Role Selection
    ├─ Step 3: Interview (interview-flow.tsx - 3 columns)
    └─ Step 4: Completion (download skill)
    ↓
API Routes (/api/interview/...)
    ├─ Validate input (Zod)
    ├─ Detect injections (regex)
    └─ Call LLM
    ↓
LLM Analysis Engine
    ├─ Claude Opus 4.5 (semantic analysis)
    ├─ Formula Detector (regex patterns)
    ├─ Regulation Researcher (keyword matching)
    └─ Concept Extractor (keyword matching)
    ↓
Knowledge Bases
    ├─ Pre-loaded formulas
    ├─ Pre-loaded regulations
    └─ Pre-loaded concepts
    ↓
Response back to UI
    ├─ analysis (summary, key_points, confidence)
    ├─ extracted (tools, regulations, formulas, concepts)
    └─ next_question (adaptive follow-up)
    ↓
Display in 3-column layout
    ├─ Left: Current question
    ├─ Middle: Skill Insights
    └─ Right: Extracted Artifacts
```

---

## ✨ You're Ready!

All documentation is in place. The system is production-ready. You have everything needed to:

✅ Understand the project
✅ Deploy changes via Vercel CI/CD
✅ Add new features
✅ Debug issues
✅ Scale the system

**Start with PROJECT_HANDOFF.md and you'll have everything you need.**

Good luck with Cursor! 🚀

---

**Questions?** Check the documentation index above or search for specific topics in each file.
