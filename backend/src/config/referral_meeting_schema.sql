-- Referral System Schema
CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  from_member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
  to_member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
  chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
  meeting_id INTEGER REFERENCES meetings(id) ON DELETE SET NULL,
  business_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  contact_phone VARCHAR(50),
  referral_value DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'given' CHECK (status IN ('given', 'accepted', 'closed')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meetings Schema (update existing)
CREATE TABLE IF NOT EXISTS meetings (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  meeting_date TIMESTAMP NOT NULL,
  location VARCHAR(255),
  description TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Schema
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
  member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'late', 'absent')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(meeting_id, member_id)
);

-- Visitors Schema
CREATE TABLE IF NOT EXISTS visitors (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255),
  contact_phone VARCHAR(50),
  email VARCHAR(255),
  invited_by INTEGER REFERENCES members(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_from ON referrals(from_member_id);
CREATE INDEX IF NOT EXISTS idx_referrals_to ON referrals(to_member_id);
CREATE INDEX IF NOT EXISTS idx_referrals_chapter ON referrals(chapter_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_meetings_chapter ON meetings(chapter_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_attendance_meeting ON attendance(meeting_id);
CREATE INDEX IF NOT EXISTS idx_visitors_meeting ON visitors(meeting_id);
