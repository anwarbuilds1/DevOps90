-- ==============================================================================
-- Supabase Schema for DevOps 90 Tracker
-- ==============================================================================
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- to create the devops_tracker table and enable cloud sync.

CREATE TABLE IF NOT EXISTS devops_tracker (
  id VARCHAR(64) PRIMARY KEY DEFAULT 'default',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast ordering and lookups
CREATE INDEX IF NOT EXISTS idx_devops_tracker_updated_at ON devops_tracker(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE devops_tracker ENABLE ROW LEVEL SECURITY;

-- Policy allowing read & write with your Supabase publishable key
DROP POLICY IF EXISTS "Allow public read and write" ON devops_tracker;
CREATE POLICY "Allow public read and write"
ON devops_tracker
FOR ALL
USING (true)
WITH CHECK (true);
