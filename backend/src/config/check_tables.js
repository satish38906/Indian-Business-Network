const pool = require('./db');

async function checkTables() {
  try {
    // Check referrals table structure
    const referralsColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'referrals'
    `);
    console.log('Referrals table columns:', referralsColumns.rows);

    // Check attendance table structure  
    const attendanceColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'attendance'
    `);
    console.log('Attendance table columns:', attendanceColumns.rows);

  } catch (error) {
    console.error('Error checking tables:', error.message);
  } finally {
    process.exit(0);
  }
}

checkTables();