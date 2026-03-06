const pool = require('./db');

async function normalizeEmails() {
  try {
    console.log('Normalizing user emails to lowercase...\n');
    
    const result = await pool.query(`
      UPDATE users 
      SET email = LOWER(TRIM(email))
      WHERE email != LOWER(TRIM(email))
      RETURNING id, email
    `);
    
    if (result.rows.length > 0) {
      console.log(`✓ Normalized ${result.rows.length} email(s):`);
      result.rows.forEach(r => console.log(`  - ID ${r.id}: ${r.email}`));
    } else {
      console.log('✓ All emails already normalized');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

normalizeEmails();
