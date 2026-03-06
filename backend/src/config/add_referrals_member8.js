const pool = require('./db');

async function addReferralsForAllMembers() {
  try {
    const members = await pool.query('SELECT id FROM members ORDER BY id');
    
    if (members.rows.length < 2) {
      console.log('Need at least 2 members');
      process.exit(1);
    }
    
    // Add referrals involving member 8 (user 7)
    const referrals = [
      { from: 8, to: 1, business: 'Digital Marketing Services', amount: 45000, status: 'closed' },
      { from: 8, to: 3, business: 'Software Development', amount: 80000, status: 'accepted' },
      { from: 1, to: 8, business: 'Consulting Services', amount: 35000, status: 'closed' },
      { from: 3, to: 8, business: 'Design Services', amount: 25000, status: 'given' },
    ];
    
    for (const ref of referrals) {
      await pool.query(
        `INSERT INTO referrals (from_member_id, to_member_id, business_name, amount, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [ref.from, ref.to, ref.business, ref.amount, ref.status]
      );
    }
    
    console.log('✓ Referrals added for member 8');
    
    // Show member 8's referrals
    const member8Refs = await pool.query(
      'SELECT * FROM referrals WHERE from_member_id = 8 OR to_member_id = 8'
    );
    console.log(`\nMember 8 now has ${member8Refs.rows.length} referrals:`);
    member8Refs.rows.forEach(r => {
      console.log(`  - ${r.business_name}: ${r.status} (₹${r.amount})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addReferralsForAllMembers();
