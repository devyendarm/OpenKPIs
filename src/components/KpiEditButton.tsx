/**
 * KPI Edit Button - Wikipedia-style edit functionality
 * 
 * Shows an "Edit" button on KPI pages that opens an inline editor
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
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { supabase, getCurrentUser, syncToGitHub } from '../lib/supabase';

const CATEGORIES = [
  'Conversion', 'Revenue', 'Engagement', 'Retention', 'Acquisition',
  'Performance', 'Quality', 'Efficiency', 'Satisfaction', 'Growth', 'Other'
];

interface KpiEditButtonProps {
  slug: string;
}

export default function KpiEditButton({ slug }: KpiEditButtonProps) {
  const [user, setUser] = useState<any>(null);
  const [kpi, setKpi] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    formula: '',
    description: '',
    category: '',
    tags: [] as string[],
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
      setFormData({
        name: kpiData.name || '',
        formula: kpiData.formula || '',
        description: kpiData.description || '',
        category: kpiData.category || '',
        tags: kpiData.tags || [],
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

      // Update in Supabase
      const { error: updateError } = await supabase
        .from('kpis')
        .update({
          name: formData.name.trim(),
          formula: formData.formula.trim() || null,
          description: formData.description.trim() || null,
          category: formData.category || null,
          tags: formData.tags,
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
  // Show button even if not ready (for debugging)
  if (!user) {
    return (
      <div style={{ position: 'fixed', top: '80px', right: '20px', padding: '8px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', fontSize: '12px' }}>
        Please sign in to edit
      </div>
    );
  }

  if (!kpi) {
    return (
      <div style={{ position: 'fixed', top: '80px', right: '20px', padding: '8px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', fontSize: '12px' }}>
        Loading KPI... (slug: {slug})
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div style={{ position: 'fixed', top: '80px', right: '20px', padding: '8px', backgroundColor: '#f8d7da', border: '1px solid #dc3545', borderRadius: '4px', fontSize: '12px' }}>
        You cannot edit this KPI
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
          zIndex: 1000,
          backgroundColor: 'white',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        }}
      >
        Edit
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit KPI: {kpi?.name}</DialogTitle>
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

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
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
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what this KPI measures..."
              fullWidth
              multiline
              rows={6}
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
                <Button variant="outlined" onClick={handleAddTag}>Add Tag</Button>
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
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
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
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

