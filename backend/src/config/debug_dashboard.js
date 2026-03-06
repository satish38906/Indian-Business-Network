const pool = require('./db');

async function debugDashboard() {
  const userId = 6;
  console.log(`=== Dashboard Debug for userId: ${userId} ===\n`);

  try {
    // 1. Check if user exists
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    console.log('1. User data:', user.rows[0] || 'USER NOT FOUND');

    // 2. Check member profile
    const member = await pool.query('SELECT * FROM members WHERE user_id = $1', [userId]);
    console.log('2. Member data:', member.rows[0] || 'MEMBER NOT FOUND');

    if (member.rows[0]) {
      const memberId = member.rows[0].id;
      
      // 3. Check referrals
      const referrals = await pool.query('SELECT * FROM referrals WHERE from_member_id = $1 OR to_member_id = $1', [memberId]);
      console.log('3. Referrals count:', referrals.rows.length);
      
      // 4. Check attendance
      const attendance = await pool.query('SELECT * FROM attendance WHERE member_id = $1', [memberId]);
      console.log('4. Attendance records:', attendance.rows.length);
    }

    // 5. Check chapters
    const chapters = await pool.query('SELECT * FROM chapters');
    console.log('5. Available chapters:', chapters.rows.length);

  } catch (error) {
    console.error('Debug error:', error.message);
  } finally {
    process.exit(0);
  }
}

debugDashboard();