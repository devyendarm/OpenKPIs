/**
 * Giscus Comments Component
 * 
 * Adds GitHub Discussions-based comments to pages
 * Uses the Giscus widget which connects to GitHub Discussions
 */

import React, { useEffect, useRef } from 'react';
import { useLocation } from '@docusaurus/router';
import { Box, Typography } from '@mui/material';

interface GiscusCommentsProps {
  /**
   * The term to use for comments (usually the KPI/metric name or slug)
   */
  term?: string;
  /**
   * Category (kpi, metric, dimension, event, dashboard)
   */
  category?: string;
}

export default function GiscusComments({ term, category = 'kpi' }: GiscusCommentsProps) {
  const location = useLocation();
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use the current path as the discussion term
    const discussionTerm = term || location.pathname;
    
    // Create unique discussion URL per page
    const identifier = `${category}/${discussionTerm}`;

    // Check if Giscus script is already loaded
    if (document.querySelector('script[src="https://giscus.app/client.js"]')) {
      // Remove old Giscus instance if it exists
      const oldGiscus = document.querySelector('iframe[src^="https://giscus.app"]');
      if (oldGiscus) {
        oldGiscus.remove();
      }
    }

    // Create script element for Giscus
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'devyendarm/OpenKPIs');
    script.setAttribute('data-repo-id', 'R_kgDOP1g99A');
    script.setAttribute('data-category', 'Q&A');
    script.setAttribute('data-category-id', 'DIC_kwDOP1g99M4CxJez');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '1');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'light');
    script.setAttribute('data-lang', 'en');
    script.setAttribute('data-loading', 'lazy'); // Load comments when scrolled into view
    script.crossOrigin = 'anonymous';
    script.async = true;

    // Remove existing script if it exists
    const existingScript = document.querySelector('script[src="https://giscus.app/client.js"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Append to container
    if (commentsRef.current) {
      commentsRef.current.appendChild(script);
    }

    // Cleanup on unmount
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [location.pathname, term, category]);

  return (
    <Box sx={{ mt: 6, pt: 4, borderTop: '2px solid', borderColor: 'divider' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Comments & Discussion
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Share your thoughts, questions, or feedback about this item. Sign in with GitHub to join the discussion.
      </Typography>
      <Box ref={commentsRef} sx={{ mt: 2 }} />
    </Box>
  );
}

