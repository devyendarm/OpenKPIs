import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { supabase } from '../../lib/supabase';
import useSupabase from '../../lib/useSupabase';

interface DashboardFormData {
  name: string;
  slug: string;
  description: string;
  dashboard_url: string;
  owner: string;
  screenshot_url: string;
}

interface ItemToCreate {
  type: 'kpi' | 'dimension' | 'metric' | 'event';
  slug: string;
  name: string;
  data?: any;
}

const DashboardNewPage: React.FC = () => {
  const { user, session, loading } = useSupabase();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<DashboardFormData>({
    name: '',
    slug: '',
    description: '',
    dashboard_url: '',
    owner: '',
    screenshot_url: '',
  });

  // Selected items (existing)
  const [selectedKpis, setSelectedKpis] = useState<string[]>([]);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  // Items to create (missing items)
  const [itemsToCreate, setItemsToCreate] = useState<ItemToCreate[]>([]);
  const [createItemDialog, setCreateItemDialog] = useState<{
    open: boolean;
    type?: 'kpi' | 'dimension' | 'metric' | 'event';
    slug?: string;
  }>({ open: false });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch existing items for autocomplete
  const [existingKpis, setExistingKpis] = useState<any[]>([]);
  const [existingDimensions, setExistingDimensions] = useState<any[]>([]);
  const [existingMetrics, setExistingMetrics] = useState<any[]>([]);
  const [existingEvents, setExistingEvents] = useState<any[]>([]);

  useEffect(() => {
    const loadExistingItems = async () => {
      if (!session) return;

      try {
        // Fetch all items
        const [kpisRes, dimensionsRes, metricsRes, eventsRes] = await Promise.all([
          supabase.from('kpis').select('slug, name, status').order('name'),
          supabase.from('dimensions').select('slug, name, status').order('name'),
          supabase.from('metrics').select('slug, name, status').order('name'),
          supabase.from('events').select('slug, name, status').order('name'),
        ]);

        setExistingKpis(kpisRes.data || []);
        setExistingDimensions(dimensionsRes.data || []);
        setExistingMetrics(metricsRes.data || []);
        setExistingEvents(eventsRes.data || []);
      } catch (error) {
        console.error('Error loading items:', error);
      }
    };

    loadExistingItems();
  }, [session]);

  // Generate slug from name
  useEffect(() => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!user || !session) {
      setSubmitError('You must be signed in to create a dashboard');
      return;
    }

    setSubmitLoading(true);
    setSubmitError(null);

    try {
      // Step 1: Create any missing items first (with GitHub contribution)
      const createdItems: { [key: string]: string } = {};
      
      for (const item of itemsToCreate) {
        const { data, error } = await supabase
          .from(item.type + 's')
          .insert({
            slug: item.slug,
            name: item.name,
            ...item.data,
            created_by: user.user_metadata?.user_name || user.email,
            status: 'draft',
          })
          .select()
          .single();

        if (!error && data) {
          createdItems[`${item.type}_${item.slug}`] = data.id;
          
          // Trigger GitHub sync
          await supabase.functions.invoke('sync-to-github', {
            body: {
              type: item.type + 's',
              slug: item.slug,
              operation: 'insert',
            },
          });
        }
      }

      // Step 2: Create the dashboard
      const { data: dashboard, error: dashboardError } = await supabase
        .from('dashboards')
        .insert({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          dashboard_url: formData.dashboard_url,
          owner: formData.owner,
          screenshot_url: formData.screenshot_url,
          created_by: user.user_metadata?.user_name || user.email,
          status: 'draft',
        })
        .select()
        .single();

      if (dashboardError) throw dashboardError;

      // Step 3: Link items to dashboard (junction tables)
      const dashboardId = dashboard.id;
      
      // Link KPIs
      for (const kpiSlug of [...selectedKpis, ...Object.keys(createdItems).filter(k => k.startsWith('kpi_')).map(k => k.replace('kpi_', ''))]) {
        const kpiId = existingKpis.find(k => k.slug === kpiSlug)?.id || createdItems[`kpi_${kpiSlug}`];
        if (kpiId) {
          await supabase.from('dashboard_kpis').insert({ dashboard_id: dashboardId, kpi_id: kpiId });
        }
      }

      // Link Dimensions
      for (const dimSlug of [...selectedDimensions, ...Object.keys(createdItems).filter(k => k.startsWith('dimension_')).map(k => k.replace('dimension_', ''))]) {
        const dimId = existingDimensions.find(d => d.slug === dimSlug)?.id || createdItems[`dimension_${dimSlug}`];
        if (dimId) {
          await supabase.from('dashboard_dimensions').insert({ dashboard_id: dashboardId, dimension_id: dimId });
        }
      }

      // Link Metrics
      for (const metricSlug of [...selectedMetrics, ...Object.keys(createdItems).filter(k => k.startsWith('metric_')).map(k => k.replace('metric_', ''))]) {
        const metricId = existingMetrics.find(m => m.slug === metricSlug)?.id || createdItems[`metric_${metricSlug}`];
        if (metricId) {
          await supabase.from('dashboard_metrics').insert({ dashboard_id: dashboardId, metric_id: metricId });
        }
      }

      // Link Events
      for (const eventSlug of [...selectedEvents, ...Object.keys(createdItems).filter(k => k.startsWith('event_')).map(k => k.replace('event_', ''))]) {
        const eventId = existingEvents.find(e => e.slug === eventSlug)?.id || createdItems[`event_${eventSlug}`];
        if (eventId) {
          await supabase.from('dashboard_events').insert({ dashboard_id: dashboardId, event_id: eventId });
        }
      }

      // Step 4: Trigger GitHub sync for dashboard
      await supabase.functions.invoke('sync-to-github', {
        body: {
          type: 'dashboards',
          slug: formData.slug,
          operation: 'insert',
        },
      });

      // Step 5: Redirect to success page or dashboard
      window.location.href = `/dashboard-detail?slug=${formData.slug}&created=1`;
      
    } catch (error: any) {
      console.error('Error creating dashboard:', error);
      setSubmitError(error.message || 'Failed to create dashboard');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle adding missing item
  const handleAddMissingItem = (type: 'kpi' | 'dimension' | 'metric' | 'event', slug: string) => {
    setCreateItemDialog({ open: true, type, slug });
  };

  const handleCreateItem = () => {
    const { type, slug } = createItemDialog;
    if (!type || !slug) return;

    const name = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    // Add to items to create
    setItemsToCreate(prev => [...prev, { type, slug, name }]);

    // Also add to selected items for display
    switch (type) {
      case 'kpi':
        setSelectedKpis(prev => [...prev, slug]);
        break;
      case 'dimension':
        setSelectedDimensions(prev => [...prev, slug]);
        break;
      case 'metric':
        setSelectedMetrics(prev => [...prev, slug]);
        break;
      case 'event':
        setSelectedEvents(prev => [...prev, slug]);
        break;
    }

    setCreateItemDialog({ open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Layout title="Create New Dashboard">
        <Box sx={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Create New Dashboard
          </Typography>
          <Alert severity="info" sx={{ mt: 3 }}>
            Please sign in with GitHub (top right) to create a dashboard.
          </Alert>
        </Box>
      </Layout>
    );
  }

  const steps = [
    {
      label: 'Dashboard Information',
      content: (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Dashboard Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Slug (URL)"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            sx={{ mb: 2 }}
            helperText="Automatically generated from name, can be customized"
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Dashboard URL"
            value={formData.dashboard_url}
            onChange={(e) => setFormData(prev => ({ ...prev, dashboard_url: e.target.value }))}
            sx={{ mb: 2 }}
            type="url"
          />
          <TextField
            fullWidth
            label="Owner/Team"
            value={formData.owner}
            onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
            sx={{ mb: 2 }}
          />
        </Box>
      ),
    },
    {
      label: 'Related KPIs',
      content: (
        <Box sx={{ mt: 2 }}>
          <Autocomplete
            multiple
            options={existingKpis.map(k => k.slug)}
            value={selectedKpis}
            onChange={(e, newValue) => {
              setSelectedKpis(newValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Select KPIs" placeholder="Search or add KPIs..." />
            )}
            freeSolo
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const exists = existingKpis.some(k => k.slug === option);
                return (
                  <Chip
                    key={option}
                    {...getTagProps({ index })}
                    label={option}
                    color={exists ? 'primary' : 'warning'}
                    icon={!exists && <AddIcon />}
                  />
                );
              })
            }
          />
          {selectedKpis.filter(slug => !existingKpis.some(k => k.slug === slug)).length > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Missing KPIs will be created as drafts: {selectedKpis.filter(slug => !existingKpis.some(k => k.slug === slug)).join(', ')}
            </Alert>
          )}
        </Box>
      ),
    },
    {
      label: 'Related Dimensions',
      content: (
        <Box sx={{ mt: 2 }}>
          <Autocomplete
            multiple
            options={existingDimensions.map(d => d.slug)}
            value={selectedDimensions}
            onChange={(e, newValue) => setSelectedDimensions(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Select Dimensions" placeholder="Search or add dimensions..." />
            )}
            freeSolo
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const exists = existingDimensions.some(d => d.slug === option);
                return (
                  <Chip
                    key={option}
                    {...getTagProps({ index })}
                    label={option}
                    color={exists ? 'primary' : 'warning'}
                    icon={!exists && <AddIcon />}
                  />
                );
              })
            }
          />
        </Box>
      ),
    },
    {
      label: 'Related Metrics',
      content: (
        <Box sx={{ mt: 2 }}>
          <Autocomplete
            multiple
            options={existingMetrics.map(m => m.slug)}
            value={selectedMetrics}
            onChange={(e, newValue) => setSelectedMetrics(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Select Metrics" placeholder="Search or add metrics..." />
            )}
            freeSolo
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const exists = existingMetrics.some(m => m.slug === option);
                return (
                  <Chip
                    key={option}
                    {...getTagProps({ index })}
                    label={option}
                    color={exists ? 'primary' : 'warning'}
                    icon={!exists && <AddIcon />}
                  />
                );
              })
            }
          />
        </Box>
      ),
    },
    {
      label: 'Related Events',
      content: (
        <Box sx={{ mt: 2 }}>
          <Autocomplete
            multiple
            options={existingEvents.map(e => e.slug)}
            value={selectedEvents}
            onChange={(e, newValue) => setSelectedEvents(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Select Events" placeholder="Search or add events..." />
            )}
            freeSolo
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const exists = existingEvents.some(e => e.slug === option);
                return (
                  <Chip
                    key={option}
                    {...getTagProps({ index })}
                    label={option}
                    color={exists ? 'primary' : 'warning'}
                    icon={!exists && <AddIcon />}
                  />
                );
              })
            }
          />
        </Box>
      ),
    },
  ];

  return (
    <Layout title="Create New Dashboard">
      <Box p={4} maxWidth="900px" mx="auto">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => window.history.back()}
          sx={{ mb: 2 }}
        >
          Back
        </Button>

        <Typography variant="h3" gutterBottom>
          Create New Dashboard
        </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Add a dashboard that uses KPIs, Dimensions, Metrics, and Events. Missing items will be created as drafts.
      </Typography>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                {step.content}
                <Box sx={{ mb: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (activeStep === steps.length - 1) {
                        handleSubmit();
                      } else {
                        setActiveStep((prev) => prev + 1);
                      }
                    }}
                    disabled={submitLoading}
                    sx={{ mr: 1 }}
                  >
                    {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                  </Button>
                  <Button
                    onClick={() => setActiveStep((prev) => prev - 1)}
                    disabled={activeStep === 0 || submitLoading}
                  >
                    Back
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {submitLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      )}

      {/* Dialog for creating missing items */}
      <Dialog open={createItemDialog.open} onClose={() => setCreateItemDialog({ open: false })}>
        <DialogTitle>Create {createItemDialog.type?.toUpperCase()}</DialogTitle>
        <DialogContent>
          <Typography>
            You're about to create a new {createItemDialog.type}: <strong>{createItemDialog.slug}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This item will be created as a draft and you'll receive GitHub contribution credit!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateItemDialog({ open: false })}>Cancel</Button>
          <Button onClick={handleCreateItem} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Layout>
  );
};

export default DashboardNewPage;

