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
  'User',
  'Session',
  'Page',
  'Product',
  'Campaign',
  'Device',
  'Geography',
  'Time',
  'Custom',
  'Other'
];

const DATA_TYPES = [
  'String',
  'Number',
  'Boolean',
  'Date',
  'Array',
  'Object',
  'Other'
];

const SCOPES = [
  'User',
  'Session',
  'Event',
  'Page',
  'Global',
  'Other'
];

export default function NewDimensionPage() {
  const [user, setUser] = useState<User>({ authenticated: false });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    type: 'dimensions',
    name: '',
    industry: '',
    category: '',
    dataType: '',
    scope: '',
    persistence: '',
    description: '',
    gaMapping: '',
    adobeMapping: '',
    xdmMapping: '',
    genericMapping: '',
    allowedValues: '',
    caseSensitivity: 'Case Sensitive',
    sampleValues: '',
    biSourceSystem: '',
    reportAttribute: '',
    joinKeys: '',
    requiredOnEvents: '',
    validationRules: '',
    calculationNotes: '',
    contributedBy: '',
    owner: '',
    tags: '',
    dataSensitivity: 'Low',
    piiFlag: false,
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
    
    return `Dimension Name: ${formData.name}
Description: ${formData.description}
Dimension Alias:
- ${formData.name}
Data Type: ${formData.dataType}
Scope: ${formData.scope}
Persistence: ${formData.persistence}
Industry:
- ${formData.industry}
Category: ${formData.category}
GA Mapping: ${formData.gaMapping}
Adobe Mapping: ${formData.adobeMapping}
XDM Mapping: ${formData.xdmMapping}
Generic Mapping: ${formData.genericMapping}
Allowed Values / Format: ${formData.allowedValues}
Case Sensitivity: ${formData.caseSensitivity}
Sample Values: ${formData.sampleValues}
BI Source System:
- ${formData.biSourceSystem}
Report Attribute: ${formData.reportAttribute}
Join Keys: ${formData.joinKeys}
Required On Events: ${formData.requiredOnEvents}
Validation Rules: ${formData.validationRules}
Calculation Notes: ${formData.calculationNotes}
Contributed By: ${formData.contributedBy}
Validation Status: Unverified
Owner: ${formData.owner}
Tags: '${tags.join(' ')}'
Data Sensitivity: ${formData.dataSensitivity}
PII Flag: ${formData.piiFlag}
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

## Dimension Details

<div class="mui-section">
**Data Type**: ${formData.dataType}

**Scope**: ${formData.scope}

**Persistence**: ${formData.persistence}

**Industry**: ${formData.industry}

**Category**: ${formData.category}
</div>

## Platform Mappings

<div class="mui-section">
**GA Mapping**: ${formData.gaMapping}

**Adobe Mapping**: ${formData.adobeMapping}

**XDM Mapping**: ${formData.xdmMapping}

**Generic Mapping**: ${formData.genericMapping}
</div>

## Data Configuration

<div class="mui-section">
**Allowed Values / Format**: ${formData.allowedValues}

**Case Sensitivity**: ${formData.caseSensitivity}

**Sample Values**: ${formData.sampleValues}
</div>

## Technical Implementation

<div class="mui-section">
**BI Source System**: ${formData.biSourceSystem}

**Report Attribute**: ${formData.reportAttribute}

**Join Keys**: ${formData.joinKeys}

**Required On Events**: ${formData.requiredOnEvents}
</div>

## Validation & Rules

<div class="mui-section">
**Validation Rules**: ${formData.validationRules}

**Calculation Notes**: ${formData.calculationNotes}
</div>

## Documentation

<div class="mui-section">
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
        commitMessage: `Add new ${formData.name} dimension`
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
        throw new Error(result.error || 'Failed to create dimension');
      }

      setSuccess('Dimension created successfully! Redirecting to edit mode...');
      
      // Redirect to the new dimension page in edit mode
      setTimeout(() => {
        window.location.href = `/dimensions/${id}?edit=1`;
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create dimension');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Create New Dimension" description="Create a new dimension definition">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!user.authenticated) {
    return (
      <Layout title="Create New Dimension" description="Create a new dimension definition">
        <Box maxWidth="800px" mx="auto" p={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h4" gutterBottom>
                Sign In Required
              </Typography>
              <Typography variant="body1" paragraph>
                You need to sign in with GitHub to create a new dimension.
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
    <Layout title="Create New Dimension" description="Create a new dimension definition">
      <Box maxWidth="1000px" mx="auto" p={3}>
        <Typography variant="h3" gutterBottom>
          Create New Dimension
        </Typography>
        
        <Typography variant="body1" paragraph color="text.secondary">
          Fill out the form below to create a new dimension definition. Your submission will be reviewed by maintainers.
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
                Dimension Information
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
                    label="Dimension Name"
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
                    <InputLabel>Data Type</InputLabel>
                    <Select
                      value={formData.dataType}
                      onChange={handleInputChange('dataType')}
                      label="Data Type"
                      required
                    >
                      {DATA_TYPES.map(type => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Scope</InputLabel>
                    <Select
                      value={formData.scope}
                      onChange={handleInputChange('scope')}
                      label="Scope"
                      required
                    >
                      {SCOPES.map(scope => (
                        <MenuItem key={scope} value={scope}>
                          {scope}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Persistence"
                    value={formData.persistence}
                    onChange={handleInputChange('persistence')}
                    sx={{ minWidth: 200 }}
                    placeholder="e.g., Session, User, Event"
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
                    label="GA Mapping"
                    value={formData.gaMapping}
                    onChange={handleInputChange('gaMapping')}
                    sx={{ minWidth: 250 }}
                    placeholder="e.g., page_title"
                  />
                  <TextField
                    label="Adobe Mapping"
                    value={formData.adobeMapping}
                    onChange={handleInputChange('adobeMapping')}
                    sx={{ minWidth: 250 }}
                    placeholder="e.g., pageName"
                  />
                  <TextField
                    label="XDM Mapping"
                    value={formData.xdmMapping}
                    onChange={handleInputChange('xdmMapping')}
                    sx={{ minWidth: 250 }}
                    placeholder="e.g., web.webPageDetails.name"
                  />
                </Box>
              </Box>

              <Divider />

              {/* Data Configuration */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Data Configuration
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <TextField
                    label="Allowed Values / Format"
                    value={formData.allowedValues}
                    onChange={handleInputChange('allowedValues')}
                    sx={{ minWidth: 300 }}
                    placeholder="e.g., String, 1-100, true/false"
                  />
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Case Sensitivity</InputLabel>
                    <Select
                      value={formData.caseSensitivity}
                      onChange={handleInputChange('caseSensitivity')}
                      label="Case Sensitivity"
                    >
                      <MenuItem value="Case Sensitive">Case Sensitive</MenuItem>
                      <MenuItem value="Case Insensitive">Case Insensitive</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <TextField
                  label="Sample Values"
                  value={formData.sampleValues}
                  onChange={handleInputChange('sampleValues')}
                  fullWidth
                  sx={{ mt: 2 }}
                  placeholder="e.g., Homepage, Product Page, Checkout"
                />
              </Box>

              <Divider />

              {/* Technical Implementation */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Technical Implementation
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <TextField
                    label="BI Source System"
                    value={formData.biSourceSystem}
                    onChange={handleInputChange('biSourceSystem')}
                    sx={{ minWidth: 250 }}
                    placeholder="e.g., GA4, Adobe Analytics"
                  />
                  <TextField
                    label="Report Attribute"
                    value={formData.reportAttribute}
                    onChange={handleInputChange('reportAttribute')}
                    sx={{ minWidth: 250 }}
                    placeholder="e.g., Page Name, User ID"
                  />
                  <TextField
                    label="Join Keys"
                    value={formData.joinKeys}
                    onChange={handleInputChange('joinKeys')}
                    sx={{ minWidth: 250 }}
                    placeholder="e.g., user_id, session_id"
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
                    label="Required On Events"
                    value={formData.requiredOnEvents}
                    onChange={handleInputChange('requiredOnEvents')}
                    sx={{ minWidth: 250 }}
                    placeholder="e.g., page_view, purchase"
                  />
                  <TextField
                    label="Validation Rules"
                    value={formData.validationRules}
                    onChange={handleInputChange('validationRules')}
                    sx={{ minWidth: 250 }}
                    placeholder="e.g., Must be non-empty string"
                  />
                  <TextField
                    label="Tags (comma-separated)"
                    value={formData.tags}
                    onChange={handleInputChange('tags')}
                    sx={{ minWidth: 300 }}
                    placeholder="e.g., user, session, page"
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
                  {creating ? 'Creating Dimension...' : 'Create Dimension'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}
