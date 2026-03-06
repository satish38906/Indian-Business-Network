const pool = require("../config/db");

const Meeting = {
  create: async (chapterId, title, meetingDate, location, description, createdBy) => {
    const result = await pool.query(
      `INSERT INTO meetings (chapter_id, title, meeting_date, location, description, created_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [chapterId, title, meetingDate, location, description, createdBy]
    );
    return result.rows[0];
  },

  getAll: async () => {
    const result = await pool.query(
      `SELECT m.*, c.name AS chapter_name FROM meetings m
       LEFT JOIN chapters c ON m.chapter_id = c.id
       ORDER BY meeting_date DESC`
    );
    return result.rows;
  },

  getById: async (id) => {
    const result = await pool.query(
      `SELECT m.*, c.name AS chapter_name FROM meetings m
       LEFT JOIN chapters c ON m.chapter_id = c.id
       WHERE m.id=$1`,
      [id]
    );
    return result.rows[0];
  },

  update: async (id, chapterId, title, meetingDate, location, description) => {
    const result = await pool.query(
      `UPDATE meetings SET chapter_id=$1, title=$2, meeting_date=$3, location=$4, description=$5 WHERE id=$6 RETURNING *`,
      [chapterId, title, meetingDate, location, description, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await pool.query("DELETE FROM meetings WHERE id=$1 RETURNING *", [id]);
    return result.rows[0];
  },

  getByChapter: async (chapterId) => {
    const result = await pool.query(
      `SELECT * FROM meetings WHERE chapter_id=$1 ORDER BY meeting_date DESC`,
      [chapterId]
    );
    return result.rows;
  },

  recordAttendance: async (meetingId, memberId, status, notes) => {
    const result = await pool.query(
      `INSERT INTO attendance (meeting_id, member_id, status, notes)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (meeting_id, member_id) DO UPDATE SET status=$3, notes=$4
       RETURNING *`,
      [meetingId, memberId, status, notes]
    );
    return result.rows[0];
  },

  getAttendance: async (meetingId) => {
    const result = await pool.query(
      `SELECT a.*, m.user_id, u.name AS member_name, mem.business_name
       FROM attendance a
       LEFT JOIN members m ON a.member_id = m.id
       LEFT JOIN users u ON m.user_id = u.id
       LEFT JOIN members mem ON a.member_id = mem.id
       WHERE a.meeting_id=$1`,
      [meetingId]
    );
    return result.rows;
  },

  addVisitor: async (meetingId, name, businessName, contactPhone, email, invitedBy, notes) => {
    const result = await pool.query(
      `INSERT INTO visitors (meeting_id, name, business_name, contact_phone, email, invited_by, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [meetingId, name, businessName, contactPhone, email, invitedBy, notes]
    );
    return result.rows[0];
  },

  getVisitors: async (meetingId) => {
    const result = await pool.query(
      `SELECT v.*, u.name AS invited_by_name FROM visitors v
       LEFT JOIN members m ON v.invited_by = m.id
       LEFT JOIN users u ON m.user_id = u.id
       WHERE v.meeting_id=$1`,
      [meetingId]
    );
    return result.rows;
  },

  deleteVisitor: async (id) => {
    const result = await pool.query("DELETE FROM visitors WHERE id=$1 RETURNING *", [id]);
    return result.rows[0];
  }
};

module.exports = Meeting;
