/**
 * GitHub Sign In Component
 * 
 * Handles GitHub OAuth authentication using Supabase Auth
 */

import React, { useEffect, useState } from 'react';
import { supabase, getCurrentUser, signInWithGitHub, signOut } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export function GitHubSignIn() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('openkpis-auth-change', {
        detail: { user: session?.user ?? null }
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    setLoading(true);
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }

  async function handleSignIn(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    setLoading(true);
    const { error } = await signInWithGitHub();
    
    if (error) {
      console.error('Sign in error:', error);
      alert('Failed to sign in. Please try again.');
      setLoading(false);
    }
    // Note: User will be redirected to GitHub, then back
  }

  async function handleSignOut(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    setLoading(true);
    const { error } = await signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      alert('Failed to sign out. Please try again.');
    }
    
    setUser(null);
    setLoading(false);
    
    // Reload page to clear any cached state
    window.location.reload();
  }

  if (loading) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        fontSize: '14px',
        color: 'var(--ifm-color-emphasis-600)',
      }}>
        <span>Loading...</span>
      </div>
    );
  }

  if (user) {
    const userName = user.user_metadata?.user_name || user.user_metadata?.full_name || 'User';
    const avatarUrl = user.user_metadata?.avatar_url;

    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        padding: '4px 12px 4px 4px',
        borderRadius: '20px',
        backgroundColor: 'var(--ifm-color-emphasis-100)',
      }}>
        {avatarUrl && (
          <img 
            src={avatarUrl} 
            alt={userName}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: '2px solid var(--ifm-color-primary)',
            }}
          />
        )}
        <span style={{
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--ifm-font-color-base)',
        }}>
          {userName}
        </span>
        <button
          onClick={handleSignOut}
          style={{
            padding: '4px 12px',
            fontSize: '13px',
            border: '1px solid var(--ifm-color-emphasis-300)',
            borderRadius: '4px',
            backgroundColor: 'var(--ifm-background-color)',
            color: 'var(--ifm-font-color-base)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-200)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--ifm-background-color)';
          }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 16px',
        fontSize: '14px',
        fontWeight: 500,
        border: '1px solid var(--ifm-color-emphasis-300)',
        borderRadius: '6px',
        backgroundColor: 'var(--ifm-color-primary)',
        color: '#ffffff',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--ifm-color-primary-dark)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--ifm-color-primary)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
      </svg>
      <span>Sign in with GitHub</span>
    </button>
  );
}

export default GitHubSignIn;
