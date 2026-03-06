-- Run this SQL to ensure your users table has the role column

-- Add role column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'member' 
CHECK (role IN ('admin', 'president', 'member'));

-- Update existing users to have default role if NULL
UPDATE users SET role = 'member' WHERE role IS NULL;

-- Verify the schema
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users';
