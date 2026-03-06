const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("neon")
    ? { rejectUnauthorized: false }
    : false,
});

pool.on("connect", () => {
  console.log("✅ Database Connected");
});

pool.on("error", (err) => {
  console.error("❌ Database error:", err);
});

module.exports = pool;