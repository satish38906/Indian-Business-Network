const pool = require('./db');

async function seedAttendance() {
  try {
    const meetingsResult = await pool.query('SELECT id FROM meetings ORDER BY id LIMIT 3');
    const membersResult = await pool.query('SELECT id FROM members LIMIT 10');
    
    if (meetingsResult.rows.length === 0 || membersResult.rows.length === 0) {
      console.log('No meetings or members found');
      return;
    }

    const statuses = ['present', 'late', 'absent'];
    
    for (const meeting of meetingsResult.rows) {
      for (const member of membersResult.rows) {
        const status = statuses[Math.floor(Math.random() * 2)];
        await pool.query(
          `INSERT INTO attendance (meeting_id, member_id, status) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (meeting_id, member_id) DO NOTHING`,
          [meeting.id, member.id, status]
        );
      }
    }
    
    console.log('Attendance seeded successfully');
  } catch (error) {
    console.error('Error seeding attendance:', error);
  } finally {
    process.exit();
  }
}

seedAttendance();
