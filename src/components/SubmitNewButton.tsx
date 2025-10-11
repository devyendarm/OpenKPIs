import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export default function SubmitNewButton({ section }: { section: 'kpis'|'dimensions'|'events'|'metrics' }) {
  const href = useBaseUrl(`/${section}/new`);
  const label = section === 'kpis' ? 'Add New KPI' : section === 'dimensions' ? 'Add New Dimension' : section === 'events' ? 'Add New Event' : 'Add New Metric';
  return (
    <div className="submit-new-cta">
      <Button variant="contained" startIcon={<AddIcon />} href={href}>
        {label}
      </Button>
    </div>
  );
}


