// Mount GitHub Sign In component to navbar
(function() {
  if (typeof window === 'undefined') return;

  console.log('GitHub Sign In script loaded');

  const WORKER_BASE_URL = 'https://oauthgithub.openkpis.org';
  
  let user = { authenticated: false };
  let isCheckingAuth = false;

  async function checkAuth() {
    if (isCheckingAuth) return;
    isCheckingAuth = true;
    
    try {
      console.log('Checking authentication...');
      const response = await fetch(`${WORKER_BASE_URL}/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log('Auth response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        user = data;
        console.log('User authenticated:', user);
        
        // Store auth state globally for other components
        if (typeof window !== 'undefined') {
          window.__OPENKPIS_USER__ = user;
          // Dispatch custom event so forms can react
          window.dispatchEvent(new CustomEvent('openkpis-auth-change', { detail: user }));
        }
      } else {
        console.log('User not authenticated, status:', response.status);
        user = { authenticated: false };
        if (typeof window !== 'undefined') {
          window.__OPENKPIS_USER__ = user;
          window.dispatchEvent(new CustomEvent('openkpis-auth-change', { detail: user }));
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      user = { authenticated: false };
      if (typeof window !== 'undefined') {
        window.__OPENKPIS_USER__ = user;
      }
    } finally {
      isCheckingAuth = false;
      renderSignIn();
    }
  }

  function handleSignInClick(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Sign in button clicked');
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `${WORKER_BASE_URL}/oauth/login?return_url=${returnUrl}`;
  }

  function renderSignIn() {
    const root = document.getElementById('github-signin-root');
    if (!root) {
      console.error('GitHub signin root element not found');
      return;
    }
    console.log('Rendering GitHub Sign In button, authenticated:', user.authenticated);

    // Clear existing content
    root.innerHTML = '';

    if (user.authenticated) {
      const container = document.createElement('div');
      container.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; border-radius: 6px; background-color: var(--ifm-color-emphasis-100);';
      
      if (user.avatar_url) {
        const img = document.createElement('img');
        img.src = user.avatar_url;
        img.alt = user.login;
        img.style.cssText = 'width: 24px; height: 24px; border-radius: 50%;';
        container.appendChild(img);
      }
      
      const span = document.createElement('span');
      span.style.cssText = 'font-size: 0.875rem; font-weight: 500; color: var(--ifm-font-color-base);';
      span.textContent = user.login || user.name || 'User';
      container.appendChild(span);
      
      root.appendChild(container);
    } else {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'github-signin-button';
      button.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.875rem;
        padding: 0.375rem 0.75rem;
        border-radius: 6px;
        font-weight: 500;
        text-transform: none;
        border: 1px solid var(--ifm-color-emphasis-300);
        background-color: transparent;
        color: var(--ifm-font-color-base);
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: 'Roboto', sans-serif;
      `;
      
      button.innerHTML = `
        <svg style="width: 16px; height: 16px;" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd" />
        </svg>
        Sign In
      `;
      
      button.addEventListener('mouseenter', function() {
        this.style.borderColor = 'var(--ifm-color-primary)';
        this.style.backgroundColor = 'var(--ifm-color-primary-lightest)';
      });
      
      button.addEventListener('mouseleave', function() {
        this.style.borderColor = 'var(--ifm-color-emphasis-300)';
        this.style.backgroundColor = 'transparent';
      });
      
      button.addEventListener('click', handleSignInClick);
      
      root.appendChild(button);
    }
  }

  // Initialize with retry mechanism
  let initAttempts = 0;
  function init() {
    const root = document.getElementById('github-signin-root');
    if (root) {
      console.log('Found github-signin-root, initializing...');
      checkAuth();
    } else if (initAttempts < 50) {
      initAttempts++;
      console.log('github-signin-root not found, retrying...', initAttempts);
      setTimeout(init, 100);
    }
  }

  // Start initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-check auth on navigation (for SPA) - but less frequently
  let lastPath = window.location.pathname;
  setInterval(function() {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      console.log('Path changed, re-checking auth');
      checkAuth();
    }
  }, 1000); // Check every 1 second instead of 500ms

  // Re-check auth when user comes back from OAuth
  window.addEventListener('focus', function() {
    console.log('Window focused, re-checking auth');
    setTimeout(checkAuth, 500);
  });

  // Expose checkAuth globally for forms to trigger
  if (typeof window !== 'undefined') {
    window.__OPENKPIS_CHECK_AUTH__ = checkAuth;
  }
})();

