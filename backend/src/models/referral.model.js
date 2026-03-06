const pool = require("../config/db");

const Referral = {
  create: async (fromMemberId, toMemberId, chapterId, meetingId, businessName, contactNumber, amount, notes) => {
    const result = await pool.query(
      `INSERT INTO referrals (from_member_id, to_member_id, chapter_id, meeting_id, business_name, contact_number, amount, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'given') RETURNING *`,
      [fromMemberId, toMemberId, chapterId, meetingId, businessName, contactNumber, amount || 0]
    );
    return result.rows[0];
  },

  getAll: async () => {
    const result = await pool.query(`
      SELECT r.*, 
             m1.user_id AS from_user_id, u1.name AS from_member_name,
             m2.user_id AS to_user_id, u2.name AS to_member_name,
             c.name AS chapter_name
      FROM referrals r
      LEFT JOIN members m1 ON r.from_member_id = m1.id
      LEFT JOIN members m2 ON r.to_member_id = m2.id
      LEFT JOIN users u1 ON m1.user_id = u1.id
      LEFT JOIN users u2 ON m2.user_id = u2.id
      LEFT JOIN chapters c ON r.chapter_id = c.id
      ORDER BY r.created_at DESC
    `);
    return result.rows;
  },

  getById: async (id) => {
    const result = await pool.query(
      `SELECT r.*, 
              m1.user_id AS from_user_id, u1.name AS from_member_name,
              m2.user_id AS to_user_id, u2.name AS to_member_name
       FROM referrals r
       LEFT JOIN members m1 ON r.from_member_id = m1.id
       LEFT JOIN members m2 ON r.to_member_id = m2.id
       LEFT JOIN users u1 ON m1.user_id = u1.id
       LEFT JOIN users u2 ON m2.user_id = u2.id
       WHERE r.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  updateStatus: async (id, status) => {
    const result = await pool.query(
      `UPDATE referrals SET status=$1 WHERE id=$2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  },

  update: async (id, businessName, contactNumber, amount, status) => {
    const result = await pool.query(
      `UPDATE referrals SET business_name=$1, contact_number=$2, amount=$3, status=$4, created_at=CURRENT_TIMESTAMP WHERE id=$5 RETURNING *`,
      [businessName, contactNumber, amount, status, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await pool.query("DELETE FROM referrals WHERE id=$1 RETURNING *", [id]);
    return result.rows[0];
  },

  getByMember: async (memberId) => {
    const result = await pool.query(
      `SELECT r.*, u1.name AS from_member_name, u2.name AS to_member_name
       FROM referrals r
       LEFT JOIN members m1 ON r.from_member_id = m1.id
       LEFT JOIN members m2 ON r.to_member_id = m2.id
       LEFT JOIN users u1 ON m1.user_id = u1.id
       LEFT JOIN users u2 ON m2.user_id = u2.id
       WHERE r.from_member_id=$1 OR r.to_member_id=$1
       ORDER BY r.created_at DESC`,
      [memberId]
    );
    return result.rows;
  },

  getByChapter: async (chapterId) => {
    const result = await pool.query(
      `SELECT r.*, u1.name AS from_member_name, u2.name AS to_member_name
       FROM referrals r
       LEFT JOIN members m1 ON r.from_member_id = m1.id
       LEFT JOIN members m2 ON r.to_member_id = m2.id
       LEFT JOIN users u1 ON m1.user_id = u1.id
       LEFT JOIN users u2 ON m2.user_id = u2.id
       WHERE r.chapter_id=$1
       ORDER BY r.created_at DESC`,
      [chapterId]
    );
    return result.rows;
  },

  getMemberReport: async (memberId) => {
    const result = await pool.query(
      `SELECT 
         COUNT(*) FILTER (WHERE from_member_id=$1) AS given_count,
         COUNT(*) FILTER (WHERE to_member_id=$1) AS received_count,
         COALESCE(SUM(amount) FILTER (WHERE from_member_id=$1), 0) AS given_value,
         COALESCE(SUM(amount) FILTER (WHERE to_member_id=$1), 0) AS received_value,
         COUNT(*) FILTER (WHERE from_member_id=$1 AND status='closed') AS closed_given,
         COUNT(*) FILTER (WHERE to_member_id=$1 AND status='closed') AS closed_received
       FROM referrals WHERE from_member_id=$1 OR to_member_id=$1`,
      [memberId]
    );
    return result.rows[0];
  },

  getChapterReport: async (chapterId) => {
    const result = await pool.query(
      `SELECT 
         COUNT(*) AS total_referrals,
         COALESCE(SUM(amount), 0) AS total_value,
         COUNT(*) FILTER (WHERE status='given') AS given_count,
         COUNT(*) FILTER (WHERE status='accepted') AS accepted_count,
         COUNT(*) FILTER (WHERE status='closed') AS closed_count
       FROM referrals WHERE chapter_id=$1`,
      [chapterId]
    );
    return result.rows[0];
  },

  transfer: async (id, newToMemberId) => {
    const result = await pool.query(
      `UPDATE referrals SET to_member_id=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *`,
      [newToMemberId, id]
    );
    return result.rows[0];
  }
};

module.exports = Referral;
