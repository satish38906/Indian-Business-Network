const pool = require('./db');

async function createMemberProfiles() {
  try {
    // Get chapter
    const chapter = await pool.query('SELECT id FROM chapters LIMIT 1');
    if (!chapter.rows[0]) {
      console.log('No chapters found. Creating default chapter...');
      const newChapter = await pool.query(
        `INSERT INTO chapters (name, city, description) 
         VALUES ('Default Chapter', 'Mumbai', 'Default business networking chapter')
         RETURNING id`
      );
      var chapterId = newChapter.rows[0].id;
    } else {
      var chapterId = chapter.rows[0].id;
    }
    
    // Get users without member profiles
    const users = await pool.query(`
      SELECT u.id, u.name, u.email 
      FROM users u 
      LEFT JOIN members m ON u.id = m.user_id 
      WHERE m.id IS NULL
    `);
    
    if (users.rows.length === 0) {
      console.log('All users already have member profiles');
      process.exit(0);
    }
    
    console.log(`Found ${users.rows.length} users without member profiles`);
    
    let categoryCounter = 1;
    for (const user of users.rows) {
      const businessName = `${user.name}'s Business`;
      const businessCategory = `Category-${categoryCounter++}`;
      
      await pool.query(
        `INSERT INTO members (user_id, chapter_id, business_name, business_category, status)
         VALUES ($1, $2, $3, $4, 'active')`,
        [user.id, chapterId, businessName, businessCategory]
      );
      
      console.log(`✓ Created member profile for ${user.email}`);
    }
    
    console.log('✓ All member profiles created');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createMemberProfiles();
