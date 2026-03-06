// Example: How to use authentication in your routes

const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================
router.get("/public", (req, res) => {
  res.json({ message: "This is public" });
});

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================
router.get("/profile", authenticateToken, (req, res) => {
  // req.user = { id: 1, role: "member" }
  res.json({ 
    message: "Your profile", 
    userId: req.user.id,
    role: req.user.role 
  });
});

// ============================================
// ROLE-BASED ROUTES
// ============================================

// Only ADMIN can access
router.post("/admin-action", 
  authenticateToken, 
  checkRole(["admin"]), 
  (req, res) => {
    res.json({ message: "Admin action performed" });
  }
);

// ADMIN or PRESIDENT can access
router.post("/leadership-action", 
  authenticateToken, 
  checkRole(["admin", "president"]), 
  (req, res) => {
    res.json({ message: "Leadership action performed" });
  }
);

// ALL authenticated users (admin, president, member)
router.get("/member-data", 
  authenticateToken, 
  checkRole(["admin", "president", "member"]), 
  (req, res) => {
    res.json({ message: "Member data", user: req.user });
  }
);

module.exports = router;
