const pool = require('./db');

async function updateRoleConstraint() {
  try {
    console.log('Updating role constraint...');

    // Drop existing constraint
    await pool.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
    
    // Add new constraint with additional roles
    await pool.query(`
      ALTER TABLE users ADD CONSTRAINT users_role_check 
      CHECK (role IN ('admin', 'president', 'vice_president', 'secretary', 'member'))
    `);
    
    console.log('Role constraint updated successfully!');
    
    // Now update the user roles
    console.log('Updating user roles...');

    const president = await pool.query(
      "UPDATE users SET role = 'president' WHERE email = 'satishyadav2547@gmail.com' RETURNING name, email, role"
    );
    console.log('President:', president.rows[0] || 'Not found');

    const vicePresident = await pool.query(
      "UPDATE users SET role = 'vice_president' WHERE name ILIKE '%Shivam%' RETURNING name, email, role"
    );
    console.log('Vice President:', vicePresident.rows[0] || 'Not found');

    const secretary = await pool.query(
      "UPDATE users SET role = 'secretary' WHERE name ILIKE '%Lucky%' RETURNING name, email, role"
    );
    console.log('Secretary:', secretary.rows[0] || 'Not found');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

updateRoleConstraint();