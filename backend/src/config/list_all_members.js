const pool = require('./db');

async function listAllMembers() {
  try {
    console.log('=== ALL MEMBERS LIST ===\n');

    const result = await pool.query(`
      SELECT 
        m.id as member_id,
        m.user_id,
        u.name,
        u.email,
        m.business_name,
        m.business_category,
        m.status
      FROM members m
      LEFT JOIN users u ON m.user_id = u.id
      ORDER BY m.id
    `);

    console.log(`Total Members: ${result.rows.length}\n`);
    console.log('member_id | user_id | name              | business_category        | email');
    console.log('----------|---------|-------------------|--------------------------|------------------');
    
    result.rows.forEach(m => {
      const memberId = String(m.member_id).padEnd(9);
      const userId = String(m.user_id).padEnd(7);
      const name = (m.name || 'N/A').padEnd(17);
      const category = (m.business_category || 'N/A').padEnd(24);
      const email = m.email || 'N/A';
      
      console.log(`${memberId} | ${userId} | ${name} | ${category} | ${email}`);
    });

    console.log('\n=== SUMMARY ===');
    console.log(`Active members: ${result.rows.filter(m => m.status === 'active').length}`);
    console.log(`Total members: ${result.rows.length}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

listAllMembers();
