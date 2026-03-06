const pool = require('./db');

async function updateMemberContacts() {
  try {
    console.log('Updating member contact numbers...\n');

    // Update Satish
    const satish = await pool.query(
      `UPDATE members SET contact = '932298502' 
       WHERE user_id IN (SELECT id FROM users WHERE name ILIKE '%Satish%')
       RETURNING *`
    );
    console.log('Satish updated:', satish.rows[0] || 'Not found');

    // Update Shivam
    const shivam = await pool.query(
      `UPDATE members SET contact = '8826459810' 
       WHERE user_id IN (SELECT id FROM users WHERE name ILIKE '%Shivam%')
       RETURNING *`
    );
    console.log('Shivam updated:', shivam.rows[0] || 'Not found');

    // Update Lucky
    const lucky = await pool.query(
      `UPDATE members SET contact = '9874156545' 
       WHERE user_id IN (SELECT id FROM users WHERE name ILIKE '%Lucky%')
       RETURNING *`
    );
    console.log('Lucky updated:', lucky.rows[0] || 'Not found');

    // Update Suraj
    const suraj = await pool.query(
      `UPDATE members SET contact = '312524262789' 
       WHERE user_id IN (SELECT id FROM users WHERE name ILIKE '%Suraj%')
       RETURNING *`
    );
    console.log('Suraj updated:', suraj.rows[0] || 'Not found');

    console.log('\nContact numbers updated successfully!');
  } catch (error) {
    console.error('Error updating contacts:', error.message);
  } finally {
    process.exit(0);
  }
}

updateMemberContacts();