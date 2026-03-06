const pool = require('./db');

async function checkSchema() {
  try {
    console.log('=== DATABASE SCHEMA CHECK ===\n');

    // Check meetings table
    console.log('MEETINGS TABLE:');
    const meetingsColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'meetings'
      ORDER BY ordinal_position
    `);
    
    if (meetingsColumns.rows.length === 0) {
      console.log('  ✗ Table does not exist');
    } else {
      meetingsColumns.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    }

    // Check attendance table
    console.log('\nATTENDANCE TABLE:');
    const attendanceColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'attendance'
      ORDER BY ordinal_position
    `);
    
    if (attendanceColumns.rows.length === 0) {
      console.log('  ✗ Table does not exist');
    } else {
      attendanceColumns.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    }

    // Check if tables exist
    console.log('\nTABLE EXISTENCE:');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('meetings', 'attendance')
    `);
    tables.rows.forEach(t => console.log(`  ✓ ${t.table_name}`));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

checkSchema();
