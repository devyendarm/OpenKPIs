/**
 * KPI Editor Wrapper - Stub Component
 * 
 * This component is referenced by existing MDX files but editing is now handled
 * through the Supabase-based form system. This is a placeholder to prevent build errors.
 */

import React from 'react';

interface KpiEditorWrapperProps {
  kpiId?: string;
  section?: 'kpis' | 'dimensions' | 'events' | 'metrics';
}

export default function KpiEditorWrapper({ kpiId, section }: KpiEditorWrapperProps) {
  // This component is no longer used - editing is done through forms
  // But we keep it here so existing MDX files don't break
  return null;
}

