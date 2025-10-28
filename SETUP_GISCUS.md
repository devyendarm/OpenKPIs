# Setting Up Giscus Comments

## Steps to Enable Comments on All Pages

### 1. Enable GitHub Discussions
1. Go to https://github.com/devyendarm/OpenKPIs/settings
2. In the left sidebar, click "General"
3. Scroll to "Features" section
4. Enable "Discussions"
5. Create a category called "Announcements"

### 2. Get Repository IDs
1. Go to https://giscus.app
2. Enter your repository: `devyendarm/OpenKPIs`
3. Select the "Announcements" category
4. Copy the generated code snippet
5. Find these values:
   - `data-repo-id="R_kgDO..."` 
   - `data-category-id="DIC_kwDO..."`

### 3. Update the Component
Edit `src/components/GiscusComments.tsx` and replace the placeholder IDs:
- Line 56: Replace `data-repo-id` with your actual repo ID
- Line 59: Replace `data-category-id` with your actual category ID

### 4. Commit and Push
```powershell
cd "C:\Users\mdevy\OneDrive\Projects\OpenKPIs\git_repo\openkpis-10-27-2025"

# Add the new component and updated generator
git add src/components/GiscusComments.tsx scripts/generate-from-yaml.js

# Commit
git commit -m "Add Giscus comments to all KPI/Metric pages"

# Push
git push origin main
```

### 5. Regenerate MDX Files
After pushing, you'll need to regenerate the MDX files locally or it will auto-generate on GitHub Actions:

```powershell
npm run generate
```

## What This Adds

- **Comments section** at the bottom of every KPI/Metric/Dimension/Event page
- **GitHub Discussions integration** - users need to sign in with GitHub to comment
- **Threaded discussions** organized by page
- **Reactions** enabled
- **Automatic metadata** sync with GitHub

## Benefits

1. **Community engagement** - users can ask questions about KPIs
2. **Feedback collection** - users can suggest improvements
3. **Knowledge sharing** - practitioners can share implementation tips
4. **Documentation** - answers become part of the page discussion

