/**
 * Custom Navbar Component
 * 
 * Extends the default Docusaurus Navbar to add GitHub Sign In
 */

import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import OriginalNavbar from '@theme-original/Navbar';
import GitHubSignIn from '@site/src/components/GitHubSignIn';

export default function Navbar(props: any) {
  useEffect(() => {
    const rootElement = document.getElementById('github-signin-root');
    if (rootElement && !rootElement.hasChildNodes()) {
      const root = createRoot(rootElement);
      root.render(<GitHubSignIn />);
    }
  }, []);

  return <OriginalNavbar {...props} />;
}
