const pool = require('./db');

async function updateBusinessCategories() {
  try {
    console.log('Updating business categories...\n');

    // Update Sachin
    const sachin = await pool.query(
      `UPDATE members SET business_category = 'Midas Finance' 
       WHERE user_id IN (SELECT id FROM users WHERE name ILIKE '%Sachin%')
       RETURNING *`
    );
    console.log('Sachin updated:', sachin.rows[0] || 'Not found');

    // Update Vishal
    const vishal = await pool.query(
      `UPDATE members SET business_category = 'HappyLife Finserv' 
       WHERE user_id IN (SELECT id FROM users WHERE name ILIKE '%Vishal%')
       RETURNING *`
    );
    console.log('Vishal updated:', vishal.rows[0] || 'Not found');

    // Update Deepak
    const deepak = await pool.query(
      `UPDATE members SET business_category = 'Word Monk' 
       WHERE user_id IN (SELECT id FROM users WHERE name ILIKE '%Deepak%')
       RETURNING *`
    );
    console.log('Deepak updated:', deepak.rows[0] || 'Not found');

    // Update Lucky
    const lucky = await pool.query(
      `UPDATE members SET business_category = 'Kriation' 
       WHERE user_id IN (SELECT id FROM users WHERE name ILIKE '%Lucky%')
       RETURNING *`
    );
    console.log('Lucky updated:', lucky.rows[0] || 'Not found');

    console.log('\nBusiness categories updated successfully!');
  } catch (error) {
    console.error('Error updating business categories:', error.message);
  } finally {
    process.exit(0);
  }
}

updateBusinessCategories();