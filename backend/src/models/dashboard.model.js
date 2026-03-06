const pool = require("../config/db");

const Dashboard = {
  getMemberDashboard: async (userId) => {
    try {
      let member = { rows: [null] };
      
      try {
        member = await pool.query(
          `SELECT m.id, m.chapter_id, m.business_name, m.business_category, m.status
           FROM members m WHERE m.user_id = $1`,
          [userId]
        );
      } catch (err) {
        console.log("Members table query failed:", err.message);
        return null;
      }

      if (!member.rows[0]) {
        console.log("No member found for userId:", userId);
        return null;
      }

      const memberId = member.rows[0].id;

      let referrals = { rows: [{
        given_count: "0",
        received_count: "0",
        given_value: "0",
        received_value: "0",
        closed_count: "0",
        closed_value: "0"
      }]};

      try {
        referrals = await pool.query(
          `SELECT 
             COUNT(*) AS given_count,
             COUNT(*) AS received_count,
             COALESCE(SUM(amount), 0) AS given_value,
             COALESCE(SUM(amount), 0) AS received_value,
             COUNT(*) FILTER (WHERE status='closed') AS closed_count,
             COALESCE(SUM(amount) FILTER (WHERE status='closed'), 0) AS closed_value
           FROM referrals`
        );
      } catch (err) {
        console.log("Referrals query failed:", err.message);
      }

      let attendance = { rows: [{
        total_meetings: "0",
        present_count: "0",
        late_count: "0",
        absent_count: "0"
      }]};

      try {
        attendance = await pool.query(
          `SELECT 
             COUNT(*) AS total_meetings,
             COUNT(*) FILTER (WHERE status='present') AS present_count,
             COUNT(*) FILTER (WHERE status='late') AS late_count,
             COUNT(*) FILTER (WHERE status='absent') AS absent_count
           FROM attendance WHERE member_id=$1`,
          [memberId]
        );
      } catch (err) {
        console.log("Attendance query failed:", err.message);
      }

      return {
        member: member.rows[0],
        referrals: referrals.rows[0],
        attendance: attendance.rows[0],
        recentReferrals: []
      };
    } catch (error) {
      console.error("Dashboard model error:", error.message);
      throw error;
    }
  },

  getPresidentDashboard: async (userId) => {
    return null;
  }
};

module.exports = Dashboard;
