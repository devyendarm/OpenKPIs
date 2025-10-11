import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { 
  Box, Card, CardContent, TextField, Button, Typography, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Chip, Divider
} from '@mui/material';
import { Save as SaveIcon, GitHub as GitHubIcon } from '@mui/icons-material';

const WORKER_BASE_URL = 'https://oauthgithub.openkpis.org';

interface User { authenticated: boolean; login?: string; name?: string; avatar_url?: string; }
interface CreateResult { success: boolean; prUrl?: string; headRepoFullName?: string; headBranch?: string; prNumber?: number; error?: string; message?: string; }

const INDUSTRIES = ['Retail','E-commerce','SaaS','Healthcare','Education','Finance','Media','Technology','Manufacturing','Other'];
const CATEGORIES = ['Conversion','Revenue','Engagement','Retention','Acquisition','Performance','Quality','Efficiency','Satisfaction','Growth','Other'];

export default function NewMetricPage() {
  const baseUrl = useBaseUrl('/');
  const [user, setUser] = useState<User>({ authenticated: false });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: 'metrics',
    name: '',
    industry: '',
    category: '',
    description: '',
    formula: '',
    dataLayerMapping: '',
    xdmMapping: '',
    dependencies: '',
    biSourceSystem: '',
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
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const generateId = (name: string): string => name.toLowerCase().replace(/[^a-z0-9\s]/g,'').replace(/\s+/g,'_').replace(/_+/g,'_').replace(/^_|_$/g,'');

  const generateYamlContent = (): string => {
    const tags = formData.tags.split(',').map(t=>t.trim()).filter(Boolean);
    return `Metric Name: ${formData.name}
Description: ${formData.description}
Metric Alias:\n- ${formData.name}
Industry:\n- ${formData.industry}
Category: ${formData.category}
Formula: ${formData.formula}
BI Source System:\n- ${formData.biSourceSystem}
Data Layer Mapping: "${formData.dataLayerMapping}"
XDM Mapping: "${formData.xdmMapping}"
Dependencies: ${formData.dependencies}
Report Attribute:\n- ${formData.reportAttribute}
Dashboard Usage:\n- ${formData.dashboardUsage}
Segment Eligibility:\n- ${formData.segmentEligibility}
SQL Query Example:\n- sql<br>${formData.sqlExample}
Calculation Notes:\n- ${formData.calculationNotes}
Contributed By: ${formData.contributedBy}
Validation Status: Unverified
Owner: ${formData.owner}
Tags: '${tags.join(' ')}'
Data Sensitivity: ${formData.dataSensitivity}
PII Flag: ${formData.piiFlag}
Version: v1.0
Details: ${formData.description}
Last Updated: '${new Date().toISOString()}'`;
  };

  const generateMdxContent = (): string => {
    const id = generateId(formData.name);
    const tags = formData.tags.split(',').map(t=>t.trim()).filter(Boolean);
    return `---\nid: "${id}"\ntitle: "${formData.name}"\ndescription: "${formData.description}"\ntags: [${tags.map(t=>`"${t}"`).join(',')}]\nslug: "/${id}"\ntoc_min_heading_level: 2\ntoc_max_heading_level: 4\nhide_table_of_contents: false\n---\n\nimport KpiEditorWrapper from '@site/src/components/KpiEditorWrapper';\n\n<div class="mui-section">\n<h2>Overview</h2>\n<div class="mui-overview">${formData.description}</div>\n</div>\n\n<div class="mui-section">\n<h2>Formula</h2>\n<div class="mui-code-label">SQL</div>\n<div class="mui-code-block">${formData.formula}</div>\n</div>\n\n## Technical Details\n\n<div class="mui-section">\n**Data Layer Mapping**\n\n<div class="mui-code-block" data-language="json">${formData.dataLayerMapping}</div>\n\n**XDM Mapping**\n\n<div class="mui-code-block" data-language="json">${formData.xdmMapping}</div>\n</div>\n\n## Implementation\n\n<div class="mui-section">\n**Dependencies**: ${formData.dependencies}\n\n**BI Source System**: ${formData.biSourceSystem}\n\n**Report Attribute**: ${formData.reportAttribute}\n</div>\n\n## Usage & Analytics\n\n<div class="mui-section">\n**Dashboard Usage**: ${formData.dashboardUsage}\n\n**Segment Eligibility**: ${formData.segmentEligibility}\n</div>\n\n## SQL Examples\n\n<div class="mui-section">\n**SQL Query Example**\n\n<div class="mui-code-block" data-language="sql">${formData.sqlExample}</div>\n</div>\n\n## Documentation\n\n<div class="mui-section">\n**Calculation Notes**: ${formData.calculationNotes}\n\n**Contributed By**: ${formData.contributedBy}\n\n**Owner**: ${formData.owner}\n</div>\n\n## Governance\n\n<div class="mui-section">\n**Validation Status**: Unverified\n\n**Version**: v1.0\n\n**Last Updated**: ${new Date().toISOString()}\n\n**Data Sensitivity**: ${formData.dataSensitivity}\n\n**PII Flag**: ${formData.piiFlag}\n</div>\n\n<KpiEditorWrapper kpiId="${id}" section="metrics" />`;
  };

  const handleSubmit = async () => {
    setCreating(true);
    setError(null);
    setSuccess(null);
    try {
      const id = generateId(formData.name);
      const yamlPath = `data-layer/metrics/${id}.yml`;
      const mdxPath = `docs/metrics/${id}.mdx`;
      const commitData = {
        mode: 'create' as const,
        id,
        yamlPath,
        mdxPath,
        yamlContent: generateYamlContent(),
        mdxContent: generateMdxContent(),
        commitMessage: `feat(metrics): add ${formData.name}`
      };
      const response = await fetch(`${WORKER_BASE_URL}/commit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(commitData)
      });
      const result: CreateResult = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create metric');
      setSuccess('Metric created successfully! Redirecting to edit mode...');
      setTimeout(() => {
        const dest = `${(baseUrl || '/').replace(/\/$/, '')}/metrics/${id}?edit=1`;
        window.location.href = dest;
      }, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create metric');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Create New Metric" description="Create a new metric">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Create New Metric" description="Create a new metric">
      <Box maxWidth="1000px" mx="auto" p={3}>
        <Typography variant="h3" gutterBottom>Create New Metric</Typography>
        {!user.authenticated && (
          <Alert severity="info" sx={{ mb: 2 }}>Sign in with GitHub to enable submission. Your work will be saved to a PR.</Alert>
        )}

        {error && (<Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>)}
        {success && (<Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>)}

        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">Metric Information</Typography>
              {user.authenticated ? (
                <Chip label={`Signed in as: ${user.login}`} color="primary" variant="outlined" />
              ) : (
                <a href={loginUrl} style={{ textDecoration: 'none' }}>
                  <Button variant="contained" startIcon={<GitHubIcon />}>Sign in with GitHub</Button>
                </a>
              )}
            </Box>

            <Box display="flex" flexDirection="column" gap={3}>
              <Box>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <TextField label="Metric Name" value={formData.name} onChange={handleInputChange('name')} required fullWidth sx={{ minWidth: 300 }} />
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Industry</InputLabel>
                    <Select value={formData.industry} onChange={handleInputChange('industry')} label="Industry" required>
                      {INDUSTRIES.map(v => (<MenuItem key={v} value={v}>{v}</MenuItem>))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Category</InputLabel>
                    <Select value={formData.category} onChange={handleInputChange('category')} label="Category" required>
                      {CATEGORIES.map(v => (<MenuItem key={v} value={v}>{v}</MenuItem>))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" gutterBottom>Description & Formula</Typography>
                <TextField label="Description" value={formData.description} onChange={handleInputChange('description')} multiline rows={3} fullWidth required />
                <TextField label="Formula" value={formData.formula} onChange={handleInputChange('formula')} fullWidth required sx={{ mt: 2 }} placeholder="e.g., SUM(revenue) / COUNT(sessions)" />
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" gutterBottom>Data Mappings</Typography>
                <TextField label="Data Layer Mapping" value={formData.dataLayerMapping} onChange={handleInputChange('dataLayerMapping')} multiline rows={3} fullWidth placeholder='{"metric": "revenue"}' />
                <TextField label="XDM Mapping" value={formData.xdmMapping} onChange={handleInputChange('xdmMapping')} multiline rows={3} fullWidth sx={{ mt: 2 }} placeholder='{"xdm:metric": "commerce.revenue"}' />
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" gutterBottom>Implementation & Usage</Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <TextField label="Dependencies" value={formData.dependencies} onChange={handleInputChange('dependencies')} sx={{ minWidth: 250 }} />
                  <TextField label="BI Source System" value={formData.biSourceSystem} onChange={handleInputChange('biSourceSystem')} sx={{ minWidth: 250 }} />
                  <TextField label="Report Attribute" value={formData.reportAttribute} onChange={handleInputChange('reportAttribute')} sx={{ minWidth: 250 }} />
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" gutterBottom>SQL Example</Typography>
                <TextField label="SQL Query Example" value={formData.sqlExample} onChange={handleInputChange('sqlExample')} multiline rows={4} fullWidth placeholder="SELECT SUM(revenue) FROM fact_orders" />
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" gutterBottom>Documentation</Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <TextField label="Calculation Notes" value={formData.calculationNotes} onChange={handleInputChange('calculationNotes')} sx={{ minWidth: 300 }} />
                  <TextField label="Contributed By" value={formData.contributedBy} onChange={handleInputChange('contributedBy')} sx={{ minWidth: 250 }} placeholder={user.name || user.login} />
                  <TextField label="Owner" value={formData.owner} onChange={handleInputChange('owner')} sx={{ minWidth: 250 }} placeholder="Digital Analytics Team" />
                  <TextField label="Tags (comma-separated)" value={formData.tags} onChange={handleInputChange('tags')} sx={{ minWidth: 300 }} placeholder="e.g., revenue, efficiency" />
                </Box>
              </Box>

              <Box display="flex" justifyContent="center" mt={4}>
                <Button variant="contained" size="large" onClick={handleSubmit} disabled={creating || !user.authenticated || !formData.name || !formData.description || !formData.formula} startIcon={creating ? <CircularProgress size={20} /> : <SaveIcon />}>
                  {creating ? 'Creating Metric...' : 'Create Metric'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}


