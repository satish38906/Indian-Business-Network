const pool = require('./db');

async function seedReferrals() {
  try {
    // Get members
    const members = await pool.query('SELECT id FROM members LIMIT 6');
    
    if (members.rows.length < 2) {
      console.log('Need at least 2 members to create referrals');
      process.exit(1);
    }

    const memberIds = members.rows.map(m => m.id);
    
    // Create sample referrals
    const referrals = [
      {
        from: memberIds[0],
        to: memberIds[1],
        business: 'Web Development Project',
        value: 50000,
        status: 'closed'
      },
      {
        from: memberIds[0],
        to: memberIds[2] || memberIds[1],
        business: 'Marketing Consultation',
        value: 25000,
        status: 'accepted'
      },
      {
        from: memberIds[1],
        to: memberIds[0],
        business: 'Accounting Services',
        value: 15000,
        status: 'closed'
      },
      {
        from: memberIds[2] || memberIds[1],
        to: memberIds[0],
        business: 'Legal Advisory',
        value: 30000,
        status: 'given'
      },
      {
        from: memberIds[3] || memberIds[0],
        to: memberIds[0],
        business: 'IT Support',
        value: 20000,
        status: 'closed'
      }
    ];

    for (const ref of referrals) {
      await pool.query(
        `INSERT INTO referrals (from_member_id, to_member_id, business_name, amount, status)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [ref.from, ref.to, ref.business, ref.value, ref.status]
      );
    }

    console.log('✓ Sample referrals created successfully');
    
    // Show summary
    const summary = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status='given') as given,
        COUNT(*) FILTER (WHERE status='accepted') as accepted,
        COUNT(*) FILTER (WHERE status='closed') as closed,
        SUM(amount) FILTER (WHERE status='closed') as total_business
      FROM referrals
    `);
    
    console.log('Summary:', summary.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedReferrals();
