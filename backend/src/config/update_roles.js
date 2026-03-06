const pool = require('./db');

async function updateUserRoles() {
  try {
    console.log('Updating user roles...');

    // Update President
    const president = await pool.query(
      "UPDATE users SET role = 'president' WHERE email = 'satishyadav2547@gmail.com' RETURNING name, email, role",
    );
    console.log('President updated:', president.rows[0] || 'User not found');

    // Update Vice President
    const vicePresident = await pool.query(
      "UPDATE users SET role = 'vice_president' WHERE name ILIKE '%Shivam%' RETURNING name, email, role",
    );
    console.log('Vice President updated:', vicePresident.rows[0] || 'User not found');

    // Update Secretary
    const secretary = await pool.query(
      "UPDATE users SET role = 'secretary' WHERE name ILIKE '%Lucky%' RETURNING name, email, role",
    );
    console.log('Secretary updated:', secretary.rows[0] || 'User not found');

    console.log('Role updates completed!');
  } catch (error) {
    console.error('Error updating roles:', error.message);
  } finally {
    process.exit(0);
  }
}

updateUserRoles();