const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
  // 1️⃣ Header se token lete hain
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer token"

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  // 2️⃣ Token verify
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // id aur payload request me add ho gaya
    next(); // next middleware/route call
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = authenticateToken;
