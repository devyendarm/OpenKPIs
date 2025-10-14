# GitHub OAuth Configuration

**Date:** October 14, 2025  
**Status:** Configured  
**Privacy:** Local repo only - NOT for public GitHub

---

## 🔐 **GitHub App Details**

### **Application Information**
- **Project Name:** openKPIs
- **Homepage URL:** https://openkpis.org
- **Callback URL:** https://cpcabdtnzmanxuclewrg.supabase.co/auth/v1/callback

### **OAuth Credentials**
- **Client ID:** `Iv23liS3UnZQrSuGoVC8`
- **Client Secret:** `cd28d3da5ebec903829740a01a2d80076f67e0f7`

---

## ✅ **Supabase Configuration (Completed)**

### **In Supabase Dashboard:**
1. ✅ Authentication → Providers → GitHub (Enabled)
2. ✅ Client ID: `Iv23liS3UnZQrSuGoVC8`
3. ✅ Client Secret: `cd28d3da5ebec903829740a01a2d80076f67e0f7`
4. ✅ Redirect URL: `https://cpcabdtnzmanxuclewrg.supabase.co/auth/v1/callback`

---

## ✅ **GitHub App Settings (Completed)**

### **In GitHub:**
1. ✅ App URL: https://github.com/settings/apps/[your-app]
2. ✅ Homepage URL: `https://openkpis.org`
3. ✅ Authorization callback URL: `https://cpcabdtnzmanxuclewrg.supabase.co/auth/v1/callback`

---

## 🔄 **Authentication Flow**

### **User Sign In Process:**
1. User clicks "Sign in with GitHub" button
2. Frontend calls `supabase.auth.signInWithOAuth({ provider: 'github' })`
3. User redirected to GitHub OAuth page
4. User authorizes the openKPIs app
5. GitHub redirects to: `https://cpcabdtnzmanxuclewrg.supabase.co/auth/v1/callback`
6. Supabase processes the callback and creates session
7. User redirected back to `https://openkpis.org` (signed in)

### **What Gets Stored:**
- User's GitHub login
- User's name
- User's email
- User's avatar URL
- GitHub access token (stored securely by Supabase)

---

## 🧪 **Testing Checklist**

### **Local Development:**
- [ ] User can click "Sign in with GitHub"
- [ ] Redirected to GitHub authorization page
- [ ] After authorization, redirected back to app
- [ ] User info displayed (name, avatar)
- [ ] Sign out works

### **Production:**
- [ ] Same flow works on https://openkpis.org
- [ ] Session persists across page reloads
- [ ] User can create/edit KPIs when signed in

---

## 🔒 **Security Notes**

### **Credentials Storage:**
- ✅ Client Secret stored in Supabase (not in code)
- ✅ No credentials in Git repository
- ✅ Access tokens managed by Supabase
- ✅ Row Level Security enforces permissions

### **Scopes Requested:**
- `read:user` - Read user profile info
- `user:email` - Read user email addresses

**No write access to user's GitHub repositories!**

---

## 🔧 **Troubleshooting**

### **Error: "redirect_uri_mismatch"**
**Cause:** Callback URL doesn't match  
**Solution:** Verify callback URL in GitHub App settings matches:
```
https://cpcabdtnzmanxuclewrg.supabase.co/auth/v1/callback
```

### **Error: "invalid_client"**
**Cause:** Wrong Client ID or Secret  
**Solution:** Verify credentials in Supabase match GitHub App

### **Error: "User not signed in"**
**Cause:** Session not persisting  
**Solution:** Check Supabase client configuration in `src/lib/supabase.ts`:
```typescript
auth: {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
}
```

---

## 📞 **Support Resources**

- **GitHub OAuth Docs:** https://docs.github.com/en/apps/oauth-apps
- **Supabase Auth Docs:** https://supabase.com/docs/guides/auth
- **GitHub App Settings:** https://github.com/settings/apps

---

## 🔄 **Updating Credentials**

### **If You Need to Reset:**

1. **Generate New Client Secret:**
   - Go to GitHub App settings
   - Click "Generate a new client secret"
   - Copy the new secret

2. **Update in Supabase:**
   - Authentication → Providers → GitHub
   - Paste new client secret
   - Save

3. **Update Documentation:**
   - Update this file with new credentials

**Old secrets are immediately invalidated!**

---

**Status:** ✅ Configuration complete and documented

