import React from 'react';
import { useLocation } from '@docusaurus/router';
import KpiEditor from '@site/src/components/KpiEditor';

interface KpiEditorWrapperProps {
  kpiId: string;
  section: 'kpis' | 'dimensions' | 'events' | 'metrics';
}

export default function KpiEditorWrapper({ kpiId, section }: KpiEditorWrapperProps) {
  const location = useLocation();
  
  // Only show editor if we're on a detail page (not index)
  if (location.pathname.endsWith('/') || location.pathname.endsWith('/index')) {
    return null;
  }
  
  return <KpiEditor kpiId={kpiId} section={section} />;
}
