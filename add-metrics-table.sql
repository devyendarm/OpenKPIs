-- Add Metrics Table
CREATE TABLE IF NOT EXISTS metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  formula TEXT,
  description TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- GitHub sync
  github_commit_sha TEXT,
  github_file_path TEXT,
  
  -- Metadata
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_modified_by TEXT,
  last_modified_at TIMESTAMPTZ,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  
  -- Search vector
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(formula, ''))
  ) STORED
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_metrics_status ON metrics(status);
CREATE INDEX IF NOT EXISTS idx_metrics_created_by ON metrics(created_by);
CREATE INDEX IF NOT EXISTS idx_metrics_created_at ON metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_search ON metrics USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_metrics_tags ON metrics USING GIN(tags);

-- RLS Policies
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS 'Anyone can read published metrics' ON metrics
  FOR SELECT USING (status = 'published' OR status = 'draft');

CREATE POLICY IF NOT EXISTS 'Authenticated users can insert metrics' ON metrics
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY IF NOT EXISTS 'Users can update their own metrics' ON metrics
  FOR UPDATE TO authenticated 
  USING (created_by = (auth.jwt() -> 'user_metadata' ->> 'user_name'))
  WITH CHECK (created_by = (auth.jwt() -> 'user_metadata' ->> 'user_name'));

-- Trigger
CREATE TRIGGER metrics_contributor_stats
  AFTER INSERT OR UPDATE ON metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_contributor_stats();

-- Update contributors table to include metrics count
ALTER TABLE contributors ADD COLUMN IF NOT EXISTS total_metrics INTEGER DEFAULT 0;

-- Update the trigger function to handle metrics
CREATE OR REPLACE FUNCTION update_contributor_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO contributors (github_login, name, avatar_url, first_contribution_at, last_contribution_at)
    VALUES (NEW.created_by, NEW.created_by, NULL, NOW(), NOW())
    ON CONFLICT (github_login) 
    DO UPDATE SET
      last_contribution_at = NOW(),
      updated_at = NOW();
    
    -- Update count based on table
    IF TG_TABLE_NAME = 'kpis' THEN
      UPDATE contributors SET total_kpis = total_kpis + 1 WHERE github_login = NEW.created_by;
    ELSIF TG_TABLE_NAME = 'events' THEN
      UPDATE contributors SET total_events = total_events + 1 WHERE github_login = NEW.created_by;
    ELSIF TG_TABLE_NAME = 'dimensions' THEN
      UPDATE contributors SET total_dimensions = total_dimensions + 1 WHERE github_login = NEW.created_by;
    ELSIF TG_TABLE_NAME = 'metrics' THEN
      UPDATE contributors SET total_metrics = total_metrics + 1 WHERE github_login = NEW.created_by;
    END IF;
  END IF;
  
  IF TG_OP = 'UPDATE' AND NEW.last_modified_by IS NOT NULL THEN
    UPDATE contributors 
    SET total_edits = total_edits + 1, 
        last_contribution_at = NOW(),
        updated_at = NOW()
    WHERE github_login = NEW.last_modified_by;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

SELECT 'Metrics table created successfully!' AS result;
