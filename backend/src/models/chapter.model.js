const pool = require("../config/db");

const Chapter = {

  // ✅ Create Chapter
  create: async (name, city, description) => {
    const result = await pool.query(
      `INSERT INTO chapters (name, city, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, city, description]
    );
    return result.rows[0];
  },

  // ✅ Get All Chapters
  getAll: async () => {
    const result = await pool.query(
      "SELECT * FROM chapters ORDER BY id ASC"
    );
    return result.rows;
  },

  // ✅ Get Chapter By ID
  getById: async (id) => {
    const result = await pool.query(
      "SELECT * FROM chapters WHERE id = $1",
      [id]
    );
    return result.rows[0];
  },

  // ✅ Update Chapter
  update: async (id, name, city, description) => {
    const result = await pool.query(
      `UPDATE chapters
       SET name = $1, city = $2, description = $3
       WHERE id = $4
       RETURNING *`,
      [name, city, description, id]
    );
    return result.rows[0];
  },

  // ✅ Delete Chapter
  delete: async (id) => {
    const result = await pool.query(
      "DELETE FROM chapters WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }

};

module.exports = Chapter;
