const pool = require('./db');

async function testDashboardAPI() {
  try {
    // Get Deepak's user and member info
    const user = await pool.query(`
      SELECT u.id as user_id, u.email, m.id as member_id
      FROM users u
      JOIN members m ON u.id = m.user_id
      WHERE u.email LIKE '%deepak%'
      LIMIT 1
    `);
    
    if (!user.rows[0]) {
      console.log('User not found');
      process.exit(1);
    }
    
    const { user_id, member_id, email } = user.rows[0];
    console.log('Testing for:', email);
    console.log('User ID:', user_id);
    console.log('Member ID:', member_id);
    
    // Run the exact query from dashboard model
    const referrals = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE from_member_id=$1) AS given_count,
        COUNT(*) FILTER (WHERE to_member_id=$1) AS received_count,
        COALESCE(SUM(amount) FILTER (WHERE from_member_id=$1), 0) AS given_value,
        COALESCE(SUM(amount) FILTER (WHERE to_member_id=$1), 0) AS received_value,
        COUNT(*) FILTER (WHERE to_member_id=$1 AND status='closed') AS closed_count,
        COALESCE(SUM(amount) FILTER (WHERE to_member_id=$1 AND status='closed'), 0) AS closed_value
      FROM referrals WHERE from_member_id=$1 OR to_member_id=$1
    `, [member_id]);
    
    console.log('\nDashboard API Response:');
    console.log(JSON.stringify(referrals.rows[0], null, 2));
    
    // Also check raw referral data
    const allRefs = await pool.query(`
      SELECT id, from_member_id, to_member_id, business_name, amount, status
      FROM referrals 
      WHERE from_member_id=$1 OR to_member_id=$1
      ORDER BY status, amount DESC
    `, [member_id]);
    
    console.log('\nAll referrals for this member:');
    allRefs.rows.forEach(r => {
      const direction = r.from_member_id === member_id ? 'GIVEN' : 'RECEIVED';
      console.log(`  ${direction}: ${r.business_name} - ₹${r.amount} (${r.status})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testDashboardAPI();
