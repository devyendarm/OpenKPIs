/**
 * Supabase Client Configuration
 * 
 * This file creates and exports the Supabase client for use throughout the application.
 * It uses environment variables for configuration to keep credentials secure.
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration - hardcoded for browser compatibility
// NOTE: The anon key is SAFE to hardcode - it's designed for public use and protected by RLS policies
// The service_role key should NEVER be exposed to the browser
const supabaseUrl = 'https://cpcabdtnzmanxuclewrg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwY2FiZHRuem1hbnh1Y2xld3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDE3MjMsImV4cCI6MjA3NjAxNzcyM30.R3bS_SCGTPurQ-iYNSTGpnl8AlBLy5BUe6_zMLgK5wM';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration');
}

/**
 * Supabase client instance
 * 
 * This client is configured with:
 * - Auto-refresh for auth tokens
 * - Persistent sessions
 * - GitHub OAuth support
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

/**
 * Database table names
 */
export const TABLES = {
  KPIS: 'kpis',
  EVENTS: 'events',
  DIMENSIONS: 'dimensions',
  METRICS: 'metrics',
  AUDIT_LOG: 'audit_log',
  CONTRIBUTORS: 'contributors',
} as const;

/**
 * Status values for KPIs, Events, and Dimensions
 */
export const STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

/**
 * Helper function to check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

/**
 * Helper function to get current user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
}

/**
 * Helper function to sign in with GitHub
 */
export async function signInWithGitHub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
      scopes: 'read:user user:email public_repo',  // Added public_repo for commit access
    },
  });
  
  if (error) {
    console.error('Error signing in with GitHub:', error);
    return { error };
  }
  
  return { data };
}

/**
 * Helper function to sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    return { error };
  }
  return { success: true };
}

/**
 * TypeScript types for database tables
 */

export interface KPI {
  id: string;
  slug: string;
  name: string;
  formula?: string;
  description?: string;
  category?: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  github_commit_sha?: string;
  github_file_path?: string;
  created_by: string;
  created_at: string;
  last_modified_by?: string;
  last_modified_at?: string;
  approved_by?: string;
  approved_at?: string;
}

export interface Event {
  id: string;
  slug: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  github_commit_sha?: string;
  github_file_path?: string;
  created_by: string;
  created_at: string;
  last_modified_by?: string;
  last_modified_at?: string;
  approved_by?: string;
  approved_at?: string;
}

export interface Dimension {
  id: string;
  slug: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  github_commit_sha?: string;
  github_file_path?: string;
  created_by: string;
  created_at: string;
  last_modified_by?: string;
  last_modified_at?: string;
  approved_by?: string;
  approved_at?: string;
}

export interface AuditLog {
  id: string;
  table_name: 'kpis' | 'events' | 'dimensions';
  record_id: string;
  action: 'created' | 'edited' | 'approved' | 'published' | 'deleted';
  user_login: string;
  user_name?: string;
  user_email?: string;
  user_avatar_url?: string;
  changes?: any;
  github_commit_sha?: string;
  created_at: string;
}

export interface Metric {
  id: string;
  slug: string;
  name: string;
  formula?: string;
  description?: string;
  category?: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  github_commit_sha?: string;
  github_file_path?: string;
  created_by: string;
  created_at: string;
  last_modified_by?: string;
  last_modified_at?: string;
  approved_by?: string;
  approved_at?: string;
}

export interface Contributor {
  github_login: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  total_kpis: number;
  total_events: number;
  total_dimensions: number;
  total_metrics: number;
  total_edits: number;
  first_contribution_at?: string;
  last_contribution_at?: string;
  updated_at?: string;
}

/**
 * Sync a record to GitHub (creates commit and PR)
 */
export async function syncToGitHub(
  tableName: 'kpis' | 'events' | 'dimensions' | 'metrics',
  recordId: string,
  action: 'created' | 'edited'
) {
  try {
    console.log('[GitHub Sync] Starting...', { tableName, recordId, action });
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('[GitHub Sync] User not authenticated');
      return { error: 'User not authenticated' };
    }

    const userName = user.user_metadata?.user_name || user.email;
    const userFullName = user.user_metadata?.full_name || user.user_metadata?.name || userName;
    
    console.log('[GitHub Sync] Calling Edge Function with:', {
      table_name: tableName,
      record_id: recordId,
      action: action,
      user_login: userName,
    });
    
    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('sync-to-github', {
      body: {
        table_name: tableName,
        record_id: recordId,
        action: action,
        user_login: userName,
        user_name: userFullName,
        user_email: user.email,
      },
    });

    if (error) {
      console.error('[GitHub Sync] Edge Function error:', error);
      return { error: error.message };
    }

    console.log('[GitHub Sync] Success:', data);
    return { data };
  } catch (error: any) {
    console.error('[GitHub Sync] Exception:', error);
    return { error: error.message };
  }
}

