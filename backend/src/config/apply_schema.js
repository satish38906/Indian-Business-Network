const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function applyMembersSchema() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'apply_members_schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('✓ Members table schema applied successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error applying schema:', error.message);
    process.exit(1);
  }
}

applyMembersSchema();
