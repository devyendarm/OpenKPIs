/**
 * React Hook for Supabase Authentication
 * 
 * Provides user, session, and loading state for Supabase auth
 */

import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

interface UseSupabaseReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export default function useSupabase(): UseSupabaseReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, loading };
}

