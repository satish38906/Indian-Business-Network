const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const userController = require("../controllers/user.controller");

// 🔐 Protected Profile Route
router.get("/profile", authMiddleware, userController.getProfile);

// 🗑️ Delete User (Admin/President only)
router.delete("/:id", authMiddleware, userController.deleteUser);

module.exports = router;
