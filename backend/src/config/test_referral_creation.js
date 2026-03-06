const pool = require('./db');

async function testReferralCreation() {
  try {
    // Get member IDs
    const members = await pool.query('SELECT id, user_id FROM members LIMIT 2');
    
    if (members.rows.length < 2) {
      console.log('Need at least 2 members');
      process.exit(1);
    }
    
    const fromMemberId = members.rows[0].id;
    const toMemberId = members.rows[1].id;
    
    console.log('Testing referral creation...');
    console.log('From Member ID:', fromMemberId);
    console.log('To Member ID:', toMemberId);
    
    // Test the exact query from the model
    const result = await pool.query(
      `INSERT INTO referrals (from_member_id, to_member_id, chapter_id, meeting_id, business_name, contact_number, amount, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'given') RETURNING *`,
      [fromMemberId, toMemberId, 1, null, 'Architecture Services', '1234567890', 5000]
    );
    
    console.log('\n✓ Referral created successfully!');
    console.log('Referral ID:', result.rows[0].id);
    console.log('Business Name:', result.rows[0].business_name);
    console.log('Amount:', result.rows[0].amount);
    console.log('Status:', result.rows[0].status);
    
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

testReferralCreation();
