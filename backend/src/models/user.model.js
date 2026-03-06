const pool = require("../config/db");

exports.findByEmail = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const result = await pool.query(
    "SELECT * FROM users WHERE LOWER(email) = $1",
    [normalizedEmail]
  );
  return result.rows[0];
};

exports.create = async (name, email, hashedPassword, role = "member") => {
  const normalizedEmail = email.trim().toLowerCase();
  const result = await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
    [name, normalizedEmail, hashedPassword, role]
  );
  return result.rows[0];
};

exports.getUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, name, email, business_name, contact_number, image, role
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

exports.updateUser = async (id, data) => {
  const { name, business_name, contact_number, image } = data;

  const result = await pool.query(
    `UPDATE users
     SET name=$1,
         business_name=$2,
         contact_number=$3,
         image=COALESCE($4, image)
     WHERE id=$5
     RETURNING id, name, email, business_name, contact_number, image`,
    [name, business_name, contact_number, image, id]
  );

  return result.rows[0];
};

