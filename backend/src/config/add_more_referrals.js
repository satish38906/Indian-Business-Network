const pool = require('./db');

async function addMoreReferrals() {
  try {
    const members = await pool.query('SELECT id FROM members ORDER BY id');
    const memberIds = members.rows.map(m => m.id);
    
    if (memberIds.length < 3) {
      console.log('Need at least 3 members');
      process.exit(1);
    }

    // Add referrals to reach target: 15 given, 19 received, ₹150000 closed
    const referrals = [
      // More referrals for member 1
      { from: 1, to: 2, business: 'IT Consulting', amount: 12000, status: 'closed' },
      { from: 1, to: 3, business: 'Cloud Services', amount: 8000, status: 'closed' },
      { from: 1, to: 4, business: 'Network Setup', amount: 15000, status: 'accepted' },
      { from: 1, to: 5, business: 'Security Audit', amount: 18000, status: 'given' },
      { from: 1, to: 6, business: 'Database Migration', amount: 22000, status: 'closed' },
      { from: 1, to: 7, business: 'Mobile App Dev', amount: 45000, status: 'closed' },
      { from: 1, to: 8, business: 'UI/UX Design', amount: 9000, status: 'accepted' },
      
      // Received by member 1
      { from: 2, to: 1, business: 'Financial Planning', amount: 11000, status: 'closed' },
      { from: 3, to: 1, business: 'Tax Advisory', amount: 7000, status: 'closed' },
      { from: 4, to: 1, business: 'Legal Services', amount: 13000, status: 'given' },
      { from: 5, to: 1, business: 'Marketing Campaign', amount: 16000, status: 'closed' },
      { from: 6, to: 1, business: 'SEO Services', amount: 8500, status: 'accepted' },
      { from: 7, to: 1, business: 'Content Writing', amount: 6000, status: 'closed' },
      { from: 8, to: 1, business: 'Social Media Mgmt', amount: 9500, status: 'closed' },
      { from: 2, to: 1, business: 'Business Strategy', amount: 14000, status: 'given' },
      { from: 3, to: 1, business: 'HR Consulting', amount: 10000, status: 'closed' },
      { from: 4, to: 1, business: 'Training Program', amount: 12500, status: 'accepted' },
      { from: 5, to: 1, business: 'Office Supplies', amount: 5000, status: 'closed' },
      { from: 6, to: 1, business: 'Equipment Rental', amount: 8000, status: 'closed' },
    ];

    for (const ref of referrals) {
      try {
        await pool.query(
          `INSERT INTO referrals (from_member_id, to_member_id, business_name, amount, status)
           VALUES ($1, $2, $3, $4, $5)`,
          [ref.from, ref.to, ref.business, ref.amount, ref.status]
        );
      } catch (err) {
        // Skip if member doesn't exist
      }
    }

    console.log('✓ Additional referrals added');
    
    // Check member 1's stats
    const stats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE from_member_id = 1) as given,
        COUNT(*) FILTER (WHERE to_member_id = 1) as received,
        SUM(amount) FILTER (WHERE to_member_id = 1 AND status = 'closed') as closed_value
      FROM referrals
      WHERE from_member_id = 1 OR to_member_id = 1
    `);
    
    console.log('\nMember 1 Statistics:');
    console.log('  Given:', stats.rows[0].given);
    console.log('  Received:', stats.rows[0].received);
    console.log('  Business Closed: ₹' + stats.rows[0].closed_value);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addMoreReferrals();
