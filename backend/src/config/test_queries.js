const pool = require('./db');

async function testDashboardQueries() {
  const userId = 6;
  const memberId = 4;
  
  console.log(`=== Testing Dashboard Queries for userId: ${userId}, memberId: ${memberId} ===\n`);

  try {
    // Test member query
    console.log('1. Testing member query...');
    const member = await pool.query(
      `SELECT m.id, m.chapter_id, m.business_name, m.business_category, m.status
       FROM members m WHERE m.user_id = $1`,
      [userId]
    );
    console.log('Member result:', member.rows[0]);

    // Test referrals query
    console.log('\n2. Testing referrals query...');
    const referrals = await pool.query(
      `SELECT 
         COUNT(*) FILTER (WHERE from_member_id=$1) AS given_count,
         COUNT(*) FILTER (WHERE to_member_id=$1) AS received_count,
         '0' AS given_value,
         '0' AS received_value,
         COUNT(*) FILTER (WHERE to_member_id=$1) AS closed_count,
         '0' AS closed_value
       FROM referrals WHERE from_member_id=$1 OR to_member_id=$1`,
      [memberId]
    );
    console.log('Referrals result:', referrals.rows[0]);

    // Test attendance query
    console.log('\n3. Testing attendance query...');
    const attendance = await pool.query(
      `SELECT 
         COUNT(*) AS total_meetings,
         COUNT(*) AS present_count,
         '0' AS late_count,
         '0' AS absent_count
       FROM attendance WHERE member_id=$1`,
      [memberId]
    );
    console.log('Attendance result:', attendance.rows[0]);

  } catch (error) {
    console.error('Query error:', error.message);
  } finally {
    process.exit(0);
  }
}

testDashboardQueries();