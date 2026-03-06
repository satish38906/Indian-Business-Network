const pool = require('./db');

async function resetAllReferrals() {
  try {
    console.log('=== RESETTING ALL REFERRAL DATA ===\n');

    // Count existing referrals
    const countResult = await pool.query('SELECT COUNT(*) FROM referrals');
    const totalReferrals = countResult.rows[0].count;
    console.log(`Found ${totalReferrals} referrals to delete\n`);

    if (totalReferrals === '0') {
      console.log('No referrals to delete. All members already have zero referrals.');
      return;
    }

    // Delete all referrals
    console.log('Deleting all referrals...');
    await pool.query('DELETE FROM referrals');
    console.log('✓ All referrals deleted\n');

    // Verify deletion
    const verifyResult = await pool.query('SELECT COUNT(*) FROM referrals');
    console.log(`Remaining referrals: ${verifyResult.rows[0].count}`);

    // Show member count
    const memberResult = await pool.query('SELECT COUNT(*) FROM members');
    console.log(`Total members: ${memberResult.rows[0].count}`);

    console.log('\n✓ All member referral data has been reset to zero');
    console.log('All members now have:');
    console.log('  - Referrals Given: 0');
    console.log('  - Referrals Received: 0');
    console.log('  - Business Closed: ₹0');

  } catch (error) {
    console.error('\n✗ Error:', error.message);
  } finally {
    process.exit();
  }
}

resetAllReferrals();
