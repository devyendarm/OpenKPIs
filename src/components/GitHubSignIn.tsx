/**
 * GitHub Sign In Component
 * 
 * Handles GitHub OAuth authentication using Supabase Auth
 */

import React, { useEffect, useState, useRef } from 'react';
import { supabase, getCurrentUser, signInWithGitHub, signOut } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export function GitHubSignIn() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
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
        fontSize: '13px',
        color: 'var(--ifm-color-emphasis-600)',
      }}>
        <span>...</span>
      </div>
    );
  }

  if (user) {
    const userName = user.user_metadata?.user_name || user.user_metadata?.full_name || 'User';
    const avatarUrl = user.user_metadata?.avatar_url;
    const userEmail = user.email;

    return (
      <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block', margin: '0 8px' }}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px 4px 4px',
            borderRadius: '20px',
            backgroundColor: dropdownOpen ? 'var(--ifm-color-emphasis-200)' : 'var(--ifm-color-emphasis-100)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!dropdownOpen) {
              e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-200)';
            }
          }}
          onMouseLeave={(e) => {
            if (!dropdownOpen) {
              e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
            }
          }}
        >
          {avatarUrl && (
            <img 
              src={avatarUrl} 
              alt={userName}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '2px solid var(--ifm-color-primary)',
              }}
            />
          )}
          <span style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--ifm-font-color-base)',
            maxWidth: '120px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {userName}
          </span>
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            fill="var(--ifm-font-color-base)"
            style={{
              transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          >
            <path d="M6 9L1 4h10z"/>
          </svg>
        </button>

        {dropdownOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: '0',
            minWidth: '220px',
            backgroundColor: 'var(--ifm-background-color)',
            border: '1px solid var(--ifm-color-emphasis-300)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            overflow: 'hidden',
          }}>
            {/* User Info Section */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--ifm-color-emphasis-200)',
              backgroundColor: 'var(--ifm-color-emphasis-100)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                {avatarUrl && (
                  <img 
                    src={avatarUrl} 
                    alt={userName}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: '2px solid var(--ifm-color-primary)',
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--ifm-font-color-base)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {userName}
                  </div>
                  {userEmail && (
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--ifm-color-emphasis-700)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {userEmail}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div style={{ padding: '8px 0' }}>
              <a
                href={`https://github.com/${userName}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  color: 'var(--ifm-font-color-base)',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                <span>View GitHub Profile</span>
              </a>

              <a
                href="/kpis/new"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  color: 'var(--ifm-font-color-base)',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0a1 1 0 011 1v6h6a1 1 0 110 2H9v6a1 1 0 11-2 0V9H1a1 1 0 110-2h6V1a1 1 0 011-1z"/>
                </svg>
                <span>Create New KPI</span>
              </a>
            </div>

            {/* Sign Out */}
            <div style={{
              borderTop: '1px solid var(--ifm-color-emphasis-200)',
              padding: '8px 0',
            }}>
              <button
                onClick={handleSignOut}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '10px 16px',
                  fontSize: '14px',
                  color: '#d32f2f',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3 2a1 1 0 00-1 1v10a1 1 0 001 1h5a1 1 0 100-2H4V4h4a1 1 0 100-2H3zm9.707 4.293a1 1 0 00-1.414 1.414L12.586 9H7a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3z"/>
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 14px',
        fontSize: '13px',
        fontWeight: 500,
        border: '1px solid var(--ifm-color-primary)',
        borderRadius: '6px',
        backgroundColor: 'var(--ifm-color-primary)',
        color: '#ffffff',
        cursor: 'pointer',
        transition: 'all 0.2s',
        pointerEvents: 'auto',
        margin: '0 8px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--ifm-color-primary-dark)';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--ifm-color-primary)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
      </svg>
      <span>Sign in</span>
    </button>
  );
}

export default GitHubSignIn;
