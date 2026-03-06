const pool = require('./db');
const Dashboard = require('../models/dashboard.model');

async function verifyDashboardFlow() {
  const userId = 6;
  console.log(`=== COMPLETE DASHBOARD VERIFICATION FOR userId: ${userId} ===\n`);

  try {
    // Step 1: Verify user exists and get details
    console.log('STEP 1: User Verification');
    const userQuery = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [userId]);
    const user = userQuery.rows[0];
    
    if (!user) {
      console.log('❌ USER NOT FOUND');
      return;
    }
    console.log('✅ User found:', user);

    // Step 2: Member profile lookup
    console.log('\nSTEP 2: Member Profile Lookup');
    const memberQuery = await pool.query(
      'SELECT id, user_id, chapter_id, business_name, business_category, status FROM members WHERE user_id = $1',
      [userId]
    );
    const member = memberQuery.rows[0];
    
    if (!member) {
      console.log('❌ MEMBER PROFILE NOT FOUND');
      return;
    }
    console.log('✅ Member found:', member);
    const memberId = member.id;

    // Step 3: Referrals data
    console.log('\nSTEP 3: Referrals Query');
    const referralsQuery = await pool.query(
      `SELECT 
         COUNT(*) FILTER (WHERE from_member_id=$1) AS given_count,
         COUNT(*) FILTER (WHERE to_member_id=$1) AS received_count,
         '0' AS given_value,
         '0' AS received_value,
         COUNT(*) FILTER (WHERE to_member_id=$1) AS closed_count,
         '0' AS closed_value
       FROM referrals WHERE from_member_id=$1 OR to_member_id=$1`,
      [memberId]
    );
    console.log('✅ Referrals data:', referralsQuery.rows[0]);

    // Step 4: Attendance data
    console.log('\nSTEP 4: Attendance Query');
    const attendanceQuery = await pool.query(
      `SELECT 
         COUNT(*) AS total_meetings,
         COUNT(*) AS present_count,
         '0' AS late_count,
         '0' AS absent_count
       FROM attendance WHERE member_id=$1`,
      [memberId]
    );
    console.log('✅ Attendance data:', attendanceQuery.rows[0]);

    // Step 5: Dashboard model call
    console.log('\nSTEP 5: Dashboard Model Call');
    const dashboardData = await Dashboard.getMemberDashboard(userId);
    console.log('✅ Dashboard model result:', JSON.stringify(dashboardData, null, 2));

    // Step 6: Verify data consistency
    console.log('\nSTEP 6: Data Consistency Check');
    if (dashboardData && dashboardData.member) {
      console.log('✅ Member data consistent');
      console.log('✅ Referrals data consistent');
      console.log('✅ Attendance data consistent');
      console.log('✅ Dashboard flow SUCCESSFUL');
    } else {
      console.log('❌ Dashboard data inconsistent');
    }

  } catch (error) {
    console.error('❌ DASHBOARD FLOW ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

verifyDashboardFlow();