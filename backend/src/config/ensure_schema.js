const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function ensureSchema() {
  try {
    console.log('Ensuring database schema...');
    
    // Apply referral meeting schema (contains referrals and attendance tables)
    const referralSchema = fs.readFileSync(path.join(__dirname, 'referral_meeting_schema.sql'), 'utf8');
    await pool.query(referralSchema);
    console.log('✓ Referral meeting schema applied');
    
    console.log('Schema setup complete!');
  } catch (error) {
    console.error('Schema setup failed:', error.message);
  }
}

if (require.main === module) {
  ensureSchema().then(() => process.exit(0));
}

module.exports = ensureSchema;