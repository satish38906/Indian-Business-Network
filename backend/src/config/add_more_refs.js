const pool = require('./db');

async function addMoreReferrals() {
  try {
    const currentUser = await pool.query('SELECT id FROM users ORDER BY id DESC LIMIT 1');
    const userId = currentUser.rows[0].id;
    const member = await pool.query('SELECT id FROM members WHERE user_id = $1', [userId]);
    const memberId = member.rows[0].id;
    
    const others = await pool.query('SELECT id FROM members WHERE id != $1 LIMIT 5', [memberId]);
    const otherIds = others.rows.map(m => m.id);
    
    // Add 4 more given (12 -> 16)
    const moreGiven = [
      { to: otherIds[0] || 1, business: 'Graphic Design', amount: 14000, status: 'closed' },
      { to: otherIds[1] || 2, business: 'Photography', amount: 8000, status: 'closed' },
      { to: otherIds[2] || 3, business: 'Videography', amount: 12000, status: 'given' },
      { to: otherIds[3] || 4, business: 'Animation', amount: 16000, status: 'accepted' },
    ];
    
    // Add 3 more received (11 -> 14)
    const moreReceived = [
      { from: otherIds[0] || 1, business: 'Insurance', amount: 18000, status: 'closed' },
      { from: otherIds[1] || 2, business: 'Real Estate', amount: 22000, status: 'closed' },
      { from: otherIds[2] || 3, business: 'Financial Planning', amount: 17000, status: 'closed' },
    ];
    
    for (const ref of moreGiven) {
      await pool.query(
        `INSERT INTO referrals (from_member_id, to_member_id, business_name, amount, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [memberId, ref.to, ref.business, ref.amount, ref.status]
      );
    }
    
    for (const ref of moreReceived) {
      await pool.query(
        `INSERT INTO referrals (from_member_id, to_member_id, business_name, amount, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [ref.from, memberId, ref.business, ref.amount, ref.status]
      );
    }
    
    console.log('✓ Additional referrals added');
    
    const stats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE from_member_id = $1) as given,
        COUNT(*) FILTER (WHERE to_member_id = $1) as received,
        COALESCE(SUM(amount) FILTER (WHERE to_member_id = $1 AND status = 'closed'), 0) as closed_value
      FROM referrals
      WHERE from_member_id = $1 OR to_member_id = $1
    `, [memberId]);
    
    console.log('\nFinal Statistics:');
    console.log('  Referrals Given:', stats.rows[0].given);
    console.log('  Referrals Received:', stats.rows[0].received);
    console.log('  Business Closed: ₹' + stats.rows[0].closed_value);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addMoreReferrals();
