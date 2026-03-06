const pool = require('./db');

async function testDashboard() {
  try {
    // Get a user
    const user = await pool.query('SELECT id, email FROM users LIMIT 1');
    if (!user.rows[0]) {
      console.log('No users found. Please create a user first.');
      process.exit(1);
    }
    
    console.log('Testing with user:', user.rows[0]);
    
    // Check if member exists
    const member = await pool.query('SELECT * FROM members WHERE user_id = $1', [user.rows[0].id]);
    console.log('Member profile:', member.rows[0] || 'NOT FOUND');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testDashboard();
