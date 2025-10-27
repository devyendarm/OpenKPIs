/**
 * KPI Edit Button - Full Wikipedia-style edit with ALL attributes
 * 
 * Comprehensive edit form with all KPI fields from YAML schema
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Typography,
  Divider,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { supabase, getCurrentUser, syncToGitHub } from '../lib/supabase';

const CATEGORIES = [
  'Conversion', 'Revenue', 'Engagement', 'Retention', 'Acquisition',
  'Performance', 'Quality', 'Efficiency', 'Satisfaction', 'Growth', 'Other'
];

const INDUSTRIES = [
  'Retail', 'E-commerce', 'SaaS', 'Healthcare', 'Education',
  'Finance', 'Media', 'Technology', 'Manufacturing', 'Other'
];

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

interface KpiEditButtonExpandedProps {
  slug: string;
  onClose?: () => void;
}

export default function KpiEditButtonExpanded({ slug, onClose }: KpiEditButtonExpandedProps) {
  const [user, setUser] = useState<any>(null);
  const [kpi, setKpi] = useState<any>(null);
  const [open, setOpen] = useState(true); // Auto-open when used as page component
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Comprehensive form state
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
    metric: '',
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
    related_kpis: '',
    
    // SQL Examples
    sql_query: '',
    
    // Documentation
    calculation_notes: '',
    details: '',
    
    // Governance (read-only for users)
    validation_status: '',
    data_sensitivity: '',
    pii_flag: false,
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    checkAuth();
  }, [slug]);

  async function checkAuth() {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    
    await loadKpi();
  }

  async function loadKpi() {
    const { data: kpiData, error } = await supabase
      .from('kpis')
      .select('*')
      .eq('slug', slug)
      .single();

    if (kpiData) {
      setKpi(kpiData);
      
      // Populate all form fields from database
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
        metric: kpiData.metric || '',
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
        related_kpis: kpiData.related_kpis || '',
        sql_query: kpiData.sql_query || '',
        calculation_notes: kpiData.calculation_notes || '',
        details: kpiData.details || '',
        validation_status: kpiData.validation_status || '',
        data_sensitivity: kpiData.data_sensitivity || '',
        pii_flag: kpiData.pii_flag || false,
      });
    }
  }

  async function handleSave() {
    if (!user || !kpi) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const userName = user.user_metadata?.user_name || user.email;

      // Update ALL fields in Supabase
      const { error: updateError } = await supabase
        .from('kpis')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          formula: formData.formula.trim() || null,
          category: formData.category || null,
          tags: formData.tags,
          industry: formData.industry || null,
          priority: formData.priority || null,
          core_area: formData.core_area || null,
          scope: formData.scope || null,
          kpi_type: formData.kpi_type || null,
          metric: formData.metric || null,
          aggregation_window: formData.aggregation_window || null,
          ga4_implementation: formData.ga4_implementation || null,
          adobe_implementation: formData.adobe_implementation || null,
          amplitude_implementation: formData.amplitude_implementation || null,
          data_layer_mapping: formData.data_layer_mapping || null,
          xdm_mapping: formData.xdm_mapping || null,
          dependencies: formData.dependencies || null,
          bi_source_system: formData.bi_source_system || null,
          report_attributes: formData.report_attributes || null,
          dashboard_usage: formData.dashboard_usage || null,
          segment_eligibility: formData.segment_eligibility || null,
          related_kpis: formData.related_kpis || null,
          sql_query: formData.sql_query || null,
          calculation_notes: formData.calculation_notes || null,
          details: formData.details || null,
          last_modified_by: userName,
          last_modified_at: new Date().toISOString(),
        })
        .eq('id', kpi.id);

      if (updateError) {
        setError(updateError.message || 'Failed to update KPI');
        setSaving(false);
        return;
      }

      // Log to audit trail
      await supabase.from('audit_log').insert({
        table_name: 'kpis',
        record_id: kpi.id,
        action: 'edited',
        user_login: userName,
        user_name: user.user_metadata?.full_name || userName,
        user_email: user.email,
        user_avatar_url: user.user_metadata?.avatar_url,
        changes: formData,
      });

      setSuccess('KPI updated successfully! The page will reload.');
      setSaving(false);

      // Sync to GitHub in background
      syncToGitHub('kpis', kpi.id, 'edited').catch(err => {
        console.warn('GitHub sync error:', err);
      });

      // Reload page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'An unexpected error occurred');
      setSaving(false);
    }
  }

  function handleInputChange(field: string, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function handleAddTag() {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  }

  function handleDeleteTag(tagToDelete: string) {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  }

  const canEdit = user && kpi && (
    kpi.created_by === (user.user_metadata?.user_name || user.email) ||
    kpi.status === 'draft'
  );
  // Show debug messages
  if (!user) {
    return (
      <div style={{ position: 'fixed', top: '80px', right: '20px', padding: '8px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', fontSize: '12px', zIndex: 9999 }}>
        Please sign in to edit
      </div>
    );
  }

  if (!kpi) {
    return (
      <div style={{ position: 'fixed', top: '80px', right: '20px', padding: '8px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', fontSize: '12px', zIndex: 9999 }}>
        Loading KPI... (slug: {slug})
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div style={{ position: 'fixed', top: '80px', right: '20px', padding: '8px', backgroundColor: '#f8d7da', border: '1px solid #dc3545', borderRadius: '4px', fontSize: '12px', zIndex: 9999 }}>
        You cannot edit this KPI (created by: {kpi.created_by})
      </div>
    );
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<EditIcon />}
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          zIndex: 9999,
          backgroundColor: 'white',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        }}
      >
        Edit
      </Button>

      <Dialog open={open} onClose={() => { setOpen(false); onClose?.(); }} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Typography variant="h5">Edit KPI: {kpi?.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive edit - all attributes
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
              <Tab label="Basic Info" />
              <Tab label="Business Context" />
              <Tab label="Technical" />
              <Tab label="Implementation" />
              <Tab label="Data & SQL" />
              <Tab label="Documentation" />
            </Tabs>
          </Box>

          {/* Tab 1: Basic Info */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="KPI Name *"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                fullWidth
              />

              <TextField
                label="Formula"
                value={formData.formula}
                onChange={(e) => handleInputChange('formula', e.target.value)}
                placeholder="e.g., (Conversions / Visits) * 100"
                fullWidth
                multiline
                rows={2}
              />

              <TextField
                label="Description / Overview"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="What does this KPI measure?"
                fullWidth
                multiline
                rows={4}
              />

              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  label="Category"
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {CATEGORIES.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box>
                <Typography variant="subtitle2" gutterBottom>Tags</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    size="small"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button variant="outlined" onClick={handleAddTag}>Add</Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.tags.map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleDeleteTag(tag)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </TabPanel>

          {/* Tab 2: Business Context */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Industry</InputLabel>
                <Select
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  label="Industry"
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {INDUSTRIES.map(ind => (
                    <MenuItem key={ind} value={ind}>{ind}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  label="Priority"
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {PRIORITIES.map(p => (
                    <MenuItem key={p} value={p}>{p}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Core Area"
                value={formData.core_area}
                onChange={(e) => handleInputChange('core_area', e.target.value)}
                placeholder="e.g., Conversion / Sales Funnel"
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>Scope</InputLabel>
                <Select
                  value={formData.scope}
                  onChange={(e) => handleInputChange('scope', e.target.value)}
                  label="Scope"
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {SCOPES.map(s => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </TabPanel>

          {/* Tab 3: Technical Details */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>KPI Type</InputLabel>
                <Select
                  value={formData.kpi_type}
                  onChange={(e) => handleInputChange('kpi_type', e.target.value)}
                  label="KPI Type"
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {KPI_TYPES.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Metric"
                value={formData.metric}
                onChange={(e) => handleInputChange('metric', e.target.value)}
                placeholder="e.g., Count of purchase events"
                fullWidth
              />

              <TextField
                label="Aggregation Window"
                value={formData.aggregation_window}
                onChange={(e) => handleInputChange('aggregation_window', e.target.value)}
                placeholder="e.g., Daily, Weekly, Monthly"
                fullWidth
              />
            </Box>
          </TabPanel>

          {/* Tab 4: Platform Implementation */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="GA4 Implementation"
                value={formData.ga4_implementation}
                onChange={(e) => handleInputChange('ga4_implementation', e.target.value)}
                placeholder="e.g., purchase event"
                fullWidth
              />

              <TextField
                label="Adobe Analytics Implementation"
                value={formData.adobe_implementation}
                onChange={(e) => handleInputChange('adobe_implementation', e.target.value)}
                placeholder="e.g., purchase event"
                fullWidth
              />

              <TextField
                label="Amplitude Implementation"
                value={formData.amplitude_implementation}
                onChange={(e) => handleInputChange('amplitude_implementation', e.target.value)}
                placeholder="e.g., Order Completed"
                fullWidth
              />

              <Divider sx={{ my: 2 }} />

              <TextField
                label="Dependencies"
                value={formData.dependencies}
                onChange={(e) => handleInputChange('dependencies', e.target.value)}
                placeholder="Required data points, events, or setup"
                fullWidth
                multiline
                rows={2}
              />

              <TextField
                label="BI Source System"
                value={formData.bi_source_system}
                onChange={(e) => handleInputChange('bi_source_system', e.target.value)}
                placeholder="e.g., GA4, Adobe Analytics, BigQuery"
                fullWidth
              />

              <TextField
                label="Report Attributes"
                value={formData.report_attributes}
                onChange={(e) => handleInputChange('report_attributes', e.target.value)}
                placeholder="Dimensions and attributes used in reporting"
                fullWidth
                multiline
                rows={2}
              />

              <TextField
                label="Dashboard Usage"
                value={formData.dashboard_usage}
                onChange={(e) => handleInputChange('dashboard_usage', e.target.value)}
                placeholder="Which dashboards use this KPI?"
                fullWidth
                multiline
                rows={2}
              />

              <TextField
                label="Segment Eligibility"
                value={formData.segment_eligibility}
                onChange={(e) => handleInputChange('segment_eligibility', e.target.value)}
                placeholder="Which user segments can be analyzed?"
                fullWidth
                multiline
                rows={2}
              />

              <TextField
                label="Related KPIs"
                value={formData.related_kpis}
                onChange={(e) => handleInputChange('related_kpis', e.target.value)}
                placeholder="Comma-separated list of related KPIs"
                fullWidth
              />
            </Box>
          </TabPanel>

          {/* Tab 5: Data Mappings & SQL */}
          <TabPanel value={tabValue} index={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Data Layer Mapping (JSON)"
                value={formData.data_layer_mapping}
                onChange={(e) => handleInputChange('data_layer_mapping', e.target.value)}
                placeholder='{"event": "purchase", "transaction_id": "..."}'
                fullWidth
                multiline
                rows={6}
              />

              <TextField
                label="XDM Mapping (JSON)"
                value={formData.xdm_mapping}
                onChange={(e) => handleInputChange('xdm_mapping', e.target.value)}
                placeholder='{"eventType": "commerce.purchases", ...}'
                fullWidth
                multiline
                rows={6}
              />

              <Divider sx={{ my: 2 }} />

              <TextField
                label="SQL Query Example"
                value={formData.sql_query}
                onChange={(e) => handleInputChange('sql_query', e.target.value)}
                placeholder="SELECT COUNT(DISTINCT order_id) FROM..."
                fullWidth
                multiline
                rows={8}
              />
            </Box>
          </TabPanel>

          {/* Tab 6: Documentation */}
          <TabPanel value={tabValue} index={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Calculation Notes"
                value={formData.calculation_notes}
                onChange={(e) => handleInputChange('calculation_notes', e.target.value)}
                placeholder="Important notes about calculation methodology"
                fullWidth
                multiline
                rows={4}
              />

              <TextField
                label="Additional Details"
                value={formData.details}
                onChange={(e) => handleInputChange('details', e.target.value)}
                placeholder="Any additional context or details"
                fullWidth
                multiline
                rows={4}
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary">
                Governance fields (read-only):
              </Typography>

              <TextField
                label="Validation Status"
                value={formData.validation_status}
                disabled
                fullWidth
              />

              <TextField
                label="Data Sensitivity"
                value={formData.data_sensitivity}
                disabled
                fullWidth
              />
            </Box>
          </TabPanel>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => { setOpen(false); onClose?.(); }}
            disabled={saving}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

