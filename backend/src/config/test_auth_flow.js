const pool = require('./db');
const bcrypt = require('bcrypt');

async function testAuthFlow() {
  const testEmail = 'test' + Date.now() + '@example.com';
  const testPassword = 'password123';
  const testName = 'Test User';

  try {
    console.log('=== AUTH FLOW TEST ===\n');
    
    // Step 1: Create user (simulate signup)
    console.log('1. Creating user...');
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const normalizedEmail = testEmail.trim().toLowerCase();
    
    const createResult = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [testName, normalizedEmail, hashedPassword, 'member']
    );
    
    console.log('   ✓ User created:', createResult.rows[0]);
    const userId = createResult.rows[0].id;
    
    // Step 2: Verify user exists
    console.log('\n2. Verifying user exists...');
    const verifyResult = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = $1',
      [normalizedEmail]
    );
    
    if (verifyResult.rows.length > 0) {
      console.log('   ✓ User found:', { id: verifyResult.rows[0].id, email: verifyResult.rows[0].email });
    } else {
      console.log('   ✗ User NOT found!');
    }
    
    // Step 3: Test login (simulate login)
    console.log('\n3. Testing login...');
    const loginResult = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = $1',
      [normalizedEmail]
    );
    
    if (loginResult.rows.length > 0) {
      const user = loginResult.rows[0];
      const passwordMatch = await bcrypt.compare(testPassword, user.password);
      console.log('   ✓ User found for login');
      console.log('   ✓ Password match:', passwordMatch);
    } else {
      console.log('   ✗ User NOT found for login!');
    }
    
    // Step 4: Cleanup
    console.log('\n4. Cleaning up...');
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    console.log('   ✓ Test user deleted');
    
    console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
    
  } catch (error) {
    console.error('\n✗ TEST FAILED:', error.message);
  } finally {
    process.exit();
  }
}

testAuthFlow();
