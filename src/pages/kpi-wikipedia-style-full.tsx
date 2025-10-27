/**
 * KPI Wikipedia-Style Edit Page - FULL VERSION
 * 
 * Edit directly on the page like Wikipedia with ALL fields
 * Access via: /kpi-detail?slug=kpi-slug&edit=1
 */

import React, { useState, useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import { useLocation } from '@docusaurus/router';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { supabase, getCurrentUser, syncToGitHub } from '../lib/supabase';

const CATEGORIES = ['Conversion', 'Revenue', 'Engagement', 'Retention', 'Acquisition', 'Performance', 'Quality', 'Efficiency', 'Satisfaction', 'Growth', 'Other'];
const INDUSTRIES = ['Retail', 'E-commerce', 'SaaS', 'Healthcare', 'Education', 'Finance', 'Media', 'Technology', 'Manufacturing', 'Other'];
const PRIORITIES = ['High', 'Medium', 'Low'];
const KPI_TYPES = ['Counter', 'Rate', 'Ratio', 'Percentage', 'Average', 'Sum'];
const SCOPES = ['User', 'Session', 'Event', 'Global'];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function KpiWikipediaStyleFullPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  const shouldEdit = params.get('edit') === '1';
  
  const [user, setUser] = useState<any>(null);
  const [kpi, setKpi] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(shouldEdit);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    description: '',
    formula: '',
    category: '',
    tags: [] as string[],
    
    // Business Context
    industry: '',
    priority: '',
    core_area: '',
    scope: '',
    
    // Technical Details
    kpi_type: '',
    measure: '',
    aggregation_window: '',
    
    // Platform Implementation
    ga4_implementation: '',
    adobe_implementation: '',
    amplitude_implementation: '',
    
    // Data Mappings
    data_layer_mapping: '',
    xdm_mapping: '',
    
    // Implementation
    dependencies: '',
    bi_source_system: '',
    report_attributes: '',
    
    // Usage & Analytics
    dashboard_usage: '',
    segment_eligibility: '',
    related_kpis: [] as string[],
    
    // SQL Examples
    sql_query: '',
    
    // Documentation
    calculation_notes: '',
    details: '',
  });

  useEffect(() => {
    if (slug) {
      loadData();
    }
  }, [slug]);

  // Initialize code block toolbars after render
  useEffect(() => {
    if (!isEditing && kpi) {
      // Trigger toolbar initialization for existing code blocks
      const blocks = document.querySelectorAll('.mui-code-block');
      blocks.forEach(block => {
        // Dispatch a custom event to trigger toolbar attachment
        const event = new CustomEvent('mui-code-block-mounted', { bubbles: true });
        block.dispatchEvent(event);
      });
      
      // Manually trigger mountAll if the function exists
      if (typeof window !== 'undefined' && (window as any).__muiCodeToolbarMountAll) {
        (window as any).__muiCodeToolbarMountAll();
      }
    }
  }, [isEditing, kpi]);

  async function loadData() {
    setLoading(true);
    
    const currentUser = await getCurrentUser();
    setUser(currentUser);

    const { data: kpiData, error: kpiError } = await supabase
      .from('kpis')
      .select('*')
      .eq('slug', slug)
      .single();

    if (kpiError || !kpiData) {
      setError('KPI not found');
      setLoading(false);
      return;
    }

    setKpi(kpiData);
    setFormData({
      name: kpiData.name || '',
      description: kpiData.description || '',
      formula: kpiData.formula || '',
      category: kpiData.category || '',
      tags: kpiData.tags || [],
      industry: kpiData.industry || '',
      priority: kpiData.priority || '',
      core_area: kpiData.core_area || '',
      scope: kpiData.scope || '',
      kpi_type: kpiData.kpi_type || '',
      measure: kpiData.measure || '',
      aggregation_window: kpiData.aggregation_window || '',
      ga4_implementation: kpiData.ga4_implementation || '',
      adobe_implementation: kpiData.adobe_implementation || '',
      amplitude_implementation: kpiData.amplitude_implementation || '',
      data_layer_mapping: kpiData.data_layer_mapping || '',
      xdm_mapping: kpiData.xdm_mapping || '',
      dependencies: kpiData.dependencies || '',
      bi_source_system: kpiData.bi_source_system || '',
      report_attributes: kpiData.report_attributes || '',
      dashboard_usage: kpiData.dashboard_usage || '',
      segment_eligibility: kpiData.segment_eligibility || '',
      related_kpis: kpiData.related_kpis || [],
      sql_query: kpiData.sql_query || '',
      calculation_notes: kpiData.calculation_notes || '',
      details: kpiData.details || '',
    });
    setLoading(false);
  }

  async function handleSave() {
    if (!user || !kpi) {
      setError('Please sign in to edit');
      return;
    }

    // Check if user is the author
    const canEdit = kpi.created_by === user.user_metadata?.user_name || kpi.created_by === user.email;
    if (!canEdit) {
      setError('You can only edit KPIs you created');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const userName = user.user_metadata?.user_name || user.email;

      const { error: updateError } = await supabase
        .from('kpis')
        .update({
          ...formData,
          last_modified_by: userName,
          last_modified_at: new Date().toISOString(),
        })
        .eq('id', kpi.id);

      if (updateError) {
        setError(updateError.message || 'Failed to update KPI');
        setSaving(false);
        return;
      }

      // Only sync to GitHub/MDX if status is 'published'
      if (formData.status === 'published') {
        await syncToGitHub('kpis', kpi.id, 'edited');
        setSuccess('KPI updated successfully and synced to GitHub!');
      } else {
        setSuccess('KPI saved as draft. Publish to sync to MDX.');
      }
      setIsEditing(false);
      setTimeout(() => {
        setSuccess(null);
        loadData();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update KPI');
      setSaving(false);
    }
  }

  const canEdit = user && kpi && (
    kpi.created_by === user.user_metadata?.user_name || 
    kpi.created_by === user.email
  );

  if (loading) {
    return (
      <Layout title={`Loading KPI...`}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error || !kpi) {
    return (
      <Layout title="KPI Not Found">
        <Box p={4}>
          <Alert severity="error">{error || 'KPI not found'}</Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title={kpi.name}>
      <Box p={4} sx={{ width: '100%', maxWidth: 'none' }}>
        {/* Return Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => window.location.href = '/kpis'}
          sx={{ mb: 2 }}
        >
          Return to KPIs
        </Button>

        {/* Header with Edit Toggle */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box flex={1}>
            {isEditing ? (
              <TextField
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                variant="outlined"
                sx={{ fontSize: '2rem', fontWeight: 'bold' }}
              />
            ) : (
              <Typography variant="h3" gutterBottom>
                {kpi.name}
              </Typography>
            )}
            {kpi.status === 'draft' && (
              <Chip label="Draft" color="warning" size="small" sx={{ mb: 1 }} />
            )}
            {kpi.category && (
              <Chip label={kpi.category} size="small" sx={{ ml: 1 }} />
            )}
          </Box>
          {canEdit && (
            <Box display="flex" gap={2} alignItems="center" ml={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isEditing}
                    onChange={(e) => setIsEditing(e.target.checked)}
                  />
                }
                label="Edit Mode"
              />
              {isEditing && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => {
                      setIsEditing(false);
                      loadData();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save All'}
                  </Button>
                </>
              )}
            </Box>
          )}
        </Box>

        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {shouldEdit && !isEditing && (
          <Alert severity="success" sx={{ mb: 3 }}>
            KPI created successfully! Toggle "Edit Mode" above to edit all fields.
          </Alert>
        )}

        {/* Tabs for organizing fields */}
        {isEditing ? (
          <Card sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Basic Info" />
              <Tab label="Business Context" />
              <Tab label="Technical Details" />
              <Tab label="Platform Implementation" />
              <Tab label="Data Mappings" />
              <Tab label="Implementation" />
              <Tab label="Documentation" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Formula"
                multiline
                rows={2}
                value={formData.formula}
                onChange={(e) => setFormData(prev => ({ ...prev, formula: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {CATEGORIES.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                size="small"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
                      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
                      setTagInput('');
                    }
                  }
                }}
                placeholder="Add a tag..."
                sx={{ mb: 1 }}
              />
              <Box display="flex" flexWrap="wrap" gap={1}>
                {formData.tags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Select
                  value={formData.industry}
                  onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {INDUSTRIES.map(ind => (
                    <MenuItem key={ind} value={ind}>{ind}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {PRIORITIES.map(pri => (
                    <MenuItem key={pri} value={pri}>{pri}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Core Area"
                value={formData.core_area}
                onChange={(e) => setFormData(prev => ({ ...prev, core_area: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth>
                <Select
                  value={formData.scope}
                  onChange={(e) => setFormData(prev => ({ ...prev, scope: e.target.value }))}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {SCOPES.map(sc => (
                    <MenuItem key={sc} value={sc}>{sc}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Select
                  value={formData.kpi_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, kpi_type: e.target.value }))}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {KPI_TYPES.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Measure"
                value={formData.measure}
                onChange={(e) => setFormData(prev => ({ ...prev, measure: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Aggregation Window"
                value={formData.aggregation_window}
                onChange={(e) => setFormData(prev => ({ ...prev, aggregation_window: e.target.value }))}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <TextField
                fullWidth
                label="GA4 Implementation"
                multiline
                rows={3}
                value={formData.ga4_implementation}
                onChange={(e) => setFormData(prev => ({ ...prev, ga4_implementation: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Adobe Implementation"
                multiline
                rows={3}
                value={formData.adobe_implementation}
                onChange={(e) => setFormData(prev => ({ ...prev, adobe_implementation: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Amplitude Implementation"
                multiline
                rows={3}
                value={formData.amplitude_implementation}
                onChange={(e) => setFormData(prev => ({ ...prev, amplitude_implementation: e.target.value }))}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
              <TextField
                fullWidth
                label="Data Layer Mapping"
                multiline
                rows={3}
                value={formData.data_layer_mapping}
                onChange={(e) => setFormData(prev => ({ ...prev, data_layer_mapping: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="XDM Mapping"
                multiline
                rows={3}
                value={formData.xdm_mapping}
                onChange={(e) => setFormData(prev => ({ ...prev, xdm_mapping: e.target.value }))}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={5}>
              <TextField
                fullWidth
                label="Dependencies"
                multiline
                rows={2}
                value={formData.dependencies}
                onChange={(e) => setFormData(prev => ({ ...prev, dependencies: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="BI Source System"
                value={formData.bi_source_system}
                onChange={(e) => setFormData(prev => ({ ...prev, bi_source_system: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Report Attributes"
                multiline
                rows={2}
                value={formData.report_attributes}
                onChange={(e) => setFormData(prev => ({ ...prev, report_attributes: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Dashboard Usage"
                value={formData.dashboard_usage}
                onChange={(e) => setFormData(prev => ({ ...prev, dashboard_usage: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Segment Eligibility"
                value={formData.segment_eligibility}
                onChange={(e) => setFormData(prev => ({ ...prev, segment_eligibility: e.target.value }))}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={6}>
              <TextField
                fullWidth
                label="SQL Query"
                multiline
                rows={6}
                value={formData.sql_query}
                onChange={(e) => setFormData(prev => ({ ...prev, sql_query: e.target.value }))}
                sx={{ mb: 2, fontFamily: 'monospace' }}
              />
              <TextField
                fullWidth
                label="Calculation Notes"
                multiline
                rows={4}
                value={formData.calculation_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, calculation_notes: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Details"
                multiline
                rows={4}
                value={formData.details}
                onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
              />
            </TabPanel>
          </Card>
        ) : (
          <>
            {/* View Mode - Show all fields with MDX-style formatting */}
            <div className="mui-section">
              <h2>Overview</h2>
              <div className="mui-overview">{kpi.description || '—'}</div>
            </div>

            {kpi.formula && (
              <div className="mui-section">
                <h2>Formula</h2>
              <div className="mui-code-label">SQL</div>
              <div className="mui-code-block">{kpi.formula}</div>
              </div>
            )}

          {/* Platform Implementation */}
          {(kpi.ga4_implementation || kpi.adobe_implementation || kpi.amplitude_implementation) && (
            <div className="mui-section">
              <h2>Platform Implementation</h2>
              {kpi.ga4_implementation && <div><strong>GA4</strong>: <code>{kpi.ga4_implementation}</code></div>}
              {kpi.adobe_implementation && <div><strong>Adobe Analytics</strong>: <code>{kpi.adobe_implementation}</code></div>}
              {kpi.amplitude_implementation && <div><strong>Amplitude</strong>: <code>{kpi.amplitude_implementation}</code></div>}
            </div>
          )}

          {/* Business Context */}
          {(kpi.industry || kpi.priority || kpi.core_area || kpi.scope) && (
            <div className="mui-section">
              <h2>Business Context</h2>
              {kpi.industry && <div><strong>Industry</strong>: {kpi.industry}</div>}
              {kpi.category && <div><strong>Category</strong>: {kpi.category}</div>}
              {kpi.priority && <div><strong>Priority</strong>: {kpi.priority}</div>}
              {kpi.core_area && <div><strong>Core Area</strong>: {kpi.core_area}</div>}
              {kpi.scope && <div><strong>Scope</strong>: {kpi.scope}</div>}
            </div>
          )}

          {/* Technical Details */}
          {(kpi.kpi_type || kpi.measure || kpi.aggregation_window) && (
            <div className="mui-section">
              <h2>Technical Details</h2>
              {kpi.kpi_type && <div><strong>KPI Type</strong>: {kpi.kpi_type}</div>}
              {kpi.measure && <div><strong>Measure</strong>: {kpi.measure}</div>}
              {kpi.aggregation_window && <div><strong>Aggregation Window</strong>: {kpi.aggregation_window}</div>}
            </div>
          )}

          {/* Data Mappings */}
          {(kpi.data_layer_mapping || kpi.xdm_mapping) && (
            <div className="mui-section">
              <h2>Data Mappings</h2>
              {kpi.data_layer_mapping && (
                <>
                  <div><strong>Data Layer Mapping</strong></div>
                  <div className="mui-code-block" data-language="json">{kpi.data_layer_mapping}</div>
                </>
              )}
              {kpi.xdm_mapping && (
                <>
                  <div><strong>XDM Mapping</strong></div>
                  <div className="mui-code-block" data-language="json">{kpi.xdm_mapping}</div>
                </>
              )}
            </div>
          )}

          {/* Implementation */}
          {(kpi.dependencies || kpi.bi_source_system || kpi.report_attributes) && (
            <div className="mui-section">
              <h2>Implementation</h2>
              {kpi.dependencies && <div><strong>Dependencies</strong>: {kpi.dependencies}</div>}
              {kpi.bi_source_system && <div><strong>BI Source System</strong>: {kpi.bi_source_system}</div>}
              {kpi.report_attributes && <div><strong>Report Attribute</strong>: {kpi.report_attributes}</div>}
            </div>
          )}

          {/* Usage & Analytics */}
          {(kpi.dashboard_usage || kpi.segment_eligibility || (kpi.related_kpis && kpi.related_kpis.length > 0)) && (
            <div className="mui-section">
              <h2>Usage & Analytics</h2>
              {kpi.dashboard_usage && <div><strong>Dashboard Usage</strong>: {kpi.dashboard_usage}</div>}
              {kpi.segment_eligibility && <div><strong>Segment Eligibility</strong>: {kpi.segment_eligibility}</div>}
              {kpi.related_kpis && kpi.related_kpis.length > 0 && (
                <div><strong>Related KPIs</strong>: {kpi.related_kpis.join(', ')}</div>
              )}
            </div>
          )}

          {/* SQL Examples */}
          {kpi.sql_query && (
            <div className="mui-section">
              <h2>SQL Examples</h2>
              <div><strong>SQL Query Example</strong></div>
              <div className="mui-code-block" data-language="sql">{kpi.sql_query}</div>
            </div>
          )}

          {/* Documentation */}
          {(kpi.calculation_notes || kpi.details) && (
            <div className="mui-section">
              <h2>Documentation</h2>
              {kpi.calculation_notes && <div><strong>Calculation Notes</strong>: {kpi.calculation_notes}</div>}
              {kpi.details && <div><strong>Details</strong>: {kpi.details}</div>}
              <div><strong>Contributed By</strong>: {kpi.created_by}</div>
            </div>
          )}

          {/* Tags */}
          {kpi.tags && kpi.tags.length > 0 && (
            <div className="mui-section">
              <h2>Tags</h2>
              <div>{kpi.tags.map((tag: string) => tag).join(', ')}</div>
            </div>
          )}
          </>
        )}
      </Box>
    </Layout>
  );
}

