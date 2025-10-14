# Database Setup Instructions

**Status:** Ready to execute  
**File:** `supabase-schema.sql`

---

## 🎯 **Execute Database Schema**

### **Method 1: Supabase SQL Editor (Recommended)**

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: **OpenKPIs**
3. Click **SQL Editor** in the left sidebar
4. Click **New query**
5. Open the file `supabase-schema.sql` from your project root
6. Copy ALL the content
7. Paste into the SQL Editor
8. Click **Run** (or press Ctrl+Enter)

**Expected output:**
```
NOTICE:  OpenKPIs database schema created successfully!
NOTICE:  Tables: kpis, events, dimensions, audit_log, contributors
NOTICE:  Indexes: Full-text search, status, created_by, tags
NOTICE:  RLS: Enabled with public read, authenticated write policies
NOTICE:  Ready for data migration!
```

---

### **Method 2: Supabase CLI (Alternative)**

If you have Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref cpcabdtnzmanxuclewrg

# Run the schema
supabase db push
```

---

## ✅ **Verify Schema Creation**

After running the SQL:

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - ✅ `kpis`
   - ✅ `events`
   - ✅ `dimensions`
   - ✅ `audit_log`
   - ✅ `contributors`

3. Click on any table to see the columns

---

## 🔍 **What the Schema Creates**

### **Tables**
- **kpis** - Key Performance Indicators
- **events** - Analytics events
- **dimensions** - Analytics dimensions
- **audit_log** - Complete change history
- **contributors** - User statistics

### **Features**
- ✅ Full-text search (using PostgreSQL tsvector)
- ✅ Row Level Security (RLS) policies
- ✅ Auto-updating contributor stats (triggers)
- ✅ Indexes for fast queries
- ✅ UUID primary keys
- ✅ Timestamp tracking

### **Security (RLS Policies)**
- ✅ Anyone can read published items
- ✅ Authenticated users can create drafts
- ✅ Users can only edit their own items
- ✅ Audit log is publicly readable
- ✅ Contributors stats are publicly readable

---

## 🐛 **Troubleshooting**

### **Error: "permission denied for schema public"**
**Solution:** You're not using the right credentials. Make sure you're logged into Supabase dashboard as the project owner.

### **Error: "relation already exists"**
**Solution:** Tables already created! You're good to go. Skip this step.

### **Error: "syntax error at or near..."**
**Solution:** Make sure you copied the ENTIRE `supabase-schema.sql` file, from the first line to the last.

---

## 📞 **Need Help?**

If you run into issues:
1. Check the SQL Editor output for specific error messages
2. Share the error message with me
3. I'll help you fix it!

---

**Once tables are created, tell me "tables created" and I'll continue with data migration!** 🚀

