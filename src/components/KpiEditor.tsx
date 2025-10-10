import React, { useState, useEffect } from 'react';
import { Button, TextField, Box, Typography, Alert, CircularProgress, Card, CardContent, Divider, Chip } from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Close as CloseIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';

// Configuration
const WORKER_BASE_URL = 'https://oauthgithub.openkpis.org';

interface User {
  authenticated: boolean;
  login?: string;
  name?: string;
  avatar_url?: string;
}

interface FileContent {
  content: string;
  sha: string;
}

interface CommitResult {
  success: boolean;
  prUrl?: string;
  headRepoFullName?: string;
  headBranch?: string;
  prNumber?: number;
  error?: string;
  message?: string;
}

interface KpiEditorProps {
  kpiId: string;
  section: 'kpis' | 'dimensions' | 'events';
}

export default function KpiEditor({ kpiId, section }: KpiEditorProps) {
  const [user, setUser] = useState<User>({ authenticated: false });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [yamlContent, setYamlContent] = useState('');
  const [mdxContent, setMdxContent] = useState('');
  const [yamlSha, setYamlSha] = useState('');
  const [mdxSha, setMdxSha] = useState('');
  const [commitMessage, setCommitMessage] = useState('');

  // Check authentication status and load content
  useEffect(() => {
    checkAuth();
  }, []);

  // Check if we're in edit mode from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('edit') === '1') {
      setEditing(true);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${WORKER_BASE_URL}/me`, {
        credentials: 'include'
      });
      const userData = await response.json();
      setUser(userData);
      
      if (userData.authenticated) {
        await loadContent();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadContent = async () => {
    try {
      const yamlPath = `data-layer/${section}/${kpiId}.yml`;
      const mdxPath = `docs/${section}/${kpiId}.mdx`;
      
      const [yamlResponse, mdxResponse] = await Promise.all([
        fetch(`${WORKER_BASE_URL}/content?path=${encodeURIComponent(yamlPath)}`, {
          credentials: 'include'
        }),
        fetch(`${WORKER_BASE_URL}/content?path=${encodeURIComponent(mdxPath)}`, {
          credentials: 'include'
        })
      ]);

      if (yamlResponse.ok) {
        const yamlData: FileContent = await yamlResponse.json();
        setYamlContent(yamlData.content);
        setYamlSha(yamlData.sha);
      }

      if (mdxResponse.ok) {
        const mdxData: FileContent = await mdxResponse.json();
        setMdxContent(mdxData.content);
        setMdxSha(mdxData.sha);
      }

      // Set default commit message
      setCommitMessage(`Update ${kpiId} ${section.slice(0, -1)}`);

    } catch (error) {
      console.error('Failed to load content:', error);
      setError('Failed to load content for editing');
    }
  };

  const handleSignIn = () => {
    window.location.href = `${WORKER_BASE_URL}/oauth/login`;
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const yamlPath = `data-layer/${section}/${kpiId}.yml`;
      const mdxPath = `docs/${section}/${kpiId}.mdx`;
      
      const commitData = {
        mode: 'update' as const,
        id: kpiId,
        yamlPath,
        mdxPath,
        yamlContent,
        mdxContent,
        commitMessage: commitMessage || `Update ${kpiId} ${section.slice(0, -1)}`
      };

      const response = await fetch(`${WORKER_BASE_URL}/commit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(commitData)
      });

      const result: CommitResult = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save changes');
      }

      setSuccess('Changes saved successfully! A pull request has been created.');
      setEditing(false);
      
      // Update SHAs for future edits
      if (result.success) {
        // Reload content to get new SHAs
        await loadContent();
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setError(null);
    setSuccess(null);
    // Reload original content
    loadContent();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!user.authenticated) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Sign In Required
          </Typography>
          <Typography variant="body2" paragraph>
            You need to sign in with GitHub to edit this {section.slice(0, -1)}.
          </Typography>
          <Button
            variant="contained"
            onClick={handleSignIn}
            startIcon={<EditIcon />}
          >
            Sign in with GitHub
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box mt={2}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              {editing ? 'Edit Content' : 'Content Editor'}
            </Typography>
            
            <Box display="flex" gap={1}>
              {editing ? (
                <>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    startIcon={<CloseIcon />}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={saving || !commitMessage.trim()}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => setEditing(true)}
                  startIcon={<EditIcon />}
                >
                  Edit
                </Button>
              )}
            </Box>
          </Box>

          {editing && (
            <>
              <TextField
                fullWidth
                label="Commit Message"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Describe your changes..."
                sx={{ mb: 2 }}
                required
              />
              
              <Divider sx={{ mb: 2 }} />
            </>
          )}

          {editing ? (
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  YAML Content (data-layer/{section}/{kpiId}.yml)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={15}
                  value={yamlContent}
                  onChange={(e) => setYamlContent(e.target.value)}
                  variant="outlined"
                  sx={{ fontFamily: 'monospace' }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  MDX Content (docs/{section}/{kpiId}.mdx)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={15}
                  value={mdxContent}
                  onChange={(e) => setMdxContent(e.target.value)}
                  variant="outlined"
                  sx={{ fontFamily: 'monospace' }}
                />
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Click "Edit" to modify the YAML and MDX content for this {section.slice(0, -1)}.
                Your changes will be submitted as a pull request for review.
              </Typography>
              
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip label={`Signed in as: ${user.login}`} size="small" />
                <Chip label={`Section: ${section}`} size="small" />
                <Chip label={`ID: ${kpiId}`} size="small" />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {editing && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Editing Guidelines
            </Typography>
            <Typography variant="body2" component="div">
              <strong>YAML Content:</strong>
              <ul>
                <li>Follow the existing field structure</li>
                <li>Use proper YAML syntax (indentation matters)</li>
                <li>Don't set <code>status: "Verified"</code> unless you're a maintainer</li>
                <li>Update <code>Last Updated</code> timestamp</li>
              </ul>
              
              <strong>MDX Content:</strong>
              <ul>
                <li>Maintain the front matter (between --- markers)</li>
                <li>Use proper Markdown syntax</li>
                <li>Keep the Material UI styling classes</li>
                <li>Ensure headings are properly structured for TOC</li>
              </ul>
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
