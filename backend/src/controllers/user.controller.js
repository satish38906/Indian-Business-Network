const pool = require("../config/db");

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;

    // Only admin or president can delete users
    if (requestingUser.role !== 'admin' && requestingUser.role !== 'president') {
      return res.status(403).json({ message: "Access denied" });
    }

    // Prevent self-deletion
    if (requestingUser.id === parseInt(id)) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id, name, email",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully", user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getProfile,
  deleteUser,
};
