// FINAL FIX - Cross-domain cookie handling for localhost and production
// The issue: Cookies set on oauthgithub.openkpis.org can't be read by localhost:3000
// Solution: Use SameSite=None with Secure for cross-origin cookies

const sessions = new Map();

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        headers: {
          'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true',
        }
      });
    }

    // Route handling
    if (path === '/login') {
      return handleLogin(request, env);
    } else if (path === '/callback') {
      return handleCallback(request, env);
    } else if (path === '/oauth/login') {
      return handleOAuthLogin(request, env);
    } else if (path === '/oauth/callback') {
      return handleOAuthCallback(request, env);
    } else if (path === '/me') {
      return handleMe(request, env);
    } else if (path === '/content') {
      return handleContent(request, env);
    } else if (path === '/commit') {
      return handleCommit(request, env);
    } else if (path === '/') {
      const cookie = request.headers.get('Cookie');
      const sessionId = getSessionId(cookie);
      
      if (sessionId && sessions.has(sessionId)) {
        const user = sessions.get(sessionId);
        return new Response(`👋 Welcome, ${user.login}! You are logged in.`, {
          headers: { 'Content-Type': 'text/html' },
        });
      }
      
      return new Response('<h1>Protected Content</h1><a href="/login">Log in with GitHub</a>', {
        headers: { 'Content-Type': 'text/html' },
      });
    } else {
      return new Response('Not Found', { status: 404 });
    }
  },
};

function handleLogin(request, env) {
  const url = new URL(request.url);
  const redirect_uri = url.origin + '/callback';
  
  const authUrl = 'https://github.com/login/oauth/authorize' +
    `?client_id=${env.GITHUB_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
    '&scope=read:user'; 

  return new Response(null, {
    status: 302,
    headers: { 'Location': authUrl }
  });
}

async function handleCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Missing authorization code.', { status: 400 });
  }

  const redirect_uri = url.origin + url.pathname; 

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code: code,
      redirect_uri: redirect_uri, 
    }),
  });

  const tokenData = await tokenResponse.json();
  if (tokenData.error) {
    console.error('GitHub Token Exchange Error:', tokenData.error, tokenData.error_description);
    return new Response(
        `Authentication Failed: ${tokenData.error_description || tokenData.error}.`, 
        { status: 400 }
    );
  }

  const accessToken = tokenData.access_token;

  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'Cloudflare-Worker',
      'Accept': 'application/vnd.github.com',
    },
  });

  const userData = await userResponse.json();

  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, userData); 

  const response = new Response(null, {
    status: 302,
    headers: {
      'Location': url.origin,
      'Set-Cookie': `session_id=${sessionId}; HttpOnly; Secure; Path=/`
    }
  });

  return response;
}

async function handleOAuthLogin(request, env) {
  const state = generateRandomString(32);
  const url = new URL(request.url);
  
  const redirectUri = 'https://oauthgithub.openkpis.org/oauth/callback';
  const returnUrl = url.searchParams.get('return_url') || (env.REDIRECT_BASE || 'https://openkpis.org');
  const stateWithReturnUrl = `${state}:${btoa(returnUrl)}`;
  
  const authUrl = 'https://github.com/login/oauth/authorize' +
    `?client_id=${env.GITHUB_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    '&scope=public_repo' +
    `&state=${stateWithReturnUrl}`;

  console.log('OAuth Login - Redirect URI:', redirectUri);
  console.log('OAuth Login - Return URL:', returnUrl);

  const response = new Response(null, {
    status: 302,
    headers: {
      'Location': authUrl,
      // CRITICAL FIX: SameSite=None allows cross-origin cookies
      'Set-Cookie': `oauth_state=${stateWithReturnUrl}; HttpOnly; Secure; SameSite=None; Max-Age=600; Path=/`
    }
  });
  
  return response;
}

async function handleOAuthCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieState = getCookieValue(request, 'oauth_state');

  console.log('OAuth Callback - Code:', code ? 'present' : 'missing');
  console.log('OAuth Callback - State:', state);
  console.log('OAuth Callback - Cookie State:', cookieState);

  if (!code || !state || state !== cookieState) {
    return new Response('Invalid OAuth callback - state mismatch or missing code', { status: 400 });
  }

  let returnUrl = env.REDIRECT_BASE || 'https://openkpis.org';
  if (state.includes(':')) {
    const parts = state.split(':');
    if (parts.length >= 2) {
      try {
        returnUrl = atob(parts.slice(1).join(':'));
        console.log('OAuth Callback - Return URL:', returnUrl);
      } catch (e) {
        console.error('Failed to decode return URL from state:', e);
      }
    }
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: 'https://oauthgithub.openkpis.org/oauth/callback',
      }),
    });

    const tokenData = await tokenResponse.json();
    
    console.log('Token Response:', tokenData.access_token ? 'Success' : 'Failed');
    
    if (!tokenData.access_token) {
      console.error('Token error:', tokenData.error, tokenData.error_description);
      throw new Error(`Failed to get access token: ${tokenData.error_description || tokenData.error}`);
    }

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'User-Agent': 'OpenKPIs-Worker',
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const userData = await userResponse.json();
    console.log('User data:', userData.login);

    const sessionData = {
      accessToken: tokenData.access_token,
      user: {
        login: userData.login,
        name: userData.name,
        avatar_url: userData.avatar_url,
      },
      expires: Date.now() + (7 * 24 * 60 * 60 * 1000),
    };

    const sessionToken = await createSessionToken(sessionData, env.SESSION_SIGNING_KEY);

    // CRITICAL FIX: SameSite=None allows cross-origin cookies
    const response = new Response(null, {
      status: 302,
      headers: {
        'Location': returnUrl,
        'Set-Cookie': `openkpis_session=${sessionToken}; HttpOnly; Secure; SameSite=None; Max-Age=${7 * 24 * 60 * 60}; Path=/`
      }
    });
    
    console.log('OAuth Callback - Redirecting to:', returnUrl);
    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response(`OAuth authentication failed: ${error.message}`, { status: 500 });
  }
}

async function handleMe(request, env) {
  const sessionData = await getSessionData(request, env.SESSION_SIGNING_KEY, 'openkpis_session');
  
  const origin = request.headers.get('Origin') || '*';
  
  const user = sessionData ? {
    authenticated: true,
    login: sessionData.user.login,
    name: sessionData.user.name,
    avatar_url: sessionData.user.avatar_url,
  } : { authenticated: false };

  return new Response(
    JSON.stringify(user),
    { 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
      } 
    }
  );
}

async function handleContent(request, env) {
  const url = new URL(request.url);
  const path = url.searchParams.get('path');
  const origin = request.headers.get('Origin') || '*';
  
  if (!path) {
    return new Response(
      JSON.stringify({ error: 'Path parameter required' }),
      { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
        } 
      }
    );
  }

  const sessionData = await getSessionData(request, env.SESSION_SIGNING_KEY, 'openkpis_session');
  
  if (!sessionData) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { 
        status: 401, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
        } 
      }
    );
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/devyendarm/OpenKPIs/contents/${path}`,
      {
        headers: {
          'Authorization': `Bearer ${sessionData.accessToken}`,
          'User-Agent': 'OpenKPIs-Worker',
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    const content = atob(data.content.replace(/\n/g, ''));

    return new Response(
      JSON.stringify({ content, sha: data.sha }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
        } 
      }
    );
  } catch (error) {
    console.error('Content fetch error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch content' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
        } 
      }
    );
  }
}

async function handleCommit(request, env) {
  const origin = request.headers.get('Origin') || '*';
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const sessionData = await getSessionData(request, env.SESSION_SIGNING_KEY, 'openkpis_session');
  
  if (!sessionData) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { 
        status: 401, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
        } 
      }
    );
  }

  try {
    const commitData = await request.json();
    
    if (!commitData.id || !commitData.yamlContent || !commitData.mdxContent) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Credentials': 'true',
          } 
        }
      );
    }

    const branchName = `submit/${sessionData.user.login}/${commitData.id}`;
    
    const mainRef = await fetch(
      'https://api.github.com/repos/devyendarm/OpenKPIs/git/ref/heads/main',
      {
        headers: {
          'Authorization': `Bearer ${sessionData.accessToken}`,
          'User-Agent': 'OpenKPIs-Worker',
        },
      }
    );
    
    const mainData = await mainRef.json();
    const baseSha = mainData.object.sha;

    await fetch(
      'https://api.github.com/repos/devyendarm/OpenKPIs/git/refs',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.accessToken}`,
          'User-Agent': 'OpenKPIs-Worker',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: baseSha,
        }),
      }
    );

    await Promise.all([
      fetch(
        `https://api.github.com/repos/devyendarm/OpenKPIs/contents/${commitData.yamlPath}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${sessionData.accessToken}`,
            'User-Agent': 'OpenKPIs-Worker',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: commitData.commitMessage,
            content: btoa(commitData.yamlContent),
            branch: branchName,
          }),
        }
      ),
      fetch(
        `https://api.github.com/repos/devyendarm/OpenKPIs/contents/${commitData.mdxPath}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${sessionData.accessToken}`,
            'User-Agent': 'OpenKPIs-Worker',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: commitData.commitMessage,
            content: btoa(commitData.mdxContent),
            branch: branchName,
          }),
        }
      ),
    ]);

    const prResponse = await fetch(
      'https://api.github.com/repos/devyendarm/OpenKPIs/pulls',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.accessToken}`,
          'User-Agent': 'OpenKPIs-Worker',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${commitData.mode === 'create' ? 'Add' : 'Update'} ${commitData.id}`,
          body: `## Summary\n\n${commitData.mode === 'create' ? 'Created' : 'Updated'} ${commitData.id}\n\n## Changes\n\n- **YAML File**: \`${commitData.yamlPath}\`\n- **MDX File**: \`${commitData.mdxPath}\`\n- **Commit Message**: ${commitData.commitMessage}\n\n---\n\n*This PR was created automatically by the OpenKPIs editor.*`,
          head: `devyendarm:${branchName}`,
          base: 'main',
        }),
      }
    );

    const prResult = await prResponse.json();

    const response = {
      success: true,
      prUrl: prResult.html_url,
      headRepoFullName: 'devyendarm/OpenKPIs',
      headBranch: branchName,
      prNumber: prResult.number,
      message: 'Changes committed successfully',
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
        } 
      }
    );

  } catch (error) {
    console.error('Commit error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to commit changes' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
        } 
      }
    );
  }
}

// Helper Functions

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getCookieValue(request, name) {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

function getSessionId(cookie) {
  if (!cookie) return null;
  const match = cookie.match(/session_id=([^;]+)/);
  return match ? match[1] : null;
}

async function createSessionToken(data, signingKey) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(signingKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const payload = JSON.stringify(data);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return `${payload}.${signatureHex}`;
}

async function getSessionData(request, signingKey, cookieName) {
  const sessionToken = getCookieValue(request, cookieName);
  if (!sessionToken) return null;

  try {
    const [payload, signature] = sessionToken.split('.');
    if (!payload || !signature) return null;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(signingKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = new Uint8Array(
      signature.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(payload)
    );

    if (!isValid) return null;

    const data = JSON.parse(payload);
    
    if (data.expires && Date.now() > data.expires) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

