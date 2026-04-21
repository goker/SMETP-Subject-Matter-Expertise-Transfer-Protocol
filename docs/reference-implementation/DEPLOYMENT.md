# Deployment & CI/CD Pipeline Guide

**Last Updated**: 2026-04-16
**Platform**: Vercel (automatic CI/CD)
**Status**: Production Ready ✅

---

## Quick Start

Your project is **already deployed** at **https://ieataiforbreakfast.com**

To continue developing:

```bash
# 1. Make changes locally
npm run dev

# 2. Test your changes
# Visit http://localhost:3000

# 3. Commit and push
git add .
git commit -m "feat: add new feature"
git push origin main

# 4. Vercel automatically builds & deploys
# Live at https://ieataiforbreakfast.com within 30 seconds
```

---

## 1. HOW THE CI/CD PIPELINE WORKS

Every push to GitHub automatically triggers deployment:

```
git push origin main
    ↓
GitHub receives code
    ↓
Vercel webhook triggered
    ↓
Vercel builds your project:
├─ npm install
├─ npm run build (Next.js + Turbopack)
├─ TypeScript checking
└─ Static page generation
    ↓
Deploy to production
    ↓
Alias to https://ieataiforbreakfast.com
    ↓
Live ✅ (30 seconds total)
```

### Zero Configuration
- ✅ No `.github/workflows` needed
- ✅ No build scripts to manage
- ✅ Vercel auto-detects Next.js
- ✅ Automatic environment variable injection
- ✅ Automatic global CDN distribution

---

## 2. ENVIRONMENT VARIABLES

### Current Setup

Your project uses: **`ANTHROPIC_API_KEY`**

```bash
# This is already configured in Vercel for:
# - Production
# - Preview (testing branches)
# - Development (local dev)
```

### Set/Update Variables

**Via CLI**:
```bash
# Add new variable
vercel env add ANTHROPIC_API_KEY production --value sk-ant-...

# Update existing variable
vercel env rm ANTHROPIC_API_KEY production
vercel env add ANTHROPIC_API_KEY production --value [new-key]

# List all variables
vercel env ls

# Pull to local .env.local
vercel env pull
```

**Via Dashboard**:
1. Visit: https://vercel.com/tenxdevs/ieataiforbreakfast-com/settings/environment-variables
2. Click "Add New" or edit existing
3. Set environment(s): Production, Preview, Development
4. Click "Save"

### Pull Variables for Local Development

```bash
# Download all Vercel env vars to .env.local
vercel env pull

# Now run locally with production values
npm run dev
```

**Important**: `.env.local` is in `.gitignore` - never commit it!

---

## 3. DEPLOYMENT WORKFLOW

### Typical Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/add-insurance-domain

# 2. Make changes and test locally
npm run dev
# Test at http://localhost:3000

# 3. Commit and push
git add .
git commit -m "feat: add Insurance domain with Claims Adjuster role"
git push origin feature/add-insurance-domain

# 4. Vercel creates PREVIEW deployment
# https://ieataiforbreakfast-[hash]-tenxdevs.vercel.app
# Test the preview URL

# 5. Merge to main
git checkout main
git merge feature/add-insurance-domain
git push origin main

# 6. Vercel deploys to PRODUCTION
# https://ieataiforbreakfast.com ✅
```

### Manual Deployment (If Needed)

```bash
# Deploy immediately to production
vercel --prod --yes

# Deploy to preview first
vercel --yes
```

---

## 4. MONITORING DEPLOYMENTS

### View Deployment Status

```bash
# Current status
vercel status

# List recent deployments
vercel list

# Get deployment details
vercel inspect https://ieataiforbreakfast.com

# Stream live logs
vercel logs --follow
```

### Via Dashboard

Visit: https://vercel.com/tenxdevs/ieataiforbreakfast-com/deployments

Shows:
- Build status (✓ Success / ✗ Failed)
- Build time
- Commit info
- Production URL
- Performance metrics

---

## 5. TROUBLESHOOTING

### Build Fails

```bash
# 1. Check Vercel logs
vercel logs --follow

# 2. Build locally to find issue
npm run build

# 3. Check for TypeScript errors
npx tsc --noEmit

# 4. Fix and redeploy
git add .
git commit -m "fix: resolve build error"
git push origin main
```

### API Returns 500 Error

```bash
# 1. Check runtime logs
vercel logs --follow

# 2. Verify ANTHROPIC_API_KEY is set
vercel env ls | grep ANTHROPIC_API_KEY

# 3. If key is missing or wrong
vercel env rm ANTHROPIC_API_KEY production
vercel env add ANTHROPIC_API_KEY production --value [correct-key]

# 4. Redeploy
vercel deploy --prod --yes
```

### Feature Works Locally But Not in Production

```bash
# 1. Pull production env vars
vercel env pull

# 2. Start local dev with production vars
npm run dev

# 3. Try to reproduce the issue
# If it fails, issue is with env vars
# If it works, issue might be with build differences

# 4. Rebuild production
vercel deploy --prod --yes
```

---

## 6. ROLLBACK

### If Something Goes Wrong

**Option 1: Revert the Commit**
```bash
# Find the bad commit
git log --oneline

# Revert it
git revert [bad-commit-hash]
git push origin main

# Vercel rebuilds and redeploys automatically
```

**Option 2: Promote Previous Deployment**
```bash
# List all deployments
vercel list

# Find the good one
# Promote it to production
vercel promote [deployment-id]
```

---

## 7. QUICK REFERENCE

### Most Common Commands

```bash
npm run dev              # Start local dev
npm run build           # Build for production
npm start              # Run production build locally
vercel --prod --yes    # Deploy immediately
vercel status          # Check status
vercel logs --follow   # View logs
vercel env pull        # Download env vars
vercel env add KEY VAL # Add env variable
vercel list            # List deployments
```

### Key URLs

| Purpose | URL |
|---------|-----|
| **Production** | https://ieataiforbreakfast.com |
| **SMETP protocol (open source)** | https://github.com/goker/SMETP-Subject-Matter-Expertise-Transfer-Protocol |
| **Vercel Dashboard** | https://vercel.com/tenxdevs/ieataiforbreakfast-com |
| **Deployments** | https://vercel.com/tenxdevs/ieataiforbreakfast-com/deployments |
| **Env Variables** | https://vercel.com/tenxdevs/ieataiforbreakfast-com/settings/environment-variables |
| **Anthropic Console** | https://console.anthropic.com |

---

## 8. WORKFLOW EXAMPLES

### Example 1: Quick Fix

```bash
git checkout -b fix/typo
# Fix the typo
git commit -am "fix: typo in homepage"
git push origin fix/typo
# Test preview URL
git checkout main
git merge fix/typo
git push
# Live in production
```

### Example 2: Add New Domain

```bash
git checkout -b feature/insurance
# Edit lib/domains.ts
# Edit lib/knowledge-base.ts
# Edit lib/llm-interview-analyzer.ts
npm run build  # Verify no errors
git commit -am "feat: add Insurance domain"
git push origin feature/insurance
# Test at preview URL
git checkout main && git merge feature/insurance && git push
# Live in production
```

### Example 3: Update API Key

```bash
# Get new key from Anthropic console
vercel env rm ANTHROPIC_API_KEY production
vercel env add ANTHROPIC_API_KEY production --value sk-ant-[new]

# OR via Dashboard (easier):
# https://vercel.com/tenxdevs/ieataiforbreakfast-com/settings/environment-variables
# Edit ANTHROPIC_API_KEY and save

# Redeploy to apply
vercel deploy --prod --yes
```

---

## 9. SUMMARY

✅ **Fully Automated**: Push → Build → Deploy → Live
✅ **Zero Config**: Vercel handles everything
✅ **Environment Variables**: Via CLI or Dashboard
✅ **Rollback Ready**: Promote previous deployments
✅ **Monitoring**: Real-time logs and status

Your CI/CD pipeline is **production-ready**. Just:
1. Make changes locally (`npm run dev`)
2. Test thoroughly
3. Commit and push (`git push origin main`)
4. Vercel automatically deploys within 30 seconds

That's it! 🚀
