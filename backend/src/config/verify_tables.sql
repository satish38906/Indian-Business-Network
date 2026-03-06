-- Run this to check if tables exist and create if missing

-- Check existing tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('members', 'referrals', 'attendance', 'visitors', 'meetings');

-- If members table doesn't exist, create it
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  chapter_id INTEGER REFERENCES chapters(id),
  business_name VARCHAR(255),
  business_category VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  contact VARCHAR(50),
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- If referrals table doesn't exist, create it
CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  from_member_id INTEGER REFERENCES members(id),
  to_member_id INTEGER REFERENCES members(id),
  chapter_id INTEGER REFERENCES chapters(id),
  meeting_id INTEGER,
  business_name VARCHAR(255),
  contact_name VARCHAR(255),
  contact_phone VARCHAR(50),
  referral_value DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'given',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- If attendance table doesn't exist, create it
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER,
  member_id INTEGER REFERENCES members(id),
  status VARCHAR(20) DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verify
SELECT 'Tables created successfully' AS status;
