const pool = require('./db');

async function ensureMeetingSchema() {
  try {
    console.log('=== ENSURING MEETING SCHEMA ===\n');

    // Create meetings table if not exists
    console.log('1. Creating/updating meetings table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meetings (
        id SERIAL PRIMARY KEY,
        chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        meeting_date TIMESTAMP NOT NULL,
        location VARCHAR(255),
        description TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✓ meetings table ready');

    // Add created_by if missing
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'meetings' AND column_name = 'created_by'
        ) THEN
          ALTER TABLE meetings ADD COLUMN created_by INTEGER REFERENCES users(id);
        END IF;
      END $$;
    `);
    console.log('   ✓ created_by column ensured');

    // Create attendance table if not exists
    console.log('\n2. Creating/updating attendance table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
        member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'late', 'absent')),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(meeting_id, member_id)
      )
    `);
    console.log('   ✓ attendance table ready');

    // Add status if missing
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'attendance' AND column_name = 'status'
        ) THEN
          ALTER TABLE attendance ADD COLUMN status VARCHAR(20) DEFAULT 'present' 
          CHECK (status IN ('present', 'late', 'absent'));
        END IF;
      END $$;
    `);
    console.log('   ✓ status column ensured');

    // Create visitors table if not exists
    console.log('\n3. Creating visitors table...');
    await pool.query(`
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
      )
    `);
    console.log('   ✓ visitors table ready');

    // Create indexes
    console.log('\n4. Creating indexes...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_meetings_chapter ON meetings(chapter_id);
      CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
      CREATE INDEX IF NOT EXISTS idx_attendance_meeting ON attendance(meeting_id);
      CREATE INDEX IF NOT EXISTS idx_visitors_meeting ON visitors(meeting_id);
    `);
    console.log('   ✓ indexes created');

    // Verify schema
    console.log('\n5. Verifying schema...');
    const meetingsCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'meetings' AND column_name IN ('id', 'title', 'meeting_date', 'created_by')
    `);
    console.log(`   meetings columns: ${meetingsCheck.rows.length}/4 ✓`);

    const attendanceCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'attendance' AND column_name IN ('id', 'meeting_id', 'member_id', 'status')
    `);
    console.log(`   attendance columns: ${attendanceCheck.rows.length}/4 ✓`);

    console.log('\n✓ Schema migration completed successfully');
    console.log('\nYou can now restart the backend server.');

  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    console.error('Full error:', error);
  } finally {
    process.exit();
  }
}

ensureMeetingSchema();
