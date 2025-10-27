/**
 * Supabase Edge Function: Sync to GitHub
 * 
 * This function is triggered when a user creates/edits KPIs, Events, Dimensions, or Metrics.
 * It creates a commit to GitHub with the user as the author and creates a Pull Request.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN');
const GITHUB_OWNER = 'devyendarm';
const GITHUB_REPO = 'OpenKPIs';
const GITHUB_BASE_BRANCH = 'main';

interface GitHubCommitRequest {
  table_name: 'kpis' | 'events' | 'dimensions' | 'metrics';
  record_id: string;
  action: 'created' | 'edited';
  user_login: string;
  user_name?: string;
  user_email?: string;
}

// CORS headers for Edge Function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload: GitHubCommitRequest = await req.json();
    const { table_name, record_id, action, user_login, user_name, user_email } = payload;

    // Initialize Supabase client (these are automatically available in Edge Functions)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://cpcabdtnzmanxuclewrg.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the record from Supabase
    const { data: record, error: fetchError } = await supabase
      .from(table_name)
      .select('*')
      .eq('id', record_id)
      .single();

    if (fetchError || !record) {
      throw new Error(`Failed to fetch record: ${fetchError?.message}`);
    }

    // Convert record to YAML format
    const yamlContent = generateYAML(table_name, record);
    const fileName = `${record.slug}.yml`;
    const filePath = `data-layer/${table_name}/${fileName}`;
    const branchName = `${action}-${table_name}-${record.slug}-${Date.now()}`;

    // Step 1: Get the default branch reference
    const mainBranchRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/ref/heads/${GITHUB_BASE_BRANCH}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!mainBranchRes.ok) {
      throw new Error(`Failed to get main branch: ${await mainBranchRes.text()}`);
    }

    const mainBranch = await mainBranchRes.json();
    const baseSha = mainBranch.object.sha;

    // Step 2: Create a new branch
    const createBranchRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs`,
      {
        method: 'POST',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: baseSha,
        }),
      }
    );

    if (!createBranchRes.ok) {
      throw new Error(`Failed to create branch: ${await createBranchRes.text()}`);
    }

    // Step 3: Create or update the file
    const base64Content = btoa(yamlContent);
    
    // Check if file exists
    let existingFileSha: string | undefined;
    const checkFileRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${branchName}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (checkFileRes.ok) {
      const existingFile = await checkFileRes.json();
      existingFileSha = existingFile.sha;
    }

    const commitRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: action === 'created' 
            ? `Add ${table_name.slice(0, -1)}: ${record.name}`
            : `Update ${table_name.slice(0, -1)}: ${record.name}`,
          content: base64Content,
          branch: branchName,
          sha: existingFileSha,
          committer: {
            name: 'OpenKPIs Bot',
            email: 'bot@openkpis.org',
          },
          author: {
            name: user_name || user_login,
            email: user_email || `${user_login}@users.noreply.github.com`,
          },
        }),
      }
    );

    if (!commitRes.ok) {
      throw new Error(`Failed to create commit: ${await commitRes.text()}`);
    }

    const commitData = await commitRes.json();
    const commitSha = commitData.commit.sha;

    // Step 4: Create a Pull Request
    const prRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls`,
      {
        method: 'POST',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: action === 'created'
            ? `Add ${table_name.slice(0, -1)}: ${record.name}`
            : `Update ${table_name.slice(0, -1)}: ${record.name}`,
          head: branchName,
          base: GITHUB_BASE_BRANCH,
          body: `**Contributed by**: @${user_login}\n\n**Action**: ${action}\n**Type**: ${table_name}\n\n---\n\n${record.description || 'No description provided.'}`,
          maintainer_can_modify: true,
        }),
      }
    );

    if (!prRes.ok) {
      throw new Error(`Failed to create PR: ${await prRes.text()}`);
    }

    const prData = await prRes.json();

    // Step 5: Update Supabase record with GitHub info
    await supabase
      .from(table_name)
      .update({
        github_commit_sha: commitSha,
        github_pr_number: prData.number,
        github_pr_url: prData.html_url,
      })
      .eq('id', record_id);

    return new Response(
      JSON.stringify({
        success: true,
        commit_sha: commitSha,
        pr_number: prData.number,
        pr_url: prData.html_url,
        branch: branchName,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in sync-to-github:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Generate YAML content from record
 */
function generateYAML(table_name: string, record: any): string {
  const timestamp = new Date().toISOString();
  
  if (table_name === 'kpis') {
    return `# KPI: ${record.name}
# Generated: ${timestamp}
# Contributed by: ${record.created_by}

KPI Name: ${record.name}
${record.formula ? `Formula: ${record.formula}` : ''}
${record.description ? `Description: |\n  ${record.description}` : ''}
${record.category ? `Category: ${record.category}` : ''}
${record.tags && record.tags.length > 0 ? `Tags: [${record.tags.join(', ')}]` : ''}
Status: ${record.status}
Contributed By: ${record.created_by}
Created At: ${record.created_at}
${record.last_modified_by ? `Last Modified By: ${record.last_modified_by}` : ''}
${record.last_modified_at ? `Last Modified At: ${record.last_modified_at}` : ''}
${record.approved_by ? `Approved By: ${record.approved_by}` : ''}
${record.approved_at ? `Approved At: ${record.approved_at}` : ''}
`;
  }
  
  if (table_name === 'events') {
    return `# Event: ${record.name}
# Generated: ${timestamp}
# Contributed by: ${record.created_by}

Event Name: ${record.name}
${record.description ? `Description: |\n  ${record.description}` : ''}
${record.category ? `Category: ${record.category}` : ''}
${record.tags && record.tags.length > 0 ? `Tags: [${record.tags.join(', ')}]` : ''}
Status: ${record.status}
Contributed By: ${record.created_by}
Created At: ${record.created_at}
`;
  }

  if (table_name === 'dimensions') {
    return `# Dimension: ${record.name}
# Generated: ${timestamp}
# Contributed by: ${record.created_by}

Dimension Name: ${record.name}
${record.description ? `Description: |\n  ${record.description}` : ''}
${record.category ? `Category: ${record.category}` : ''}
${record.tags && record.tags.length > 0 ? `Tags: [${record.tags.join(', ')}]` : ''}
Status: ${record.status}
Contributed By: ${record.created_by}
Created At: ${record.created_at}
`;
  }

  if (table_name === 'metrics') {
    return `# Metric: ${record.name}
# Generated: ${timestamp}
# Contributed by: ${record.created_by}

Metric Name: ${record.name}
${record.formula ? `Formula: ${record.formula}` : ''}
${record.description ? `Description: |\n  ${record.description}` : ''}
${record.category ? `Category: ${record.category}` : ''}
${record.tags && record.tags.length > 0 ? `Tags: [${record.tags.join(', ')}]` : ''}
Status: ${record.status}
Contributed By: ${record.created_by}
Created At: ${record.created_at}
`;
  }

  return '';
}

