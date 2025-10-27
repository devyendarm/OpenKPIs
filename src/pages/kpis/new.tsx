/**
 * Create New KPI Form - Supabase Version
 * 
 * This form allows authenticated users to create new KPIs directly in Supabase
 * and optionally sync to GitHub for contribution tracking
 */

import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
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
  Chip
} from '@mui/material';
import { Add as AddIcon, Save as SaveIcon } from '@mui/icons-material';
import { supabase, getCurrentUser, STATUS, syncToGitHub } from '../../lib/supabase';

const INDUSTRIES = [
  'Retail', 'E-commerce', 'SaaS', 'Healthcare', 'Education',
  'Finance', 'Media', 'Technology', 'Manufacturing', 'Other'
];

const CATEGORIES = [
  'Conversion', 'Revenue', 'Engagement', 'Retention', 'Acquisition',
  'Performance', 'Quality', 'Efficiency', 'Satisfaction', 'Growth', 'Other'
];

export default function NewKpiPage() {
  const baseUrl = useBaseUrl('/');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
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

  // Check authentication
  useEffect(() => {
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkAuth() {
    setLoading(true);
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }

  function createSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!user) {
      setError('Please sign in with GitHub to create a KPI');
      return;
    }

    if (!formData.name.trim()) {
      setError('KPI name is required');
      return;
    }

    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const slug = createSlug(formData.name);
      const userName = user.user_metadata?.user_name || user.email;

      // Insert into Supabase
      const { data: kpi, error: insertError } = await supabase
        .from('kpis')
        .insert({
          slug: slug,
          name: formData.name.trim(),
          formula: formData.formula.trim() || null,
          description: formData.description.trim() || null,
          category: formData.category || null,
          tags: formData.tags,
          status: STATUS.DRAFT,
          created_by: userName,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating KPI:', insertError);
        setError(insertError.message || 'Failed to create KPI');
        setCreating(false);
        return;
      }

      // Log to audit trail
      await supabase.from('audit_log').insert({
        table_name: 'kpis',
        record_id: kpi.id,
        action: 'created',
        user_login: userName,
        user_name: user.user_metadata?.full_name || userName,
        user_email: user.email,
        user_avatar_url: user.user_metadata?.avatar_url,
        changes: formData,
      });

      setSuccess(`KPI "${formData.name}" created successfully!`);
      setCreating(false);

      // Sync to GitHub in background (don't block user)
      syncToGitHub('kpis', kpi.id, 'created').then(({ data: githubData, error: githubError }) => {
        if (githubError) {
          console.warn('GitHub sync failed (Edge Function not deployed yet):', githubError);
          // GitHub sync will be enabled after Edge Function deployment
        } else if (githubData) {
          console.log('GitHub PR created:', githubData.pr_number);
        }
      }).catch(err => {
        console.warn('GitHub sync error:', err);
      });

      // Redirect to the KPI detail page with edit enabled
      setTimeout(() => {
        window.location.href = `/kpi-detail?slug=${slug}&edit=1`;
      }, 1500);

    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'An unexpected error occurred');
      setCreating(false);
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

  if (loading) {
    return (
      <Layout title="Create New KPI">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Create New KPI">
      <Box sx={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Create New KPI
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {!user ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            Please sign in with GitHub (top right) to create a KPI.
          </Alert>
        ) : (
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  
                  {/* KPI Name */}
                  <TextField
                    label="KPI Name *"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Conversion Rate"
                    required
                    fullWidth
                  />

                  {/* Formula */}
                  <TextField
                    label="Formula"
                    value={formData.formula}
                    onChange={(e) => handleInputChange('formula', e.target.value)}
                    placeholder="e.g., (Conversions / Visits) * 100"
                    fullWidth
                    multiline
                    rows={2}
                  />

                  {/* Description */}
                  <TextField
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what this KPI measures and why it's important..."
                    fullWidth
                    multiline
                    rows={4}
                  />

                  {/* Category */}
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

                  {/* Tags */}
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

                  {/* Submit Button */}
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => window.history.back()}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={creating ? <CircularProgress size={16} /> : <SaveIcon />}
                      disabled={!user || creating}
                    >
                      {creating ? 'Creating...' : 'Create KPI'}
                    </Button>
                  </Box>
                </Box>
              </form>
            </CardContent>
          </Card>
        )}
      </Box>
    </Layout>
  );
}

