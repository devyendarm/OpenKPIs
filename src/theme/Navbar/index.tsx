import React from 'react';
import Navbar from '@theme-original/Navbar';
import GitHubSignIn from '@site/src/components/GitHubSignIn';

export default function NavbarWrapper(props) {
  return (
    <>
      <Navbar {...props} />
      <style>{`
        .navbar__items--right {
          gap: 0.5rem;
        }
      `}</style>
    </>
  );
}

