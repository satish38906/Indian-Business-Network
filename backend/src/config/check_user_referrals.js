const pool = require('./db');

async function checkUser() {
  try {
    const user = await pool.query('SELECT id, name, email FROM users WHERE id = 7');
    console.log('User 7:', user.rows[0] || 'NOT FOUND');
    
    if (user.rows[0]) {
      const member = await pool.query('SELECT * FROM members WHERE user_id = 7');
      console.log('Member profile:', member.rows[0] || 'NOT FOUND');
      
      if (member.rows[0]) {
        const memberId = member.rows[0].id;
        const refs = await pool.query(
          'SELECT * FROM referrals WHERE from_member_id = $1 OR to_member_id = $1',
          [memberId]
        );
        console.log('Referrals for member:', refs.rows.length);
        refs.rows.forEach(r => {
          console.log(`  - ${r.business_name}: ${r.status} (₹${r.amount})`);
        });
      }
    }
    
    console.log('\nAll referrals in database:');
    const allRefs = await pool.query('SELECT id, from_member_id, to_member_id, business_name, status, amount FROM referrals');
    console.log('Total:', allRefs.rows.length);
    allRefs.rows.forEach(r => {
      console.log(`  - From ${r.from_member_id} to ${r.to_member_id}: ${r.business_name} (${r.status})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUser();
