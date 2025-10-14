-- OpenKPIs Supabase Database Schema
-- Date: October 14, 2025
-- Description: Database schema for KPIs, Events, Dimensions with metadata tracking

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- KPIs Table
-- ============================================
CREATE TABLE IF NOT EXISTS kpis (
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
  
  -- Metadata (contributor tracking)
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_modified_by TEXT,
  last_modified_at TIMESTAMPTZ,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  
  -- Search vector (auto-generated)
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(formula, ''))
  ) STORED
);

-- ============================================
-- Events Table
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
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
    to_tsvector('english', name || ' ' || COALESCE(description, ''))
  ) STORED
);

-- ============================================
-- Dimensions Table
-- ============================================
CREATE TABLE IF NOT EXISTS dimensions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
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
    to_tsvector('english', name || ' ' || COALESCE(description, ''))
  ) STORED
);

-- ============================================
-- Audit Log Table
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL CHECK (table_name IN ('kpis', 'events', 'dimensions')),
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'edited', 'approved', 'published', 'deleted')),
  user_login TEXT NOT NULL,
  user_name TEXT,
  user_email TEXT,
  user_avatar_url TEXT,
  changes JSONB,
  github_commit_sha TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Contributors Table
-- ============================================
CREATE TABLE IF NOT EXISTS contributors (
  github_login TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  total_kpis INTEGER DEFAULT 0,
  total_events INTEGER DEFAULT 0,
  total_dimensions INTEGER DEFAULT 0,
  total_edits INTEGER DEFAULT 0,
  first_contribution_at TIMESTAMPTZ,
  last_contribution_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================

-- KPIs indexes
CREATE INDEX IF NOT EXISTS idx_kpis_status ON kpis(status);
CREATE INDEX IF NOT EXISTS idx_kpis_created_by ON kpis(created_by);
CREATE INDEX IF NOT EXISTS idx_kpis_created_at ON kpis(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kpis_search ON kpis USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_kpis_tags ON kpis USING GIN(tags);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_search ON events USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_events_tags ON events USING GIN(tags);

-- Dimensions indexes
CREATE INDEX IF NOT EXISTS idx_dimensions_status ON dimensions(status);
CREATE INDEX IF NOT EXISTS idx_dimensions_created_by ON dimensions(created_by);
CREATE INDEX IF NOT EXISTS idx_dimensions_created_at ON dimensions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dimensions_search ON dimensions USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_dimensions_tags ON dimensions USING GIN(tags);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_login);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);

-- Contributors indexes
CREATE INDEX IF NOT EXISTS idx_contributors_last_contribution ON contributors(last_contribution_at DESC);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributors ENABLE ROW LEVEL SECURITY;

-- KPIs Policies
CREATE POLICY "Anyone can read published kpis" ON kpis
  FOR SELECT USING (status = 'published' OR status = 'draft');

CREATE POLICY "Authenticated users can insert kpis" ON kpis
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update their own kpis" ON kpis
  FOR UPDATE TO authenticated 
  USING (created_by = (auth.jwt() -> 'user_metadata' ->> 'user_name'))
  WITH CHECK (created_by = (auth.jwt() -> 'user_metadata' ->> 'user_name'));

-- Events Policies
CREATE POLICY "Anyone can read published events" ON events
  FOR SELECT USING (status = 'published' OR status = 'draft');

CREATE POLICY "Authenticated users can insert events" ON events
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update their own events" ON events
  FOR UPDATE TO authenticated 
  USING (created_by = (auth.jwt() -> 'user_metadata' ->> 'user_name'))
  WITH CHECK (created_by = (auth.jwt() -> 'user_metadata' ->> 'user_name'));

-- Dimensions Policies
CREATE POLICY "Anyone can read published dimensions" ON dimensions
  FOR SELECT USING (status = 'published' OR status = 'draft');

CREATE POLICY "Authenticated users can insert dimensions" ON dimensions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update their own dimensions" ON dimensions
  FOR UPDATE TO authenticated 
  USING (created_by = (auth.jwt() -> 'user_metadata' ->> 'user_name'))
  WITH CHECK (created_by = (auth.jwt() -> 'user_metadata' ->> 'user_name'));

-- Audit Log Policies
CREATE POLICY "Anyone can read audit log" ON audit_log
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert audit log" ON audit_log
  FOR INSERT TO authenticated WITH CHECK (true);

-- Contributors Policies
CREATE POLICY "Anyone can read contributors" ON contributors
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update contributors" ON contributors
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- Functions
-- ============================================

-- Function to update contributor stats
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

-- Triggers to update contributor stats
CREATE TRIGGER kpis_contributor_stats
  AFTER INSERT OR UPDATE ON kpis
  FOR EACH ROW
  EXECUTE FUNCTION update_contributor_stats();

CREATE TRIGGER events_contributor_stats
  AFTER INSERT OR UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_contributor_stats();

CREATE TRIGGER dimensions_contributor_stats
  AFTER INSERT OR UPDATE ON dimensions
  FOR EACH ROW
  EXECUTE FUNCTION update_contributor_stats();

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE kpis IS 'Key Performance Indicators with metadata and GitHub sync';
COMMENT ON TABLE events IS 'Analytics events with metadata and GitHub sync';
COMMENT ON TABLE dimensions IS 'Analytics dimensions with metadata and GitHub sync';
COMMENT ON TABLE audit_log IS 'Complete audit trail of all changes';
COMMENT ON TABLE contributors IS 'Aggregated statistics for all contributors';

COMMENT ON COLUMN kpis.search_vector IS 'Auto-generated full-text search vector';
COMMENT ON COLUMN kpis.github_commit_sha IS 'SHA of the last GitHub commit for this KPI';
COMMENT ON COLUMN kpis.status IS 'draft: not yet approved, published: live on site, archived: hidden';

-- ============================================
-- Initial Data (Optional)
-- ============================================

-- Add admin contributor (optional)
INSERT INTO contributors (github_login, name, first_contribution_at, last_contribution_at)
VALUES ('admin', 'Admin User', NOW(), NOW())
ON CONFLICT (github_login) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'OpenKPIs database schema created successfully!';
  RAISE NOTICE 'Tables: kpis, events, dimensions, audit_log, contributors';
  RAISE NOTICE 'Indexes: Full-text search, status, created_by, tags';
  RAISE NOTICE 'RLS: Enabled with public read, authenticated write policies';
  RAISE NOTICE 'Ready for data migration!';
END $$;

