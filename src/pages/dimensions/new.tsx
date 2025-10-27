/**
 * Create New Dimension Form - Supabase Version
 */

import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { 
  Box, Card, CardContent, TextField, Button, Typography, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Chip
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { supabase, getCurrentUser, STATUS } from '../../lib/supabase';

const CATEGORIES = ['Content & Engagement', 'User', 'Session', 'Product', 'Transaction', 'Technical', 'Other'];

export default function NewDimensionPage() {
  const baseUrl = useBaseUrl('/');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', category: '', tags: [] as string[] });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function checkAuth() {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }

  function createSlug(name: string): string {
    return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { setError('Please sign in with GitHub'); return; }
    if (!formData.name.trim()) { setError('Dimension name is required'); return; }

    setCreating(true);
    setError(null);

    try {
      const slug = createSlug(formData.name);
      const userName = user.user_metadata?.user_name || user.email;

      const { data: dimension, error: insertError } = await supabase.from('dimensions').insert({
        slug, name: formData.name.trim(), description: formData.description.trim() || null,
        category: formData.category || null, tags: formData.tags, status: STATUS.DRAFT, created_by: userName,
      }).select().single();

      if (insertError) { setError(insertError.message); setCreating(false); return; }

      await supabase.from('audit_log').insert({
        table_name: 'dimensions', record_id: dimension.id, action: 'created',
        user_login: userName, user_name: user.user_metadata?.full_name || userName,
        user_email: user.email, user_avatar_url: user.user_metadata?.avatar_url, changes: formData,
      });

      setSuccess(`Dimension "${formData.name}" created successfully!`);
      setCreating(false);
      setTimeout(() => { window.location.href = `${baseUrl}dimensions/${slug}?edit=1`; }, 2000);
    } catch (err: any) {
      setError(err.message);
      setCreating(false);
    }
  }

  if (loading) return <Layout title="Create New Dimension"><Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress /></Box></Layout>;

  return (
    <Layout title="Create New Dimension">
      <Box sx={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
        <Typography variant="h3" component="h1" gutterBottom>Create New Dimension</Typography>
        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
        {!user ? (
          <Alert severity="info" sx={{ mb: 3 }}>Please sign in with GitHub (top right) to create a dimension.</Alert>
        ) : (
          <Card><CardContent><form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField label="Dimension Name *" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required fullWidth />
              <TextField label="Description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} fullWidth multiline rows={4} />
              <FormControl fullWidth><InputLabel>Category</InputLabel><Select value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} label="Category"><MenuItem value=""><em>None</em></MenuItem>{CATEGORIES.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}</Select></FormControl>
              <Box><Typography variant="subtitle2" gutterBottom>Tags</Typography><Box sx={{ display: 'flex', gap: 1, mb: 1 }}><TextField size="small" value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add a tag..." onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) { setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] })); setTagInput(''); } } }} /><Button variant="outlined" onClick={() => { if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) { setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] })); setTagInput(''); } }}>Add</Button></Box><Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{formData.tags.map(tag => <Chip key={tag} label={tag} onDelete={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))} color="primary" variant="outlined" />)}</Box></Box>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}><Button variant="outlined" onClick={() => window.history.back()}>Cancel</Button><Button type="submit" variant="contained" startIcon={creating ? <CircularProgress size={16} /> : <SaveIcon />} disabled={!user || creating}>{creating ? 'Creating...' : 'Create Dimension'}</Button></Box>
            </Box>
          </form></CardContent></Card>
        )}
      </Box>
    </Layout>
  );
}

