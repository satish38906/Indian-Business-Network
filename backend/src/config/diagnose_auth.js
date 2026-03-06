const pool = require('./db');

async function diagnoseAuth() {
  try {
    console.log('=== AUTH DIAGNOSTIC ===\n');
    
    // Check users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    console.log('Users table exists:', tableCheck.rows[0].exists);
    
    // Check all users
    const users = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY id');
    console.log(`\nTotal users: ${users.rows.length}`);
    users.rows.forEach(u => {
      console.log(`  - ID: ${u.id}, Email: ${u.email}, Name: ${u.name}, Role: ${u.role}`);
    });
    
    // Check for duplicate emails
    const duplicates = await pool.query(`
      SELECT email, COUNT(*) as count 
      FROM users 
      GROUP BY email 
      HAVING COUNT(*) > 1
    `);
    if (duplicates.rows.length > 0) {
      console.log('\n⚠️  Duplicate emails found:');
      duplicates.rows.forEach(d => console.log(`  - ${d.email}: ${d.count} times`));
    } else {
      console.log('\n✓ No duplicate emails');
    }
    
    // Check email case sensitivity
    const caseCheck = await pool.query(`
      SELECT email, LOWER(email) as lower_email 
      FROM users 
      WHERE email != LOWER(email)
    `);
    if (caseCheck.rows.length > 0) {
      console.log('\n⚠️  Mixed case emails found:');
      caseCheck.rows.forEach(c => console.log(`  - ${c.email} -> ${c.lower_email}`));
    } else {
      console.log('✓ All emails are lowercase');
    }
    
  } catch (error) {
    console.error('Diagnostic error:', error);
  } finally {
    process.exit();
  }
}

diagnoseAuth();
