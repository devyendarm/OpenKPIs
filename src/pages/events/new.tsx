import React, { useState, useEffect } from 'react';
import Layout from '@docusaurus/theme-classic/lib/theme/Layout';
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
  'Engagement',
  'Navigation',
  'Interaction',
  'Transaction',
  'Media',
  'Search',
  'Social',
  'Other'
];

const EVENT_TYPES = [
  'Page View',
  'Click',
  'Form Submit',
  'Purchase',
  'Sign Up',
  'Download',
  'Video Play',
  'Search',
  'Social Share',
  'Other'
];

export default function NewEventPage() {
  const [user, setUser] = useState<User>({ authenticated: false });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    type: 'events',
    name: '',
    industry: '',
    category: '',
    eventType: '',
    description: '',
    trigger: '',
    source: '',
    eventTime: '',
    ga4EventName: '',
    ga4ParamsMap: '',
    adobeXdmEventType: '',
    adobeXdmMap: '',
    adobeAcdlEvent: '',
    adobeAcdlMap: '',
    requiredFields: '',
    genericContextRequired: '',
    genericContextOptional: '',
    xdmFieldGroups: '',
    primaryKpis: '',
    secondaryKpis: '',
    metricsUsed: '',
    dimensionsUsed: '',
    exampleGenericJson: '',
    exampleGa4Json: '',
    exampleXdmJson: '',
    exampleAcdlJson: '',
    frequencyLimit: '',
    piiRisk: 'Low',
    dataSensitivity: 'Low',
    calculationNotes: '',
    contributedBy: '',
    owner: '',
    tags: '',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${WORKER_BASE_URL}/me`, {
        credentials: 'include'
      });
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    window.location.href = `${WORKER_BASE_URL}/oauth/login`;
  };

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
    
    return `Event Name: ${formData.name}
Description: ${formData.description}
Event Alias:
- ${formData.name}
Event Type: ${formData.eventType}
Trigger: ${formData.trigger}
Source: ${formData.source}
Event Time: ${formData.eventTime}
GA4 Event Name: ${formData.ga4EventName}
GA4 Params Map: "${formData.ga4ParamsMap}"
Adobe XDM Event Type: ${formData.adobeXdmEventType}
Adobe XDM Map: "${formData.adobeXdmMap}"
Adobe ACDL Event: ${formData.adobeAcdlEvent}
Adobe ACDL Map: "${formData.adobeAcdlMap}"
Required Fields: ${formData.requiredFields}
Generic Context Required: ${formData.genericContextRequired}
Generic Context Optional: ${formData.genericContextOptional}
XDM Field Groups: ${formData.xdmFieldGroups}
Primary KPIs: ${formData.primaryKpis}
Secondary KPIs: ${formData.secondaryKpis}
Metrics Used: ${formData.metricsUsed}
Dimensions Used: ${formData.dimensionsUsed}
Example Generic JSON: "${formData.exampleGenericJson}"
Example GA4 JSON: "${formData.exampleGa4Json}"
Example XDM JSON: "${formData.exampleXdmJson}"
Example ACDL JSON: "${formData.exampleAcdlJson}"
Frequency Limit: ${formData.frequencyLimit}
PII Risk: ${formData.piiRisk}
Data Sensitivity: ${formData.dataSensitivity}
Calculation Notes: ${formData.calculationNotes}
Contributed By: ${formData.contributedBy}
Validation Status: Unverified
Owner: ${formData.owner}
Tags: '${tags.join(' ')}'
Version: v1.0
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

## Event Details

<div class="mui-section">
**Event Type**: ${formData.eventType}

**Trigger**: ${formData.trigger}

**Source**: ${formData.source}

**Event Time**: ${formData.eventTime}
</div>

## Platform Mappings

<div class="mui-section">
**GA4 Event Name**: ${formData.ga4EventName}

**GA4 Params Map**

<div class="mui-code-block" data-language="json">${formData.ga4ParamsMap}</div>

**Adobe XDM Event Type**: ${formData.adobeXdmEventType}

**Adobe XDM Map**

<div class="mui-code-block" data-language="json">${formData.adobeXdmMap}</div>

**Adobe ACDL Event**: ${formData.adobeAcdlEvent}

**Adobe ACDL Map**

<div class="mui-code-block" data-language="json">${formData.adobeAcdlMap}</div>
</div>

## Data Requirements

<div class="mui-section">
**Required Fields**: ${formData.requiredFields}

**Generic Context Required**: ${formData.genericContextRequired}

**Generic Context Optional**: ${formData.genericContextOptional}

**XDM Field Groups**: ${formData.xdmFieldGroups}
</div>

## Analytics Integration

<div class="mui-section">
**Primary KPIs**: ${formData.primaryKpis}

**Secondary KPIs**: ${formData.secondaryKpis}

**Metrics Used**: ${formData.metricsUsed}

**Dimensions Used**: ${formData.dimensionsUsed}
</div>

## JSON Examples

<div class="mui-section">
**Example Generic JSON**

<div class="mui-code-block" data-language="json">${formData.exampleGenericJson}</div>

**Example GA4 JSON**

<div class="mui-code-block" data-language="json">${formData.exampleGa4Json}</div>

**Example XDM JSON**

<div class="mui-code-block" data-language="json">${formData.exampleXdmJson}</div>

**Example ACDL JSON**

<div class="mui-code-block" data-language="json">${formData.exampleAcdlJson}</div>
</div>

## Configuration

<div class="mui-section">
**Frequency Limit**: ${formData.frequencyLimit}

**PII Risk**: ${formData.piiRisk}

**Data Sensitivity**: ${formData.dataSensitivity}
</div>

## Documentation

<div class="mui-section">
**Calculation Notes**: ${formData.calculationNotes}

**Contributed By**: ${formData.contributedBy}

**Owner**: ${formData.owner}
</div>

## Governance

<div class="mui-section">
**Validation Status**: Unverified

**Version**: v1.0

**Last Updated**: ${new Date().toISOString()}
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
        commitMessage: `Add new ${formData.name} event`
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
        throw new Error(result.error || 'Failed to create event');
      }

      setSuccess('Event created successfully! Redirecting to edit mode...');
      
      // Redirect to the new event page in edit mode
      setTimeout(() => {
        window.location.href = `/events/${id}?edit=1`;
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Create New Event" description="Create a new event definition">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!user.authenticated) {
    return (
      <Layout title="Create New Event" description="Create a new event definition">
        <Box maxWidth="800px" mx="auto" p={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h4" gutterBottom>
                Sign In Required
              </Typography>
              <Typography variant="body1" paragraph>
                You need to sign in with GitHub to create a new event.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleSignIn}
                startIcon={<GitHubIcon />}
                sx={{ mt: 2 }}
              >
                Sign in with GitHub
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Create New Event" description="Create a new event definition">
      <Box maxWidth="1000px" mx="auto" p={3}>
        <Typography variant="h3" gutterBottom>
          Create New Event
        </Typography>
        
        <Typography variant="body1" paragraph color="text.secondary">
          Fill out the form below to create a new event definition. Your submission will be reviewed by maintainers.
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
                Event Information
              </Typography>
              <Chip 
                label={`Signed in as: ${user.login}`} 
                color="primary" 
                variant="outlined" 
              />
            </Box>

            <Box display="flex" flexDirection="column" gap={3}>
              {/* Basic Information */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <TextField
                    label="Event Name"
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

              {/* Event Details */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Event Details
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Event Type</InputLabel>
                    <Select
                      value={formData.eventType}
                      onChange={handleInputChange('eventType')}
                      label="Event Type"
                      required
                    >
                      {EVENT_TYPES.map(type => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Trigger"
                    value={formData.trigger}
                    onChange={handleInputChange('trigger')}
                    sx={{ minWidth: 250 }}
                    placeholder="e.g., User clicks checkout button"
                  />
                  <TextField
                    label="Source"
                    value={formData.source}
                    onChange={handleInputChange('source')}
                    sx={{ minWidth: 250 }}
                    placeholder="e.g., Website, Mobile App"
                  />
                </Box>
              </Box>

              <Divider />

              {/* Description */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Description
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
                    value={formData.ga4EventName}
                    onChange={handleInputChange('ga4EventName')}
                    sx={{ minWidth: 250 }}
                  />
                  <TextField
                    label="Adobe XDM Event Type"
                    value={formData.adobeXdmEventType}
                    onChange={handleInputChange('adobeXdmEventType')}
                    sx={{ minWidth: 250 }}
                  />
                  <TextField
                    label="Adobe ACDL Event"
                    value={formData.adobeAcdlEvent}
                    onChange={handleInputChange('adobeAcdlEvent')}
                    sx={{ minWidth: 250 }}
                  />
                </Box>
              </Box>

              <Divider />

              {/* JSON Examples */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  JSON Examples
                </Typography>
                <TextField
                  label="Example Generic JSON"
                  value={formData.exampleGenericJson}
                  onChange={handleInputChange('exampleGenericJson')}
                  multiline
                  rows={3}
                  fullWidth
                  placeholder='{"event": "purchase", "transaction_id": "T_12345"}'
                />
                <TextField
                  label="Example GA4 JSON"
                  value={formData.exampleGa4Json}
                  onChange={handleInputChange('exampleGa4Json')}
                  multiline
                  rows={3}
                  fullWidth
                  sx={{ mt: 2 }}
                  placeholder='{"event_name": "purchase", "transaction_id": "T_12345"}'
                />
              </Box>

              <Divider />

              {/* Additional Information */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Additional Information
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <TextField
                    label="Required Fields"
                    value={formData.requiredFields}
                    onChange={handleInputChange('requiredFields')}
                    sx={{ minWidth: 250 }}
                    placeholder="e.g., user_id, session_id"
                  />
                  <TextField
                    label="Primary KPIs"
                    value={formData.primaryKpis}
                    onChange={handleInputChange('primaryKpis')}
                    sx={{ minWidth: 250 }}
                    placeholder="e.g., Conversion Rate, Revenue"
                  />
                  <TextField
                    label="Tags (comma-separated)"
                    value={formData.tags}
                    onChange={handleInputChange('tags')}
                    sx={{ minWidth: 300 }}
                    placeholder="e.g., conversion, ecommerce, purchase"
                  />
                </Box>
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
                  disabled={creating || !formData.name || !formData.description}
                  startIcon={creating ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {creating ? 'Creating Event...' : 'Create Event'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}
