const pool = require("../config/db");


// ✅ Create Chapter
exports.createChapter = async (req, res) => {
  try {
    const { name, location, time, members } = req.body;
    const userId = req.user.id;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Chapter name is required" });
    }

    const result = await pool.query(
      "INSERT INTO chapters (name, location, time, members, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name.trim(), location?.trim() || null, time?.trim() || null, members || 0, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create chapter error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


// ✅ Get All Chapters by User
exports.getAllChapters = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT * FROM chapters WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get chapters error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


// ✅ Get Chapter By ID
exports.getChapterById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid chapter ID" });
    }

    const result = await pool.query(
      "SELECT * FROM chapters WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get chapter error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


// ✅ Update Chapter
exports.updateChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, time, members } = req.body;
    const userId = req.user.id;

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid chapter ID" });
    }

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Chapter name is required" });
    }

    const result = await pool.query(
      "UPDATE chapters SET name=$1, location=$2, time=$3, members=$4 WHERE id=$5 AND user_id=$6 RETURNING *",
      [name.trim(), location?.trim() || null, time?.trim() || null, members || 0, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update chapter error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


// ✅ Delete Chapter
exports.deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid chapter ID" });
    }

    const result = await pool.query(
      "DELETE FROM chapters WHERE id=$1 AND user_id=$2 RETURNING *",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    res.json({ message: "Chapter deleted successfully" });
  } catch (err) {
    console.error("Delete chapter error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
