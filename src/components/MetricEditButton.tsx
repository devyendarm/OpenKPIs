/**
 * Metric Edit Dialog - Simple Edit Form
 * 
 * Edit Metric fields: Name, Formula, Description, Category, Tags
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { supabase, getCurrentUser, syncToGitHub } from '../lib/supabase';

const CATEGORIES = ['Performance', 'Business', 'Technical', 'Operational', 'Financial', 'Other'];

interface MetricEditButtonProps {
  slug: string;
  onClose?: () => void;
}

export default function MetricEditButton({ slug, onClose }: MetricEditButtonProps) {
  const [user, setUser] = useState<any>(null);
  const [metric, setMetric] = useState<any>(null);
  const [open, setOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    formula: '',
    description: '',
    category: '',
    tags: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, [slug]);

  async function loadData() {
    const currentUser = await getCurrentUser();
    setUser(currentUser);

    const { data: metricData, error: metricError } = await supabase
      .from('metrics')
      .select('*')
      .eq('slug', slug)
      .single();

    if (metricError || !metricData) {
      setError('Metric not found');
      return;
    }

    setMetric(metricData);
    setFormData({
      name: metricData.name || '',
      formula: metricData.formula || '',
      description: metricData.description || '',
      category: metricData.category || '',
      tags: metricData.tags || [],
    });
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
          formula: formData.formula.trim() || null,
          description: formData.description.trim() || null,
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

      // Sync to GitHub
      await syncToGitHub('metrics', metric.id, 'edited');

      setSuccess('Metric updated successfully!');
      setTimeout(() => {
        setOpen(false);
        onClose?.();
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update metric');
      setSaving(false);
    }
  }

  const canEdit = user && metric && (
    metric.created_by === user.user_metadata?.user_name || 
    metric.created_by === user.email
  );

  if (!canEdit) {
    return null;
  }

  return (
    <Dialog open={open} onClose={() => { setOpen(false); onClose?.(); }} maxWidth="md" fullWidth>
      <DialogTitle>Edit Metric: {metric?.name}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <TextField
          fullWidth
          label="Metric Name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          sx={{ mb: 2, mt: 2 }}
          required
        />

        <TextField
          fullWidth
          label="Formula"
          value={formData.formula}
          onChange={(e) => setFormData(prev => ({ ...prev, formula: e.target.value }))}
          sx={{ mb: 2 }}
          multiline
          rows={2}
        />

        <TextField
          fullWidth
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          sx={{ mb: 2 }}
          multiline
          rows={4}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            label="Category"
          >
            <MenuItem value=""><em>None</em></MenuItem>
            {CATEGORIES.map(cat => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Add Tag"
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
          sx={{ mb: 1 }}
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
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
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

