/**
 * Custom Navbar Component
 * 
 * Extends the default Docusaurus Navbar to add GitHub Sign In
 */

import React from 'react';
import OriginalNavbar from '@theme-original/Navbar';
import GitHubSignIn from '@site/src/components/GitHubSignIn';
import type { Props } from '@theme/Navbar';

export default function Navbar(props: Props): JSX.Element {
  return (
    <>
      <OriginalNavbar {...props} />
      <div
        id="github-signin-root"
        style={{
          position: 'fixed',
          top: '12px',
          right: '80px',
          zIndex: 100,
        }}
      >
        <GitHubSignIn />
      </div>
    </>
  );
}
