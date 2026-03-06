-- Migration: Update members table for new structure
-- Run this if you have an existing members table

-- Step 1: Backup existing data (optional but recommended)
-- CREATE TABLE members_backup AS SELECT * FROM members;

-- Step 2: Drop old members table if structure is completely different
-- DROP TABLE IF EXISTS members CASCADE;

-- Step 3: Create new members table
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  business_category VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  contact VARCHAR(50),
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(chapter_id, business_category)
);

-- Step 4: Add indexes
CREATE INDEX IF NOT EXISTS idx_members_chapter ON members(chapter_id);
CREATE INDEX IF NOT EXISTS idx_members_user ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_category ON members(chapter_id, business_category);

-- Step 5: Add president_id to chapters if not exists
ALTER TABLE chapters 
ADD COLUMN IF NOT EXISTS president_id INTEGER REFERENCES users(id);

-- Step 6: Verify structure
SELECT 
  table_name,
  column_name,
  data_type,
  character_maximum_length,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'members'
ORDER BY ordinal_position;

-- Step 7: Test constraint
-- This should fail if category already exists:
-- INSERT INTO members (user_id, chapter_id, business_name, business_category) 
-- VALUES (1, 1, 'Test', 'Technology');
-- INSERT INTO members (user_id, chapter_id, business_name, business_category) 
-- VALUES (2, 1, 'Test2', 'Technology'); -- Should fail
