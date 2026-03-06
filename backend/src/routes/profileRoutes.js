const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profile.controller");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// Get logged-in user profile
router.get("/", authMiddleware, profileController.getProfile);

// Update profile info
router.put("/", authMiddleware, profileController.updateProfile);

// Update profile image
router.put("/image", authMiddleware, upload.single("image"), profileController.updateProfileImage);

module.exports = router;
