const pool = require('./db');

async function updateToTargetNumbers() {
  try {
    // First, check current logged-in user's member ID
    const currentUser = await pool.query('SELECT id FROM users ORDER BY id DESC LIMIT 1');
    const userId = currentUser.rows[0].id;
    
    const member = await pool.query('SELECT id FROM members WHERE user_id = $1', [userId]);
    if (!member.rows[0]) {
      console.log('No member found for user', userId);
      process.exit(1);
    }
    
    const memberId = member.rows[0].id;
    console.log('Adding referrals for member ID:', memberId);
    
    // Get other member IDs
    const others = await pool.query('SELECT id FROM members WHERE id != $1 LIMIT 5', [memberId]);
    const otherIds = others.rows.map(m => m.id);
    
    // Add 12 more "given" referrals (currently 4, need 16 total)
    const givenRefs = [
      { to: otherIds[0] || 1, business: 'Web Design', amount: 15000, status: 'closed' },
      { to: otherIds[1] || 2, business: 'App Development', amount: 25000, status: 'closed' },
      { to: otherIds[2] || 3, business: 'SEO Services', amount: 8000, status: 'closed' },
      { to: otherIds[3] || 4, business: 'Content Marketing', amount: 12000, status: 'closed' },
      { to: otherIds[0] || 1, business: 'Social Media', amount: 10000, status: 'closed' },
      { to: otherIds[1] || 2, business: 'Email Marketing', amount: 7000, status: 'closed' },
      { to: otherIds[2] || 3, business: 'PPC Advertising', amount: 18000, status: 'closed' },
      { to: otherIds[3] || 4, business: 'Brand Strategy', amount: 20000, status: 'closed' },
      { to: otherIds[0] || 1, business: 'Video Marketing', amount: 15000, status: 'accepted' },
      { to: otherIds[1] || 2, business: 'Analytics Setup', amount: 9000, status: 'given' },
      { to: otherIds[2] || 3, business: 'CRM Integration', amount: 11000, status: 'accepted' },
      { to: otherIds[3] || 4, business: 'Automation Tools', amount: 13000, status: 'given' },
    ];
    
    // Add 11 more "received" referrals (currently 3, need 14 total)
    const receivedRefs = [
      { from: otherIds[0] || 1, business: 'Legal Consulting', amount: 16000, status: 'closed' },
      { from: otherIds[1] || 2, business: 'Tax Planning', amount: 14000, status: 'closed' },
      { from: otherIds[2] || 3, business: 'Accounting', amount: 12000, status: 'closed' },
      { from: otherIds[3] || 4, business: 'Payroll Services', amount: 9000, status: 'closed' },
      { from: otherIds[0] || 1, business: 'HR Services', amount: 11000, status: 'closed' },
      { from: otherIds[1] || 2, business: 'Recruitment', amount: 13000, status: 'closed' },
      { from: otherIds[2] || 3, business: 'Training', amount: 8000, status: 'closed' },
      { from: otherIds[3] || 4, business: 'Office Setup', amount: 10000, status: 'closed' },
      { from: otherIds[0] || 1, business: 'IT Support', amount: 7000, status: 'accepted' },
      { from: otherIds[1] || 2, business: 'Cloud Migration', amount: 15000, status: 'given' },
      { from: otherIds[2] || 3, business: 'Security Audit', amount: 12000, status: 'accepted' },
    ];
    
    // Insert given referrals
    for (const ref of givenRefs) {
      await pool.query(
        `INSERT INTO referrals (from_member_id, to_member_id, business_name, amount, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [memberId, ref.to, ref.business, ref.amount, ref.status]
      );
    }
    
    // Insert received referrals
    for (const ref of receivedRefs) {
      await pool.query(
        `INSERT INTO referrals (from_member_id, to_member_id, business_name, amount, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [ref.from, memberId, ref.business, ref.amount, ref.status]
      );
    }
    
    console.log('✓ Referrals added successfully');
    
    // Check final stats
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

updateToTargetNumbers();
