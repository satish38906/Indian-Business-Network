const pool = require('./db');

async function setBusinessClosedToZero() {
  try {
    const deepak = await pool.query(`
      SELECT m.id as member_id 
      FROM users u
      JOIN members m ON u.id = m.user_id
      WHERE u.email LIKE '%deepak%'
      LIMIT 1
    `);
    
    const memberId = deepak.rows[0].member_id;
    
    // Update all closed referrals received by Deepak to 'accepted' status
    await pool.query(
      `UPDATE referrals 
       SET status = 'accepted' 
       WHERE to_member_id = $1 AND status = 'closed'`,
      [memberId]
    );
    
    console.log('✓ Updated all closed referrals to accepted status');
    
    const stats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE from_member_id = $1) as given,
        COUNT(*) FILTER (WHERE to_member_id = $1) as received,
        COALESCE(SUM(amount) FILTER (WHERE to_member_id = $1 AND status = 'closed'), 0) as closed_value
      FROM referrals
      WHERE from_member_id = $1 OR to_member_id = $1
    `, [memberId]);
    
    console.log('\nFinal Dashboard Stats:');
    console.log('  Referrals Given:', stats.rows[0].given);
    console.log('  Referrals Received:', stats.rows[0].received);
    console.log('  Business Closed: ₹' + stats.rows[0].closed_value);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

setBusinessClosedToZero();
