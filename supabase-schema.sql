-- ==============================================================================
-- Supabase Schema for DevOps 90 Tracker
-- ==============================================================================
-- You do not need to run this manually if your DATABASE_URL has write permissions,
-- as the Next.js app automatically executes CREATE TABLE IF NOT EXISTS.
-- However, you can paste this into the Supabase SQL Editor if you prefer manual setup.

CREATE TABLE IF NOT EXISTS devops_tracker (
  id VARCHAR(64) PRIMARY KEY DEFAULT 'default',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for ordering / querying updates
CREATE INDEX IF NOT EXISTS idx_devops_tracker_updated_at ON devops_tracker(updated_at DESC);

-- Enable Row Level Security (RLS) if you wish to enforce custom policies,
-- or leave disabled for single-user direct backend connection:
-- ALTER TABLE devops_tracker ENABLE ROW LEVEL SECURITY;

-- If RLS is enabled, you can allow anon / authenticated read/write:
-- CREATE POLICY "Allow all access to devops_tracker" ON devops_tracker FOR ALL USING (true);
