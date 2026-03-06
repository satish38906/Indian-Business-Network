const pool = require('./db');

async function testDashboardData() {
  try {
    const user = await pool.query('SELECT id FROM users LIMIT 1');
    const userId = user.rows[0].id;
    
    console.log('Testing dashboard for userId:', userId);
    
    const member = await pool.query(
      `SELECT m.id, m.chapter_id, m.business_name, m.business_category, m.status
       FROM members m WHERE m.user_id = $1`,
      [userId]
    );
    
    console.log('Member:', member.rows[0]);
    
    if (member.rows[0]) {
      const memberId = member.rows[0].id;
      
      const referrals = await pool.query(
        `SELECT 
           COUNT(*) FILTER (WHERE from_member_id=$1) AS given_count,
           COUNT(*) FILTER (WHERE to_member_id=$1) AS received_count
         FROM referrals WHERE from_member_id=$1 OR to_member_id=$1`,
        [memberId]
      );
      
      console.log('Referrals:', referrals.rows[0]);
    }
    
    console.log('✓ Dashboard query works');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testDashboardData();
