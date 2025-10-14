# Supabase Setup Guide

**Date:** October 14, 2025  
**Status:** In Progress

---

## ✅ Step 1: Create Supabase Project (IN PROGRESS)

You're creating: `openkpis-production`

Once ready, you'll get:
- Project URL: `https://xxxxx.supabase.co`
- Anon (public) key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Service role key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep secret!)

---

## 📍 Where to Find Your Keys

After project is created:
1. Click on your project
2. Go to **Settings** (gear icon, bottom left)
3. Click **API** in the sidebar
4. You'll see:
   - **Project URL** - Copy this
   - **Project API keys**:
     - `anon` `public` - Safe for frontend (copy this)
     - `service_role` - Server-side only (copy this, keep secret!)

---

## 🔐 Environment Variables

Create `.env.local` file with these (I'll create it for you):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GITHUB_TOKEN=ghp_your_github_token_here
```

---

## ⏭️ Next Steps

After you share your keys, I'll:
1. ✅ Create `.env.local` file
2. ✅ Set up database schema (tables for KPIs, Events, Dimensions)
3. ✅ Enable GitHub OAuth in Supabase
4. ✅ Migrate existing YAML data to database
5. ✅ Update frontend code to use Supabase
6. ✅ Test everything

---

## 🎯 What to Share with Me

Once your Supabase project is ready:

```
Project URL: https://xxxxx.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note:** Don't share the `service_role` key in chat - I'll guide you to add it to `.env.local` directly.

---

## 🚀 Ready?

Tell me when your Supabase project is ready!

