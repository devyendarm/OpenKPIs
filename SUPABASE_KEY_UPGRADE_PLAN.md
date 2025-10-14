# Supabase Key Upgrade Plan

**Date:** October 14, 2025  
**Status:** Using JWT "Legacy" Keys (Current Standard)  
**Privacy:** Local repo only - NOT for public GitHub

---

## 🔑 **Current Key Setup**

### **Keys in Use (JWT "Legacy" Keys)**
- ✅ **Anon Key (JWT):** Used in frontend for public access
- ✅ **Service Role Key (JWT):** Used for admin/migration operations
- ✅ **Location:** `.env.local` file (gitignored)

### **Why "Legacy" Keys?**
Despite the "Legacy" label in Supabase UI, these are:
- ✅ The **current standard** for `@supabase/supabase-js` SDK
- ✅ Used by all Supabase features (Auth, Database, Storage, Realtime)
- ✅ Recommended in all official Supabase documentation
- ✅ **NOT deprecated** - "Legacy" is a UI label issue, not a deprecation notice

---

## 📋 **Alternative Keys Available**

### **New "Publishable" Keys**
Supabase now shows these in the dashboard:
- **Public:** `sb_publishable_XZVWe0LAVPBp9HdDfCIa5g_3MpTm1Rc`
- **Secret:** `sb_publishable_XZVWe0LAVPBp9HdDfCIa5g_3MpTm1Rc`

**Purpose:**
- For Supabase Studio embeds
- For specific client-side-only features
- **NOT a replacement** for JWT keys for database/auth operations

**Compatibility:**
- ❌ Do NOT work with `@supabase/supabase-js` main SDK
- ❌ Cannot be used for database CRUD operations
- ❌ Cannot be used for authentication

---

## 🛡️ **Future-Proofing Strategy**

### **Current Implementation (Future-Proof)**

Our code uses environment variables everywhere:

```typescript
// src/lib/supabase.ts
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**Benefits:**
- ✅ If Supabase changes key format → just update `.env.local`
- ✅ No code changes needed
- ✅ Keys never hardcoded
- ✅ Easy to rotate/update

---

## 📅 **Migration Plan (If Ever Needed)**

### **Scenario 1: Supabase Deprecates JWT Keys**

**Likelihood:** Very low (these are the current standard)

**If it happens:**
1. Supabase will announce with 12+ months notice
2. They'll provide migration tools
3. We update `.env.local` with new keys
4. Potentially update SDK version (`npm update @supabase/supabase-js`)
5. Test all auth/database operations
6. Deploy

**Downtime:** None (can test in parallel)

---

### **Scenario 2: New Key Format Introduced**

**Likelihood:** Medium (but will be additive, not replacement)

**If it happens:**
1. Monitor Supabase changelog
2. Evaluate new key benefits
3. Test in development environment
4. Update `.env.local` if beneficial
5. No rush - JWT keys will remain supported

---

## 🚨 **Warning Signs to Watch For**

Monitor Supabase announcements for:
- ❌ "JWT keys will be deprecated on [date]"
- ❌ "Migrate to new authentication system by [date]"
- ❌ Breaking changes in `@supabase/supabase-js` major versions

**Where to watch:**
- https://github.com/supabase/supabase/releases
- https://supabase.com/docs/guides/platform/going-into-prod
- Supabase dashboard notifications

---

## ✅ **Current Decision: Use JWT Keys**

**Rationale:**
1. ✅ Official recommendation for `@supabase/supabase-js`
2. ✅ All documentation uses these
3. ✅ Fully supported and maintained
4. ✅ Work with all Supabase features
5. ✅ Environment variable approach makes future migration trivial

**Risk Assessment:** **LOW**
- Supabase won't break existing apps
- Migration path will be provided if ever needed
- Our architecture supports easy key rotation

---

## 🔐 **Key Security Best Practices**

### **Current Setup (Secure)**
- ✅ Keys in `.env.local` (gitignored)
- ✅ Service role key NEVER exposed to frontend
- ✅ Anon key safe for public use (protected by RLS)
- ✅ No keys in Git history
- ✅ No keys in code files

### **If Keys Ever Compromised**
1. Go to Supabase Dashboard → Settings → API
2. Click "Reset API Keys"
3. Copy new keys
4. Update `.env.local`
5. Redeploy frontend
6. Old keys instantly invalidated

**Downtime:** ~5 minutes for redeployment

---

## 📊 **Key Rotation Schedule**

**Recommended:** Rotate keys annually for security best practices

**Process:**
1. Jan 15 each year: Reset Supabase API keys
2. Update `.env.local` locally
3. Update production environment variables
4. Test authentication flow
5. Deploy
6. Verify all features working

**Next scheduled rotation:** January 15, 2026

---

## 🎯 **Action Items**

### **Immediate (Completed)**
- ✅ Document current key decision
- ✅ Confirm keys in `.env.local`
- ✅ Verify `.gitignore` protects keys

### **Ongoing**
- ⏰ Monitor Supabase changelog (quarterly)
- ⏰ Test key rotation procedure (annually)
- ⏰ Update SDK dependencies (when stable versions released)

### **If Migration Needed (Future)**
- [ ] Review new key documentation
- [ ] Test in development environment
- [ ] Update all environment files
- [ ] Update this document with migration notes

---

## 📞 **Support Resources**

- **Supabase Docs:** https://supabase.com/docs
- **SDK GitHub:** https://github.com/supabase/supabase-js
- **Community:** https://github.com/supabase/supabase/discussions
- **Status Page:** https://status.supabase.com/

---

## ✍️ **Document History**

- **2025-10-14:** Initial documentation - chose JWT keys over Publishable keys
- **Future:** Will update if Supabase announces key changes

---

**Conclusion:** Using JWT "Legacy" keys is the correct, future-proof choice. Our environment-based approach ensures easy migration if ever needed.

