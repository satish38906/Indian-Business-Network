const express = require("express");
const router = express.Router();
const memberController = require("../controllers/member.controller");
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");
const upload = require("../middleware/upload");
const { validateMemberData, validateMemberStatus } = require("../middleware/validateMember");

// Get my own member data (Any authenticated user) - MUST BE FIRST
router.get(
  "/me/data",
  authMiddleware,
  memberController.getMyMemberData
);

// Get specific member by ID (President/Admin or own data)
router.get(
  "/detail/:id",
  authMiddleware,
  memberController.getMemberById
);

// Add member (President/Vice President/Secretary only)
router.post(
  "/:chapterId",
  authMiddleware,
  upload.single("image"),
  validateMemberData,
  memberController.addMember
);

// Get all members in a chapter (All authenticated users)
router.get(
  "/:chapterId",
  authMiddleware,
  memberController.getMembers
);

// Update member (President/Admin or own data)
router.put(
  "/:id",
  authMiddleware,
  validateMemberStatus,
  memberController.updateMember
);

// Update member image (President/Admin or own data)
router.put(
  "/:id/image",
  authMiddleware,
  upload.single("image"),
  memberController.updateMemberImage
);

// Delete member (President/Admin only)
router.delete(
  "/:id",
  authMiddleware,
  checkRole(["president", "admin"]),
  memberController.deleteMember
);

module.exports = router;
