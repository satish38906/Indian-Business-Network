const pool = require('./db');

async function diagnoseReferrals() {
  try {
    console.log('=== REFERRAL DIAGNOSTIC ===\n');

    // Check referrals table
    console.log('1. Checking referrals...');
    const referrals = await pool.query(`
      SELECT r.id, r.from_member_id, r.to_member_id, r.business_name, r.amount, r.status,
             m1.user_id as from_user_id, u1.name as from_name,
             m2.user_id as to_user_id, u2.name as to_name
      FROM referrals r
      LEFT JOIN members m1 ON r.from_member_id = m1.id
      LEFT JOIN members m2 ON r.to_member_id = m2.id
      LEFT JOIN users u1 ON m1.user_id = u1.id
      LEFT JOIN users u2 ON m2.user_id = u2.id
      ORDER BY r.id DESC
      LIMIT 5
    `);
    
    console.log(`Total referrals: ${referrals.rows.length}`);
    referrals.rows.forEach(r => {
      console.log(`\nReferral ID: ${r.id}`);
      console.log(`  From: member_id=${r.from_member_id}, user_id=${r.from_user_id}, name=${r.from_name}`);
      console.log(`  To: member_id=${r.to_member_id}, user_id=${r.to_user_id}, name=${r.to_name}`);
      console.log(`  Business: ${r.business_name}, Amount: ${r.amount}, Status: ${r.status}`);
    });

    // Check members table
    console.log('\n2. Checking members...');
    const members = await pool.query(`
      SELECT m.id as member_id, m.user_id, u.name, u.email
      FROM members m
      LEFT JOIN users u ON m.user_id = u.id
      ORDER BY m.id
      LIMIT 10
    `);
    
    console.log(`Total members: ${members.rows.length}`);
    members.rows.forEach(m => {
      console.log(`  member_id=${m.member_id}, user_id=${m.user_id}, name=${m.name}, email=${m.email}`);
    });

    // Check for orphaned referrals
    console.log('\n3. Checking for orphaned referrals...');
    const orphaned = await pool.query(`
      SELECT r.id, r.from_member_id, r.to_member_id
      FROM referrals r
      LEFT JOIN members m1 ON r.from_member_id = m1.id
      LEFT JOIN members m2 ON r.to_member_id = m2.id
      WHERE m1.id IS NULL OR m2.id IS NULL
    `);
    
    if (orphaned.rows.length > 0) {
      console.log(`⚠️  Found ${orphaned.rows.length} orphaned referrals:`);
      orphaned.rows.forEach(r => {
        console.log(`  Referral ${r.id}: from_member=${r.from_member_id}, to_member=${r.to_member_id}`);
      });
    } else {
      console.log('✓ No orphaned referrals');
    }

    // Test query for specific user
    console.log('\n4. Testing query for user_id=3...');
    const member = await pool.query('SELECT id FROM members WHERE user_id = 3');
    if (member.rows[0]) {
      const memberId = member.rows[0].id;
      console.log(`User 3 has member_id: ${memberId}`);
      
      const userRefs = await pool.query(`
        SELECT r.*, u1.name AS from_member_name, u2.name AS to_member_name
        FROM referrals r
        LEFT JOIN members m1 ON r.from_member_id = m1.id
        LEFT JOIN members m2 ON r.to_member_id = m2.id
        LEFT JOIN users u1 ON m1.user_id = u1.id
        LEFT JOIN users u2 ON m2.user_id = u2.id
        WHERE r.from_member_id=$1 OR r.to_member_id=$1
      `, [memberId]);
      
      console.log(`Referrals for member ${memberId}: ${userRefs.rows.length}`);
      userRefs.rows.forEach(r => {
        const direction = r.from_member_id === memberId ? 'GIVEN' : 'RECEIVED';
        console.log(`  ${direction}: ${r.business_name} (${r.amount})`);
      });
    } else {
      console.log('⚠️  User 3 has no member profile');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

diagnoseReferrals();
