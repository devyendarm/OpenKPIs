/**
 * Supabase Client Configuration
 * 
 * This file creates and exports the Supabase client for use throughout the application.
 * It uses environment variables for configuration to keep credentials secure.
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cpcabdtnzmanxuclewrg.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
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
      redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      scopes: 'read:user user:email',
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

