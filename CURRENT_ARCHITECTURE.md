# Current Architecture (Pre-Supabase)

**Date:** October 14, 2025  
**Status:** Working (with auth issues)

## What's Working ✅

### 1. Frontend (Docusaurus)
- **Location:** `src/`, `docs/`, `static/`
- **Features:**
  - Homepage with KPI/Event/Dimension cards
  - Section pages (KPIs, Events, Dimensions) with Catalog component
  - Search functionality (client-side JSON)
  - Form pages for creating new items (`/kpis/new`, `/events/new`, `/dimensions/new`)
  - Edit mode (`?edit=1` query parameter)
  - Beautiful CSS with Roboto fonts
  - Dark mode support
- **Status:** ✅ Working well

### 2. Data Layer (YAML → MDX)
- **Location:** `data-layer/`, `scripts/generate-from-yaml.js`
- **Process:**
  1. YAML files in `data-layer/{kpis,events,dimensions}/`
  2. Generator script converts to MDX in `docs/`
  3. Generator creates JSON indexes in `static/indexes/`
- **Command:** `npm run generate`
- **Status:** ✅ Working perfectly

### 3. GitHub Pages Deployment
- **Location:** `.github/workflows/deploy.yml`
- **Process:**
  1. Push to main → GitHub Actions trigger
  2. Run `npm run generate`
  3. Build Docusaurus
  4. Deploy to GitHub Pages
- **URL:** `https://openkpis.org`
- **Status:** ✅ Working

### 4. Static Assets
- **Location:** `static/js/`, `static/img/`
- **Files:**
  - `copy-code.js` - Code block copy functionality
  - `github-signin-mount.js` - GitHub sign-in button
- **Status:** ✅ Working (after fixing paths)

---

## What's Partially Working ⚠️

### 5. GitHub OAuth Authentication
- **Service:** Cloudflare Worker at `oauthgithub.openkpis.org`
- **Flow:**
  1. User clicks "Sign in with GitHub"
  2. Redirects to GitHub OAuth
  3. GitHub redirects to Worker callback
  4. Worker creates session, sets cookie
  5. Redirects back to app
- **Issues:**
  - Cookie issues (SameSite, Domain)
  - Multiple clicks needed
  - Session not persisting reliably
- **Status:** ⚠️ Works but buggy

### 6. KPI/Event/Dimension Creation
- **Location:** `src/pages/{kpis,events,dimensions}/new.tsx`
- **Flow:**
  1. User fills form
  2. Submits to Cloudflare Worker
  3. Worker creates PR on GitHub
  4. Manual review & merge
  5. GitHub Actions regenerates site
- **Issues:**
  - Edit page 404 until PR merged and deployed
  - Filename mismatches (underscores vs hyphens)
  - Slow feedback loop (5-10 min from submit to live)
- **Status:** ⚠️ Works but slow

---

## Current Services

| Service | Purpose | URL | Cost | Status |
|---------|---------|-----|------|--------|
| **GitHub** | Repo, PRs, Actions | github.com/m-deval/openkpis-starter | Free | ✅ |
| **Cloudflare Worker** | OAuth, PR creation | oauthgithub.openkpis.org | Free | ⚠️ |
| **GitHub Pages** | Hosting | openkpis.org | Free | ✅ |
| **Domain** | openkpis.org | Cloudflare DNS | $12/yr | ✅ |

---

## Code Inventory

### Files to Keep (Reusable)
```
✅ src/components/Catalog.tsx         - KPI grid display
✅ src/components/MUITheme.tsx        - Material-UI theme
✅ src/pages/index.tsx                - Homepage
✅ src/pages/search.tsx               - Search page
✅ src/css/custom.css                 - All styling
✅ scripts/generate-from-yaml.js      - YAML → MDX generator
✅ docusaurus.config.ts               - Docusaurus config
✅ data-layer/**/*.yml                - All KPI/Event/Dimension data
✅ static/img/                        - Images
```

### Files to Replace (Auth & Forms)
```
🔄 src/pages/kpis/new.tsx             - Replace with Supabase version
🔄 src/pages/events/new.tsx           - Replace with Supabase version
🔄 src/pages/dimensions/new.tsx       - Replace with Supabase version
🔄 static/js/github-signin-mount.js   - Replace with Supabase auth
🔄 worker-*.js files                  - Replace with Supabase Edge Functions
```

### Files to Archive (Reference Only)
```
📦 WORKER_UPDATE_INSTRUCTIONS.md
📦 DEPLOY_WORKER_NOW.md
📦 worker-corrected.js
📦 worker-FINAL-FIX.js
📦 worker-ACTUAL-FIX.js
📦 worker-CROSS-DOMAIN-FIX.js
📦 worker-SIMPLE-TOKEN.js
```

---

## Reusable Components

### 1. UI Components (100% reusable)
- `Catalog.tsx` - Just change data source from JSON to Supabase
- `MUITheme.tsx` - No changes needed
- All CSS - No changes needed

### 2. Generator Script (Keep for GitHub sync)
- `generate-from-yaml.js` - Will be used for Supabase → GitHub sync
- Can be triggered by Supabase Edge Function

### 3. YAML Data (Migrate to Supabase)
- Parse all existing YAML files
- Import into Supabase database
- Keep YAML files for backup

---

## Migration Plan

### Phase 1: Parallel Systems (Safe)
- Keep current system running
- Add Supabase alongside
- New features use Supabase
- Old features still work

### Phase 2: Gradual Migration
- Migrate auth first
- Then migrate forms
- Then migrate data display
- Test each step

### Phase 3: Cutover
- Switch DNS or deployment
- Archive old Worker
- Keep GitHub as backup

---

## Rollback Plan

If Supabase migration fails:
1. `git checkout backup-pre-supabase`
2. Redeploy Worker (code saved in branch)
3. Site works as before

---

## Backup Locations

1. **Git Branch:** `backup-pre-supabase`
2. **Git Tag:** `v1.0-pre-supabase`
3. **This Document:** Architecture reference
4. **Worker Code:** All `worker-*.js` files committed

---

## What We Learned (Keep This Knowledge)

### Working Well:
- Docusaurus for documentation
- YAML → MDX generation
- Material-UI components
- CSS styling approach
- GitHub Pages deployment

### Needs Improvement:
- OAuth implementation (too complex)
- Session management (cookie issues)
- PR-based workflow (too slow for drafts)
- File-based queries (no search/filter)

---

## Success Criteria for Migration

Migration successful when:
- ✅ Auth works reliably (no multi-click issues)
- ✅ Forms submit instantly (no PR wait)
- ✅ Edit mode works immediately
- ✅ Search is fast
- ✅ GitHub contributions still tracked
- ✅ All existing KPIs/Events/Dimensions preserved

