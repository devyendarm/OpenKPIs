/**
 * Metric Wikipedia-Style Edit Page
 * 
 * Edit directly on the page like Wikipedia
 * Access via: /metric-detail?slug=metric-slug&edit=1
 */

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { supabase, getCurrentUser, syncToGitHub } from '../lib/supabase';

const CATEGORIES = ['Performance', 'Business', 'Technical', 'Operational', 'Financial', 'Other'];

export default function MetricWikipediaStylePage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  const shouldEdit = params.get('edit') === '1';
  
  const [user, setUser] = useState<any>(null);
  const [metric, setMetric] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(shouldEdit);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    formula: '',
    category: '',
    tags: [] as string[],
  });

  useEffect(() => {
    if (slug) {
      loadData();
    }
  }, [slug]);

  async function loadData() {
    setLoading(true);
    
    const currentUser = await getCurrentUser();
    setUser(currentUser);

    const { data: metricData, error: metricError } = await supabase
      .from('metrics')
      .select('*')
      .eq('slug', slug)
      .single();

    if (metricError || !metricData) {
      setError('Metric not found');
      setLoading(false);
      return;
    }

    setMetric(metricData);
    setFormData({
      name: metricData.name || '',
      description: metricData.description || '',
      formula: metricData.formula || '',
      category: metricData.category || '',
      tags: metricData.tags || [],
    });
    setLoading(false);
  }

  async function handleSave() {
    if (!user || !metric) {
      setError('Please sign in to edit');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const userName = user.user_metadata?.user_name || user.email;

      const { error: updateError } = await supabase
        .from('metrics')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          formula: formData.formula.trim() || null,
          category: formData.category || null,
          tags: formData.tags,
          last_modified_by: userName,
          last_modified_at: new Date().toISOString(),
        })
        .eq('id', metric.id);

      if (updateError) {
        setError(updateError.message || 'Failed to update metric');
        setSaving(false);
        return;
      }

      await syncToGitHub('metrics', metric.id, 'edited');

      setSuccess('Metric updated successfully!');
      setIsEditing(false);
      setTimeout(() => {
        setSuccess(null);
        loadData();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update metric');
      setSaving(false);
    }
  }

  const canEdit = user && metric && (
    metric.created_by === user.user_metadata?.user_name || 
    metric.created_by === user.email
  );

  if (loading) {
    return (
      <Layout title={`Loading Metric...`}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error || !metric) {
    return (
      <Layout title="Metric Not Found">
        <Box p={4}>
          <Alert severity="error">{error || 'Metric not found'}</Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title={metric.name}>
      <Box p={4} maxWidth="1000px" mx="auto">
        {/* Header with Edit Toggle */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
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
                {metric.name}
              </Typography>
            )}
            {metric.status === 'draft' && (
              <Chip label="Draft" color="warning" size="small" sx={{ mb: 1 }} />
            )}
            {metric.category && (
              <Chip label={metric.category} size="small" sx={{ ml: 1 }} />
            )}
          </Box>
          {canEdit && (
            <Box display="flex" gap={2} alignItems="center">
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
                    {saving ? 'Saving...' : 'Save'}
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
            Metric created successfully! Toggle "Edit Mode" above to edit all fields.
          </Alert>
        )}

        {/* Metric Details */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            {/* Description */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>Description</Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description..."
                />
              ) : (
                <Typography variant="body1">{metric.description || '—'}</Typography>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Formula */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>Formula</Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.formula}
                  onChange={(e) => setFormData(prev => ({ ...prev, formula: e.target.value }))}
                  placeholder="Enter formula..."
                  sx={{ fontFamily: 'monospace' }}
                />
              ) : (
                <Typography variant="body1" sx={{ fontFamily: 'monospace', backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                  {metric.formula || '—'}
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Category */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>Category</Typography>
              {isEditing ? (
                <FormControl fullWidth>
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
              ) : (
                <Typography variant="body1">{metric.category || '—'}</Typography>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Tags */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>Tags</Typography>
              {isEditing ? (
                <>
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
                </>
              ) : (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {metric.tags && metric.tags.length > 0 ? (
                    metric.tags.map((tag: string) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">—</Typography>
                  )}
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Metadata */}
            <Typography variant="h6" gutterBottom>Metadata</Typography>
            <Typography variant="body2" color="text.secondary">
              Created by: {metric.created_by} • {new Date(metric.created_at).toLocaleDateString()}
            </Typography>
            {metric.last_modified_by && (
              <Typography variant="body2" color="text.secondary">
                Last modified by: {metric.last_modified_by} • {new Date(metric.last_modified_at).toLocaleDateString()}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}

