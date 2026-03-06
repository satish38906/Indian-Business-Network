-- Add chapter_id column to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS chapter_id INTEGER REFERENCES chapters(id);

-- Add other missing columns if needed
ALTER TABLE members ADD COLUMN IF NOT EXISTS business_name VARCHAR(255);
ALTER TABLE members ADD COLUMN IF NOT EXISTS business_category VARCHAR(100);
ALTER TABLE members ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Verify
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'members';
