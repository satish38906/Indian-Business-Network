const pool = require('./db');

async function cleanupData() {
  try {
    console.log('Cleaning up data...\n');

    // Find all Satish users with president role
    const satishUsers = await pool.query(
      "SELECT id, name, email, role FROM users WHERE name ILIKE '%Satish%' AND role = 'president' ORDER BY id"
    );
    console.log('Satish president users found:', satishUsers.rows.length);
    satishUsers.rows.forEach(u => console.log(`  - ID: ${u.id}, Email: ${u.email}`));

    // Keep the first one, delete others
    if (satishUsers.rows.length > 1) {
      for (let i = 1; i < satishUsers.rows.length; i++) {
        const userId = satishUsers.rows[i].id;
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
        console.log(`Deleted duplicate Satish user ID: ${userId}`);
      }
    }

    // Find and delete member with category 5
    const category5 = await pool.query(
      "SELECT * FROM members WHERE business_category ILIKE '%Category-5%' OR business_category = '5'"
    );
    console.log('\nMembers with category 5:', category5.rows.length);
    
    if (category5.rows.length > 0) {
      for (const member of category5.rows) {
        await pool.query('DELETE FROM members WHERE id = $1', [member.id]);
        console.log(`Deleted member ID: ${member.id}, Category: ${member.business_category}`);
      }
    }

    console.log('\nCleanup completed!');
  } catch (error) {
    console.error('Error during cleanup:', error.message);
  } finally {
    process.exit(0);
  }
}

cleanupData();