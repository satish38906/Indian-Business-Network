const pool = require("../config/db");

exports.createMember = async (userId, chapterId, businessName, businessCategory, contact, image) => {
  const result = await pool.query(
    `INSERT INTO members (user_id, chapter_id, business_name, business_category, contact, image, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'active')
     RETURNING *`,
    [userId, chapterId, businessName, businessCategory, contact, image]
  );
  return result.rows[0];
};

exports.checkCategoryExists = async (chapterId, businessCategory, excludeMemberId = null) => {
  const query = excludeMemberId
    ? `SELECT * FROM members WHERE chapter_id = $1 AND business_category = $2 AND id != $3 AND status = 'active'`
    : `SELECT * FROM members WHERE chapter_id = $1 AND business_category = $2 AND status = 'active'`;
  const params = excludeMemberId ? [chapterId, businessCategory, excludeMemberId] : [chapterId, businessCategory];
  const result = await pool.query(query, params);
  return result.rows[0];
};

exports.getMembersByChapter = async (chapterId) => {
  const result = await pool.query(
    `SELECT m.*, u.name, u.email FROM members m
     JOIN users u ON m.user_id = u.id
     WHERE m.chapter_id = $1
     ORDER BY m.created_at DESC`,
    [chapterId]
  );
  return result.rows;
};

exports.getMemberById = async (id) => {
  const result = await pool.query(
    `SELECT m.*, u.name, u.email FROM members m
     JOIN users u ON m.user_id = u.id
     WHERE m.id = $1`,
    [id]
  );
  return result.rows[0];
};

exports.getMemberByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT m.*, u.name, u.email FROM members m
     JOIN users u ON m.user_id = u.id
     WHERE m.user_id = $1`,
    [userId]
  );
  return result.rows[0];
};

exports.updateMember = async (id, businessName, businessCategory, contact, status) => {
  const result = await pool.query(
    `UPDATE members
     SET business_name=$1, business_category=$2, contact=$3, status=$4, updated_at=CURRENT_TIMESTAMP
     WHERE id=$5
     RETURNING *`,
    [businessName, businessCategory, contact, status, id]
  );
  return result.rows[0];
};

exports.updateMemberImage = async (id, image) => {
  const result = await pool.query(
    `UPDATE members SET image = $1, updated_at=CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
    [image, id]
  );
  return result.rows[0];
};

exports.deleteMember = async (id) => {
  const result = await pool.query(
    `DELETE FROM members WHERE id=$1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

exports.getChapterPresidentId = async (chapterId) => {
  const result = await pool.query(
    `SELECT president_id FROM chapters WHERE id = $1`,
    [chapterId]
  );
  return result.rows[0]?.president_id;
};
