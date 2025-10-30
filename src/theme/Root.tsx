/**
 * Custom Root Component
 * Adds GTM head script directly in the head as early as possible
 */
import React, { useEffect } from 'react';

// Extend Window interface for dataLayer
declare global {
  interface Window {
    dataLayer?: any[];
  }
}

export default function Root({ children, ...props }) {
  useEffect(() => {
    // Add GTM script to head immediately when component mounts (fallback if static file didn't load)
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // Initialize dataLayer if it doesn't exist
      if (!window.dataLayer) {
        window.dataLayer = [];
      }
      
      // Only inject if the script hasn't been added yet
      if (!document.querySelector('script[src*="googletagmanager.com/gtm.js"]') && 
          !document.getElementById('gtm-head-script')) {
        const script = document.createElement('script');
        script.id = 'gtm-head-script';
        script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NPT9TNWC');`;
        document.head.insertBefore(script, document.head.firstChild);
      }
    }
  }, []);

  return <>{children}</>;
}
