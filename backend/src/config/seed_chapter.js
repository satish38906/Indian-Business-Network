const pool = require('./db');

async function seedChapter() {
  try {
    const result = await pool.query(
      `INSERT INTO chapters (name, city, description) 
       VALUES ('Mumbai Chapter', 'Mumbai', 'Business networking chapter in Mumbai')
       ON CONFLICT DO NOTHING
       RETURNING id`
    );
    
    if (result.rows.length > 0) {
      console.log('✓ Chapter created with ID:', result.rows[0].id);
    } else {
      const existing = await pool.query('SELECT id FROM chapters LIMIT 1');
      console.log('✓ Chapter already exists with ID:', existing.rows[0]?.id);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

seedChapter();
