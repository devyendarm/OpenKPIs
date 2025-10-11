import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider
} from '@mui/material';
import { Add as AddIcon, Save as SaveIcon, GitHub as GitHubIcon } from '@mui/icons-material';

// Configuration
const WORKER_BASE_URL = 'https://oauthgithub.openkpis.org';

interface User {
  authenticated: boolean;
  login?: string;
  name?: string;
  avatar_url?: string;
}

interface CreateResult {
  success: boolean;
  prUrl?: string;
  headRepoFullName?: string;
  headBranch?: string;
  prNumber?: number;
  error?: string;
  message?: string;
}

const INDUSTRIES = [
  'Retail',
  'E-commerce', 
  'SaaS',
  'Healthcare',
  'Education',
  'Finance',
  'Media',
  'Technology',
  'Manufacturing',
  'Other'
];

const CATEGORIES = [
  'Conversion',
  'Revenue',
  'Engagement',
  'Retention',
  'Acquisition',
  'Performance',
  'Quality',
  'Efficiency',
  'Satisfaction',
  'Growth',
  'Other'
];

const KPI_TYPES = [
  'Counter',
  'Rate',
  'Average',
  'Sum',
  'Percentage',
  'Ratio',
  'Duration',
  'Score',
  'Index',
  'Other'
];

export default function NewKpiPage() {
  const baseUrl = useBaseUrl('/');
  const [user, setUser] = useState<User>({ authenticated: false });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    type: 'kpis',
    name: '',
    industry: '',
    category: '',
    kpiType: '',
    description: '',
    formula: '',
    scope: 'Session',
    priority: 'Medium',
    coreArea: '',
    ga4Event: '',
    adobeEvent: '',
    amplitudeEvent: '',
    biSourceSystem: '',
    dataLayerMapping: '',
    xdmMapping: '',
    dependencies: '',
    reportAttribute: '',
    dashboardUsage: '',
    segmentEligibility: '',
    sqlExample: '',
    calculationNotes: '',
    contributedBy: '',
    owner: '',
    tags: '',
    dataSensitivity: 'Low',
    piiFlag: false,
  });

  useEffect(() => {
    checkAuth();
    
    // Listen for auth changes from the global signin component
    const handleAuthChange = (event: CustomEvent) => {
      console.log('Auth changed in form:', event.detail);
      setUser(event.detail);
      setLoading(false);
    };
    
    window.addEventListener('openkpis-auth-change', handleAuthChange as EventListener);
    
    // Also check if there's already a global user object
    if ((window as any).__OPENKPIS_USER__) {
      console.log('Using cached user from global:', (window as any).__OPENKPIS_USER__);
      setUser((window as any).__OPENKPIS_USER__);
      setLoading(false);
    }
    
    return () => {
      window.removeEventListener('openkpis-auth-change', handleAuthChange as EventListener);
    };
  }, []);

  const checkAuth = async () => {
    try {
      console.log('Form: Checking authentication...');
      const response = await fetch(`${WORKER_BASE_URL}/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });
      console.log('Form: Auth response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Form: User data received:', userData);
        setUser(userData);
      } else {
        console.log('Form: Not authenticated');
        setUser({ authenticated: false });
      }
    } catch (error) {
      console.error('Form: Auth check failed:', error);
      setUser({ authenticated: false });
    } finally {
      setLoading(false);
    }
  };

  const loginUrl = React.useMemo(() => {
    const base = `${WORKER_BASE_URL}/oauth/login`;
    if (typeof window === 'undefined') return base;
    const returnUrl = encodeURIComponent(window.location.href);
    return `${base}?return_url=${returnUrl}`;
  }, []);

  const handleInputChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const generateId = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  const generateYamlContent = (): string => {
    const id = generateId(formData.name);
    const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    return `KPI Name: ${formData.name}
Description: ${formData.description}
KPI Alias:
- ${formData.name}
Metric: ${formData.formula}
GA Events Name: ${formData.ga4Event}
Adobe Analytics Event Name: ${formData.adobeEvent}
Amplitude Event Name: ${formData.amplitudeEvent}
Industry:
- ${formData.industry}
Category: ${formData.category}
KPI Type: ${formData.kpiType}
Formula: ${formData.formula}
Related KPIs:
- Related KPI 1
- Related KPI 2
Scope: ${formData.scope}
Priority: ${formData.priority}
Core Area: ${formData.coreArea}
BI Source System:
- ${formData.biSourceSystem}
Data Layer Mapping: "${formData.dataLayerMapping}"
XDM Mapping: "${formData.xdmMapping}"
Dependencies: ${formData.dependencies}
Report Attribute:
- ${formData.reportAttribute}
Dashboard Usage:
- ${formData.dashboardUsage}
Segment Eligibility:
- ${formData.segmentEligibility}
SQL Query Example:
- sql<br>${formData.sqlExample}
Aggregation Window:
- Daily
- Weekly
- Monthly
Calculation Notes:
- ${formData.calculationNotes}
Contributed By: ${formData.contributedBy}
Validation Status: Unverified
Owner: ${formData.owner}
Tags: '${tags.join(' ')}'
Data Sensitivity: ${formData.dataSensitivity}
PII Flag: ${formData.piiFlag}
Version: v1.0
Dimensions:
- dimension1
- dimension2
- dimension3
Details: ${formData.description}
Last Updated: '${new Date().toISOString()}'`;
  };

  const generateMdxContent = (): string => {
    const id = generateId(formData.name);
    const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    return `---
id: "${id}"
title: "${formData.name}"
description: "${formData.description}"
tags: [${tags.map(tag => `"${tag}"`).join(',')}]
slug: "/${id}"
toc_min_heading_level: 2
toc_max_heading_level: 4
hide_table_of_contents: false
---

import KpiEditorWrapper from '@site/src/components/KpiEditorWrapper';

<div class="mui-section">
<h2>Overview</h2>
<div class="mui-overview">${formData.description}</div>
</div>

<div class="mui-section">
<h2>Formula</h2>
<div class="mui-code-label">SQL</div>
<div class="mui-code-block">${formData.formula}</div>
</div>

<div class="mui-section">
<h2>Platform Implementation</h2>
- **GA4**: \`${formData.ga4Event}\`
- **Adobe Analytics**: \`${formData.adobeEvent}\`
- **Amplitude**: \`${formData.amplitudeEvent}\`
</div>

## Business Context

<div class="mui-section">
**Industry**: ${formData.industry}

**Category**: ${formData.category}

**Priority**: ${formData.priority}

**Core Area**: ${formData.coreArea}

**Scope**: ${formData.scope}
</div>

## Technical Details

<div class="mui-section">
**KPI Type**: ${formData.kpiType}

**Metric**: ${formData.formula}

**Aggregation Window**: Daily, Weekly, Monthly
</div>

## Data Mappings

<div class="mui-section">
**Data Layer Mapping**

<div class="mui-code-block" data-language="json">${formData.dataLayerMapping}</div>

**XDM Mapping**

<div class="mui-code-block" data-language="json">${formData.xdmMapping}</div>
</div>

## Implementation

<div class="mui-section">
**Dependencies**: ${formData.dependencies}

**BI Source System**: ${formData.biSourceSystem}

**Report Attribute**: ${formData.reportAttribute}
</div>

## Usage & Analytics

<div class="mui-section">
**Dashboard Usage**: ${formData.dashboardUsage}

**Segment Eligibility**: ${formData.segmentEligibility}

**Related KPIs**: Related KPI 1, Related KPI 2
</div>

## SQL Examples

<div class="mui-section">
**SQL Query Example**

<div class="mui-code-block" data-language="sql">${formData.sqlExample}</div>
</div>

## Documentation

<div class="mui-section">
**Calculation Notes**: ${formData.calculationNotes}

**Details**: ${formData.description}

**Contributed By**: ${formData.contributedBy}

**Owner**: ${formData.owner}
</div>

## Governance

<div class="mui-section">
**Validation Status**: Unverified

**Version**: v1.0

**Last Updated**: ${new Date().toISOString()}

**Data Sensitivity**: ${formData.dataSensitivity}

**PII Flag**: ${formData.piiFlag}
</div>

<KpiEditorWrapper kpiId="${id}" section="${formData.type}" />`;
  };

  const handleSubmit = async () => {
    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const id = generateId(formData.name);
      const yamlPath = `data-layer/${formData.type}/${id}.yml`;
      const mdxPath = `docs/${formData.type}/${id}.mdx`;
      
      const commitData = {
        mode: 'create' as const,
        id,
        yamlPath,
        mdxPath,
        yamlContent: generateYamlContent(),
        mdxContent: generateMdxContent(),
        commitMessage: `Add new ${formData.name} ${formData.type.slice(0, -1)}`
      };

      const response = await fetch(`${WORKER_BASE_URL}/commit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(commitData)
      });

      const result: CreateResult = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create KPI');
      }

      setSuccess('KPI created successfully! Redirecting to edit mode...');
      
      // Redirect to the new KPI page in edit mode (baseUrl-aware)
      setTimeout(() => {
        const pathBase = formData.type === 'kpis' ? '/docs' : `/${formData.type}`;
        const dest = `${(baseUrl || '/').replace(/\/$/, '')}${pathBase}/${id}?edit=1`;
        window.location.href = dest;
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create KPI');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Create New KPI" description="Create a new KPI definition">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  // Always render the form; if not authenticated, show banner and disable submit

  return (
    <Layout title="Create New KPI" description="Create a new KPI definition">
      <Box maxWidth="1000px" mx="auto" p={3}>
        <Typography variant="h3" gutterBottom>
          Create New KPI
        </Typography>
        {!user.authenticated && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Sign in with GitHub to enable submission. Your work will be saved to a PR.
          </Alert>
        )}
        
        <Typography variant="body1" paragraph color="text.secondary">
          Fill out the form below to create a new KPI definition. Your submission will be reviewed by maintainers.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">
                KPI Information
              </Typography>
              {user.authenticated ? (
                <Chip 
                  label={`Signed in as: ${user.login}`} 
                  color="primary" 
                  variant="outlined" 
                />
              ) : (
                <a href={loginUrl} style={{ textDecoration: 'none' }}>
                  <Button variant="contained" startIcon={<GitHubIcon />}>Sign in with GitHub</Button>
                </a>
              )}
            </Box>

            <Box display="flex" flexDirection="column" gap={3}>
              {/* Basic Information */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <TextField
                    label="KPI Name"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    required
                    fullWidth
                    sx={{ minWidth: 300 }}
                  />
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Industry</InputLabel>
                    <Select
                      value={formData.industry}
                      onChange={handleInputChange('industry')}
                      label="Industry"
                      required
                    >
                      {INDUSTRIES.map(industry => (
                        <MenuItem key={industry} value={industry}>
                          {industry}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category}
                      onChange={handleInputChange('category')}
                      label="Category"
                      required
                    >
                      {CATEGORIES.map(category => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Divider />

              {/* Technical Details */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Technical Details
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>KPI Type</InputLabel>
                    <Select
                      value={formData.kpiType}
                      onChange={handleInputChange('kpiType')}
                      label="KPI Type"
                      required
                    >
                      {KPI_TYPES.map(type => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Scope"
                    value={formData.scope}
                    onChange={handleInputChange('scope')}
                    sx={{ minWidth: 200 }}
                  />
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={formData.priority}
                      onChange={handleInputChange('priority')}
                      label="Priority"
                    >
                      <MenuItem value="Low">Low</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="High">High</MenuItem>
                      <MenuItem value="Critical">Critical</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Divider />

              {/* Description and Formula */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Description & Formula
                </Typography>
                <TextField
                  label="Description"
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  multiline
                  rows={3}
                  fullWidth
                  required
                />
                <TextField
                  label="Formula"
                  value={formData.formula}
                  onChange={handleInputChange('formula')}
                  fullWidth
                  required
                  sx={{ mt: 2 }}
                  placeholder="e.g., COUNT(DISTINCT order_id)"
                />
              </Box>

              <Divider />

              {/* Platform Mappings */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Platform Mappings
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <TextField
                    label="GA4 Event Name"
                    value={formData.ga4Event}
                    onChange={handleInputChange('ga4Event')}
                    sx={{ minWidth: 250 }}
                  />
                  <TextField
                    label="Adobe Analytics Event"
                    value={formData.adobeEvent}
                    onChange={handleInputChange('adobeEvent')}
                    sx={{ minWidth: 250 }}
                  />
                  <TextField
                    label="Amplitude Event"
                    value={formData.amplitudeEvent}
                    onChange={handleInputChange('amplitudeEvent')}
                    sx={{ minWidth: 250 }}
                  />
                </Box>
              </Box>

              <Divider />

              {/* Additional Information */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Additional Information
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <TextField
                    label="Core Area"
                    value={formData.coreArea}
                    onChange={handleInputChange('coreArea')}
                    sx={{ minWidth: 250 }}
                  />
                  <TextField
                    label="BI Source System"
                    value={formData.biSourceSystem}
                    onChange={handleInputChange('biSourceSystem')}
                    sx={{ minWidth: 250 }}
                  />
                  <TextField
                    label="Tags (comma-separated)"
                    value={formData.tags}
                    onChange={handleInputChange('tags')}
                    sx={{ minWidth: 300 }}
                    placeholder="e.g., conversion, ecommerce, revenue"
                  />
                </Box>
              </Box>

              <Divider />

              {/* Data Mappings */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Data Mappings
                </Typography>
                <TextField
                  label="Data Layer Mapping"
                  value={formData.dataLayerMapping}
                  onChange={handleInputChange('dataLayerMapping')}
                  multiline
                  rows={3}
                  fullWidth
                  placeholder='{"event": "purchase", "transaction_id": "T_12345"}'
                />
                <TextField
                  label="XDM Mapping"
                  value={formData.xdmMapping}
                  onChange={handleInputChange('xdmMapping')}
                  multiline
                  rows={3}
                  fullWidth
                  sx={{ mt: 2 }}
                  placeholder='{"eventType": "commerce.purchases", "commerce": {"order": {"purchaseID": "ORD123"}}}'
                />
              </Box>

              <Divider />

              {/* SQL Example */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  SQL Example
                </Typography>
                <TextField
                  label="SQL Query Example"
                  value={formData.sqlExample}
                  onChange={handleInputChange('sqlExample')}
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="SELECT COUNT(DISTINCT order_id) AS total_orders FROM ecommerce_events WHERE event_name = 'purchase'"
                />
              </Box>

              <Divider />

              {/* Metadata */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Metadata
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <TextField
                    label="Contributed By"
                    value={formData.contributedBy}
                    onChange={handleInputChange('contributedBy')}
                    sx={{ minWidth: 250 }}
                    placeholder={user.name || user.login}
                  />
                  <TextField
                    label="Owner"
                    value={formData.owner}
                    onChange={handleInputChange('owner')}
                    sx={{ minWidth: 250 }}
                    placeholder="Digital Analytics Team"
                  />
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Data Sensitivity</InputLabel>
                    <Select
                      value={formData.dataSensitivity}
                      onChange={handleInputChange('dataSensitivity')}
                      label="Data Sensitivity"
                    >
                      <MenuItem value="Low">Low</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="High">High</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* Submit Button */}
              <Box display="flex" justifyContent="center" mt={4}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={creating || !user.authenticated || !formData.name || !formData.description || !formData.formula}
                  startIcon={creating ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {creating ? 'Creating KPI...' : 'Create KPI'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}