const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function applySchema() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'referral_meeting_schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('✓ Referrals schema applied successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

applySchema();
