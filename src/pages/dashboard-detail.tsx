import React, { useState, useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Launch as LaunchIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';

interface Dashboard {
  id: string;
  slug: string;
  name: string;
  description: string;
  dashboard_url: string;
  owner: string;
  status: string;
  created_by: string;
  created_at: string;
}

interface Item {
  id: string;
  slug: string;
  name: string;
}

const DashboardDetailPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const slug = searchParams.get('slug');

  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [kpis, setKpis] = useState<Item[]>([]);
  const [dimensions, setDimensions] = useState<Item[]>([]);
  const [metrics, setMetrics] = useState<Item[]>([]);
  const [events, setEvents] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!slug) {
        setError('Dashboard slug is required');
        setLoading(false);
        return;
      }

      try {
        // Fetch dashboard
        const { data: dashboardData, error: dashboardError } = await supabase
          .from('dashboards')
          .select('*')
          .eq('slug', slug)
          .single();

        if (dashboardError) throw dashboardError;
        setDashboard(dashboardData);

        // Fetch related items
        const dashboardId = dashboardData.id;

        // Fetch KPIs
        const { data: kpisData } = await supabase
          .from('dashboard_kpis')
          .select('kpi_id, kpis(slug, name)')
          .eq('dashboard_id', dashboardId);

        const kpisList = kpisData?.map((dk: any) => ({
          id: dk.kpi_id,
          slug: dk.kpis.slug,
          name: dk.kpis.name,
        })) || [];

        setKpis(kpisList);

        // Fetch Dimensions
        const { data: dimsData } = await supabase
          .from('dashboard_dimensions')
          .select('dimension_id, dimensions(slug, name)')
          .eq('dashboard_id', dashboardId);

        const dimsList = dimsData?.map((dd: any) => ({
          id: dd.dimension_id,
          slug: dd.dimensions.slug,
          name: dd.dimensions.name,
        })) || [];

        setDimensions(dimsList);

        // Fetch Metrics
        const { data: metricsData } = await supabase
          .from('dashboard_metrics')
          .select('metric_id, metrics(slug, name)')
          .eq('dashboard_id', dashboardId);

        const metricsList = metricsData?.map((dm: any) => ({
          id: dm.metric_id,
          slug: dm.metrics.slug,
          name: dm.metrics.name,
        })) || [];

        setMetrics(metricsList);

        // Fetch Events
        const { data: eventsData } = await supabase
          .from('dashboard_events')
          .select('event_id, events(slug, name)')
          .eq('dashboard_id', dashboardId);

        const eventsList = eventsData?.map((de: any) => ({
          id: de.event_id,
          slug: de.events.slug,
          name: de.events.name,
        })) || [];

        setEvents(eventsList);

      } catch (err: any) {
        console.error('Error loading dashboard:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [slug]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !dashboard) {
    return (
      <Box p={4}>
        <Alert severity="error">
          {error || 'Dashboard not found'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={4} maxWidth="1000px" mx="auto">
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => window.history.back()}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h3" gutterBottom>
            {dashboard.name}
          </Typography>
          {dashboard.owner && (
            <Typography variant="body2" color="text.secondary">
              Owner: {dashboard.owner}
            </Typography>
          )}
          {dashboard.status && (
            <Chip
              label={dashboard.status}
              size="small"
              sx={{ mt: 1, mr: 1 }}
            />
          )}
        </Box>
        {dashboard.dashboard_url && (
          <Button
            variant="contained"
            startIcon={<LaunchIcon />}
            href={dashboard.dashboard_url}
            target="_blank"
          >
            View Dashboard
          </Button>
        )}
      </Box>

      {/* Description */}
      {dashboard.description && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="body1">{dashboard.description}</Typography>
        </Paper>
      )}

      {/* Related Items */}
      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={3}>
        {/* KPIs */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            KPIs Used
          </Typography>
          {kpis.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No KPIs linked
            </Typography>
          ) : (
            <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
              {kpis.map((kpi) => (
                <Chip
                  key={kpi.id}
                  label={kpi.name}
                  component="a"
                  href={`/kpis/${kpi.slug}`}
                  clickable
                  target="_blank"
                  color="primary"
                />
              ))}
            </Box>
          )}
        </Paper>

        {/* Dimensions */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Dimensions
          </Typography>
          {dimensions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No dimensions linked
            </Typography>
          ) : (
            <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
              {dimensions.map((dim) => (
                <Chip
                  key={dim.id}
                  label={dim.name}
                  component="a"
                  href={`/dimensions/${dim.slug}`}
                  clickable
                  target="_blank"
                  color="secondary"
                />
              ))}
            </Box>
          )}
        </Paper>

        {/* Metrics */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Metrics
          </Typography>
          {metrics.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No metrics linked
            </Typography>
          ) : (
            <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
              {metrics.map((metric) => (
                <Chip
                  key={metric.id}
                  label={metric.name}
                  component="a"
                  href={`/metrics/${metric.slug}`}
                  clickable
                  target="_blank"
                  color="success"
                />
              ))}
            </Box>
          )}
        </Paper>

        {/* Events */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Events
          </Typography>
          {events.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No events linked
            </Typography>
          ) : (
            <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
              {events.map((event) => (
                <Chip
                  key={event.id}
                  label={event.name}
                  component="a"
                  href={`/events/${event.slug}`}
                  clickable
                  target="_blank"
                  color="warning"
                />
              ))}
            </Box>
          )}
        </Paper>
      </Box>

      {/* Metadata */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Metadata
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Created by: {dashboard.created_by} • {new Date(dashboard.created_at).toLocaleDateString()}
        </Typography>
      </Paper>

      {/* Success message */}
      {searchParams.get('created') === '1' && (
        <Alert severity="success" sx={{ mt: 3 }}>
          Dashboard created successfully! Missing items have been created as drafts.
        </Alert>
      )}
    </Box>
  );
};

export default DashboardDetailPage;

