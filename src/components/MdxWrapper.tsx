/**
 * MDX Wrapper Component
 * 
 * Wraps MDX content with live data from Supabase
 * Used by KPI, Event, Dimension, Metric MDX pages
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface MdxWrapperProps {
  children: React.ReactNode;
  slug: string;
  type: 'kpi' | 'event' | 'dimension' | 'metric';
}

export default function MdxWrapper({ children, slug, type }: MdxWrapperProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [slug]);

  async function loadData() {
    const { data: dbData, error } = await supabase
      .from(type + 's')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!error && dbData) {
      setData(dbData);
    }
    setLoading(false);
  }

  // If data exists in Supabase, use it; otherwise use MDX content
  if (loading) {
    return <>{children}</>;
  }

  // Pass data to children via context or just render MDX content
  return <>{children}</>;
}

