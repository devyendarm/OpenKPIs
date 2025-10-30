/**
 * Google Tag Manager (GTM) Integration
 * Adds GTM body noscript tag (head script is loaded via /js/gtm-head.js)
 */

export default function gtmClientModule() {
  if (typeof window !== 'undefined') {
    // Add GTM noscript to body if not already present
    const addGTMNoscript = () => {
      if (!document.getElementById('gtm-noscript') && document.body) {
        const noscript = document.createElement('noscript');
        noscript.id = 'gtm-noscript';
        const iframe = document.createElement('iframe');
        iframe.src = 'https://www.googletagmanager.com/ns.html?id=GTM-NPT9TNWC';
        iframe.height = '0';
        iframe.width = '0';
        iframe.style.display = 'none';
        iframe.style.visibility = 'hidden';
        noscript.appendChild(iframe);
        document.body.insertBefore(noscript, document.body.firstChild);
      }
    };

    // Try immediately
    if (document.body) {
      addGTMNoscript();
    } else {
      // Wait for body to be ready
      document.addEventListener('DOMContentLoaded', addGTMNoscript);
      // Also check after a short delay in case DOMContentLoaded already fired
      setTimeout(addGTMNoscript, 100);
    }
  }
}
