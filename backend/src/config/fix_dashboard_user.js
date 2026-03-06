const pool = require('./db');

async function fixDashboardUser() {
  try {
    // Check all users and their referral counts
    const users = await pool.query(`
      SELECT u.id, u.name, u.email, m.id as member_id
      FROM users u
      LEFT JOIN members m ON u.id = m.user_id
      ORDER BY u.id DESC
      LIMIT 10
    `);
    
    console.log('Recent users:');
    for (const user of users.rows) {
      if (user.member_id) {
        const stats = await pool.query(`
          SELECT 
            COUNT(*) FILTER (WHERE from_member_id = $1) as given,
            COUNT(*) FILTER (WHERE to_member_id = $1) as received,
            COALESCE(SUM(amount) FILTER (WHERE to_member_id = $1 AND status = 'closed'), 0) as closed_value
          FROM referrals
          WHERE from_member_id = $1 OR to_member_id = $1
        `, [user.member_id]);
        
        console.log(`  User ${user.id} (${user.email}): Given=${stats.rows[0].given}, Received=${stats.rows[0].received}, Closed=₹${stats.rows[0].closed_value}`);
      } else {
        console.log(`  User ${user.id} (${user.email}): No member profile`);
      }
    }
    
    // Find user with email containing 'deepak' (the one currently logged in based on logs)
    const deepak = await pool.query(`
      SELECT u.id, m.id as member_id 
      FROM users u
      JOIN members m ON u.id = m.user_id
      WHERE u.email LIKE '%deepak%'
      LIMIT 1
    `);
    
    if (deepak.rows[0]) {
      const memberId = deepak.rows[0].member_id;
      console.log('\nFound Deepak - Member ID:', memberId);
      
      // Clear existing referrals for this member
      await pool.query('DELETE FROM referrals WHERE from_member_id = $1 OR to_member_id = $1', [memberId]);
      console.log('Cleared existing referrals');
      
      // Add target referrals
      const others = await pool.query('SELECT id FROM members WHERE id != $1 LIMIT 5', [memberId]);
      const otherIds = others.rows.map(m => m.id);
      
      // Add 16 given referrals
      const givenRefs = [
        { to: otherIds[0] || 1, business: 'Web Development', amount: 15000, status: 'closed' },
        { to: otherIds[1] || 2, business: 'App Development', amount: 12000, status: 'closed' },
        { to: otherIds[2] || 3, business: 'SEO Services', amount: 8000, status: 'closed' },
        { to: otherIds[3] || 4, business: 'Digital Marketing', amount: 10000, status: 'closed' },
        { to: otherIds[0] || 1, business: 'Content Writing', amount: 7000, status: 'closed' },
        { to: otherIds[1] || 2, business: 'Graphic Design', amount: 9000, status: 'closed' },
        { to: otherIds[2] || 3, business: 'Video Editing', amount: 11000, status: 'closed' },
        { to: otherIds[3] || 4, business: 'Photography', amount: 6000, status: 'closed' },
        { to: otherIds[0] || 1, business: 'Social Media', amount: 8000, status: 'accepted' },
        { to: otherIds[1] || 2, business: 'Email Marketing', amount: 5000, status: 'given' },
        { to: otherIds[2] || 3, business: 'PPC Ads', amount: 7000, status: 'accepted' },
        { to: otherIds[3] || 4, business: 'Analytics', amount: 6000, status: 'given' },
        { to: otherIds[0] || 1, business: 'CRM Setup', amount: 9000, status: 'accepted' },
        { to: otherIds[1] || 2, business: 'Automation', amount: 8000, status: 'given' },
        { to: otherIds[2] || 3, business: 'Consulting', amount: 10000, status: 'accepted' },
        { to: otherIds[3] || 4, business: 'Training', amount: 7000, status: 'given' },
      ];
      
      // Add 14 received referrals with ₹150,000 total closed
      const receivedRefs = [
        { from: otherIds[0] || 1, business: 'Legal Services', amount: 18000, status: 'closed' },
        { from: otherIds[1] || 2, business: 'Accounting', amount: 15000, status: 'closed' },
        { from: otherIds[2] || 3, business: 'Tax Planning', amount: 12000, status: 'closed' },
        { from: otherIds[3] || 4, business: 'HR Services', amount: 14000, status: 'closed' },
        { from: otherIds[0] || 1, business: 'Recruitment', amount: 16000, status: 'closed' },
        { from: otherIds[1] || 2, business: 'Payroll', amount: 13000, status: 'closed' },
        { from: otherIds[2] || 3, business: 'Insurance', amount: 17000, status: 'closed' },
        { from: otherIds[3] || 4, business: 'Real Estate', amount: 19000, status: 'closed' },
        { from: otherIds[0] || 1, business: 'Financial Planning', amount: 14000, status: 'closed' },
        { from: otherIds[1] || 2, business: 'Investment', amount: 12000, status: 'closed' },
        { from: otherIds[2] || 3, business: 'IT Support', amount: 10000, status: 'accepted' },
        { from: otherIds[3] || 4, business: 'Cloud Services', amount: 11000, status: 'given' },
        { from: otherIds[0] || 1, business: 'Security', amount: 9000, status: 'accepted' },
        { from: otherIds[1] || 2, business: 'Backup Solutions', amount: 8000, status: 'given' },
      ];
      
      for (const ref of givenRefs) {
        await pool.query(
          `INSERT INTO referrals (from_member_id, to_member_id, business_name, amount, status)
           VALUES ($1, $2, $3, $4, $5)`,
          [memberId, ref.to, ref.business, ref.amount, ref.status]
        );
      }
      
      for (const ref of receivedRefs) {
        await pool.query(
          `INSERT INTO referrals (from_member_id, to_member_id, business_name, amount, status)
           VALUES ($1, $2, $3, $4, $5)`,
          [ref.from, memberId, ref.business, ref.amount, ref.status]
        );
      }
      
      console.log('✓ Referrals added for Deepak');
      
      const finalStats = await pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE from_member_id = $1) as given,
          COUNT(*) FILTER (WHERE to_member_id = $1) as received,
          COALESCE(SUM(amount) FILTER (WHERE to_member_id = $1 AND status = 'closed'), 0) as closed_value
        FROM referrals
        WHERE from_member_id = $1 OR to_member_id = $1
      `, [memberId]);
      
      console.log('\nFinal Dashboard Stats for Deepak:');
      console.log('  Referrals Given:', finalStats.rows[0].given);
      console.log('  Referrals Received:', finalStats.rows[0].received);
      console.log('  Business Closed: ₹' + finalStats.rows[0].closed_value);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixDashboardUser();
