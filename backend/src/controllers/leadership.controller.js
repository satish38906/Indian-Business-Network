const pool = require("../config/db");

exports.getLeadership = async (req, res) => {
  try {
    const leadership = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, m.image,
             m.business_name, m.business_category, m.contact
      FROM users u
      LEFT JOIN members m ON u.id = m.user_id
      WHERE u.role IN ('president', 'vice_president', 'secretary')
      ORDER BY 
        CASE u.role 
          WHEN 'president' THEN 1
          WHEN 'vice_president' THEN 2
          WHEN 'secretary' THEN 3
        END
    `);

    res.json(leadership.rows);
  } catch (err) {
    console.error("Leadership fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};