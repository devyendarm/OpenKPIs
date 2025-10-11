import React, { useState, useEffect, useMemo } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { Button } from '@mui/material';
import { GitHub as GitHubIcon } from '@mui/icons-material';

const WORKER_BASE_URL = 'https://oauthgithub.openkpis.org';

interface User {
  authenticated: boolean;
  login?: string;
  name?: string;
  avatar_url?: string;
}

export default function GitHubSignIn() {
  const [user, setUser] = useState<User>({ authenticated: false });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${WORKER_BASE_URL}/me`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const loginUrl = useMemo(() => {
    const base = `${WORKER_BASE_URL}/oauth/login`;
    if (typeof window === 'undefined') return base;
    const returnUrl = encodeURIComponent(window.location.href);
    return `${base}?return_url=${returnUrl}`;
  }, []);

  if (user.authenticated) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        padding: '0.25rem 0.5rem',
        borderRadius: '6px',
        backgroundColor: 'var(--ifm-color-emphasis-100)'
      }}>
        {user.avatar_url && (
          <img 
            src={user.avatar_url} 
            alt={user.login} 
            style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%' 
            }} 
          />
        )}
        <span style={{ 
          fontSize: '0.875rem',
          fontWeight: '500',
          color: 'var(--ifm-font-color-base)'
        }}>
          {user.login}
        </span>
      </div>
    );
  }

  return (
    <a href={loginUrl} style={{ textDecoration: 'none' }}>
      <Button
        variant="outlined"
        size="small"
        startIcon={<GitHubIcon />}
        sx={{
          fontSize: '0.875rem',
          padding: '0.375rem 0.75rem',
          borderRadius: '6px',
          fontWeight: '500',
          textTransform: 'none',
          borderColor: 'var(--ifm-color-emphasis-300)',
          color: 'var(--ifm-font-color-base)',
          '&:hover': {
            borderColor: 'var(--ifm-color-primary)',
            backgroundColor: 'var(--ifm-color-primary-lightest)',
          }
        }}
      >
        Sign In
      </Button>
    </a>
  );
}

