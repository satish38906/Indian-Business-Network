const pool = require('./db');

async function addMissingColumns() {
  try {
    console.log('Adding missing columns to meetings and attendance tables...\n');

    // Add created_by column to meetings table
    console.log('1. Adding created_by column to meetings table...');
    await pool.query(`
      ALTER TABLE meetings 
      ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id)
    `);
    console.log('   ✓ created_by column added');

    // Add status column to attendance table
    console.log('\n2. Adding status column to attendance table...');
    await pool.query(`
      ALTER TABLE attendance 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'present' 
      CHECK (status IN ('present', 'late', 'absent'))
    `);
    console.log('   ✓ status column added');

    // Verify columns exist
    console.log('\n3. Verifying columns...');
    const meetingsCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'meetings' AND column_name = 'created_by'
    `);
    console.log('   meetings.created_by:', meetingsCheck.rows.length > 0 ? '✓ EXISTS' : '✗ MISSING');

    const attendanceCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'attendance' AND column_name = 'status'
    `);
    console.log('   attendance.status:', attendanceCheck.rows.length > 0 ? '✓ EXISTS' : '✗ MISSING');

    console.log('\n✓ Migration completed successfully');

  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
  } finally {
    process.exit();
  }
}

addMissingColumns();
