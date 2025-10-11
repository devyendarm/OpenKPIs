# Cloudflare Worker Update Instructions

## Critical Issues Fixed

This update addresses four major issues with the GitHub OAuth authentication:

1. **Login button requiring multiple clicks** - Fixed by removing rapid re-rendering and using proper event listeners
2. **Redirect after login not working** - Fixed by ensuring correct callback URL configuration
3. **GitHub button not showing signed-in state** - Fixed by implementing global state management and event dispatching
4. **Form submit buttons not activating** - Fixed by syncing auth state between navbar component and forms

## Required Actions

### 1. Update GitHub OAuth App Settings

**CRITICAL**: Your GitHub OAuth App **MUST** have this exact callback URL:

```
https://oauthgithub.openkpis.org/oauth/callback
```

**Steps:**
1. Go to: https://github.com/settings/developers
2. Find your OAuth App (Client ID: `Iv23liWjfS8gKcxwgQTY`)
3. Click "Edit"
4. Set **Authorization callback URL** to: `https://oauthgithub.openkpis.org/oauth/callback`
5. Click "Update application"

### 2. Deploy Updated Worker Code

Copy the contents of `worker-corrected.js` to your Cloudflare Worker at `oauthgithub.openkpis.org`.

**Key Changes in Worker:**

#### Line 145 - Hardcoded Redirect URI
```javascript
// OLD (dynamic, can cause issues)
const redirectUri = url.origin + '/oauth/callback';

// NEW (explicit, matches GitHub app)
const redirectUri = 'https://oauthgithub.openkpis.org/oauth/callback';
```

#### Line 182 - Token Exchange Must Include redirect_uri
```javascript
body: JSON.stringify({
  client_id: env.GITHUB_CLIENT_ID,
  client_secret: env.GITHUB_CLIENT_SECRET,
  code,
  redirect_uri: 'https://oauthgithub.openkpis.org/oauth/callback', // MUST match authorization request
}),
```

#### Line 196 - Use Bearer Token Format
```javascript
// OLD
'Authorization': `token ${tokenData.access_token}`,

// NEW (modern standard)
'Authorization': `Bearer ${tokenData.access_token}`,
```

#### CORS Headers - Echo Origin
```javascript
// For requests with credentials: 'include'
'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
'Access-Control-Allow-Credentials': 'true',
```

#### Cookie Setting - Clear State Cookie
```javascript
'Set-Cookie': [
  `openkpis_session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Path=/`,
  `oauth_state=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/` // Clear state cookie
].join(', ')
```

### 3. Environment Variables Required

Ensure your Cloudflare Worker has these environment variables set:

- `GITHUB_CLIENT_ID` - Your GitHub OAuth App Client ID
- `GITHUB_CLIENT_SECRET` - Your GitHub OAuth App Client Secret  
- `SESSION_SIGNING_KEY` - A random secret key for signing session tokens (e.g., 32+ character random string)
- `REDIRECT_BASE` (optional) - Default redirect after OAuth (defaults to `https://openkpis.org`)

### 4. Test the OAuth Flow

After deploying:

1. **Clear browser cookies** for both `localhost:3000` and `oauthgithub.openkpis.org`
2. Go to `http://localhost:3000/kpis/new`
3. Click the "Sign In" button in the navbar (top right)
4. You should be redirected to GitHub authorization
5. After authorizing, you should return to `/kpis/new`
6. The navbar should show your GitHub username and avatar
7. The "Create KPI" button should be enabled

### 5. Expected Console Output

When working correctly, you should see these console logs:

```
GitHub Sign In script loaded
Found github-signin-root, initializing...
Checking authentication...
Auth response status: 200 (or 401 if not signed in)
Form: Checking authentication...
Form: Auth response status: 200
Form: User data received: {authenticated: true, login: "username", ...}
```

## Troubleshooting

### Issue: Still getting "redirect_uri mismatch" error

**Solution:** Double-check that:
- GitHub OAuth App callback URL is exactly `https://oauthgithub.openkpis.org/oauth/callback`
- Worker code has hardcoded `redirectUri` (line 145)
- Worker token exchange includes `redirect_uri` parameter (line 182)

### Issue: Button still requires multiple clicks

**Solution:** 
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Ensure script version is bumped to `?v=3` in `docusaurus.config.ts`

### Issue: User authenticated but forms don't recognize it

**Solution:**
- Check browser console for auth events: `openkpis-auth-change`
- Verify `window.__OPENKPIS_USER__` is set in browser console
- Ensure forms are listening for auth change events

### Issue: CORS errors in console

**Solution:**
- Worker must echo the `Origin` header in CORS responses when `credentials: 'include'` is used
- Cannot use wildcard `*` with credentials
- Check worker code lines for CORS header configuration

### Issue: Cookie not being set/sent

**Solution:**
- Cookies require `Secure` flag (HTTPS only)
- Local development: Use `http://localhost:3000` (browser allows localhost exception)
- Production: Must use HTTPS
- Check `SameSite=Lax` is set (not `None` for same-site requests)

## Files Changed in This Update

### Frontend (Docusaurus)
- `static/js/github-signin-mount.js` - Complete rewrite with proper event handling
- `src/pages/kpis/new.tsx` - Added auth event listeners
- `src/pages/events/new.tsx` - Added auth event listeners
- `src/pages/dimensions/new.tsx` - Added auth event listeners
- `src/pages/metrics/new.tsx` - Added auth event listeners
- `docusaurus.config.ts` - Bumped script version to v3

### Backend (Cloudflare Worker)
- `worker-corrected.js` - All OAuth endpoints updated with proper configuration

## Next Steps After Deployment

1. Test the complete flow: Sign In → Create KPI → Edit KPI
2. Verify session persists across page navigation
3. Test sign out (if implemented)
4. Check PR creation works correctly
5. Verify inline editing on existing KPI pages

## Support

If you encounter issues after following these steps:
1. Check browser console for errors
2. Check Cloudflare Worker logs
3. Verify GitHub OAuth App settings
4. Ensure all environment variables are set correctly
5. Try the flow in an incognito/private browser window

---

**Last Updated:** 2025-10-11
**Worker Version:** Corrected OAuth Flow v2
**Frontend Version:** GitHub Sign In v3

