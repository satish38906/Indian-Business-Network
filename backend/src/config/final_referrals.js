const pool = require('./db');

async function finalReferrals() {
  try {
    // Add 5 more given (to reach 15)
    const givenRefs = [
      { from: 1, to: 2, business: 'Video Production', amount: 20000, status: 'closed' },
      { from: 1, to: 3, business: 'Photography', amount: 8000, status: 'given' },
      { from: 1, to: 4, business: 'Event Management', amount: 25000, status: 'accepted' },
      { from: 1, to: 5, business: 'Catering Services', amount: 15000, status: 'closed' },
      { from: 1, to: 6, business: 'Printing Services', amount: 7000, status: 'given' },
    ];

    // Add 3 more received (to reach 19)
    const receivedRefs = [
      { from: 7, to: 1, business: 'Insurance Services', amount: 12000, status: 'closed' },
      { from: 8, to: 1, business: 'Real Estate', amount: 18000, status: 'given' },
      { from: 2, to: 1, business: 'Travel Services', amount: 9000, status: 'accepted' },
    ];

    for (const ref of [...givenRefs, ...receivedRefs]) {
      try {
        await pool.query(
          `INSERT INTO referrals (from_member_id, to_member_id, business_name, amount, status)
           VALUES ($1, $2, $3, $4, $5)`,
          [ref.from, ref.to, ref.business, ref.amount, ref.status]
        );
      } catch (err) {
        console.log('Skip:', err.message);
      }
    }

    console.log('✓ Final referrals added');
    
    const stats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE from_member_id = 1) as given,
        COUNT(*) FILTER (WHERE to_member_id = 1) as received,
        SUM(amount) FILTER (WHERE to_member_id = 1 AND status = 'closed') as closed_value
      FROM referrals
      WHERE from_member_id = 1 OR to_member_id = 1
    `);
    
    console.log('\nFinal Member 1 Statistics:');
    console.log('  Referrals Given:', stats.rows[0].given);
    console.log('  Referrals Received:', stats.rows[0].received);
    console.log('  Business Closed: ₹' + stats.rows[0].closed_value);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

finalReferrals();
