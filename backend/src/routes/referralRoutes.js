const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");
const referralController = require("../controllers/referral.controller");

router.post("/", authenticateToken, referralController.createReferral);
router.get("/", authenticateToken, referralController.getAllReferrals);
router.get("/chapter/:chapterId", authenticateToken, checkRole(["president", "admin"]), referralController.getChapterReferrals);
router.get("/report/member/:memberId", authenticateToken, referralController.getMemberReport);
router.get("/report/chapter/:chapterId", authenticateToken, checkRole(["president", "admin"]), referralController.getChapterReport);
router.get("/:id", authenticateToken, referralController.getReferralById);
router.put("/:id/status", authenticateToken, referralController.updateReferralStatus);
router.put("/:id/transfer", authenticateToken, referralController.transferReferral);
router.put("/:id", authenticateToken, referralController.updateReferral);
router.delete("/:id", authenticateToken, checkRole(["president", "admin"]), referralController.deleteReferral);

module.exports = router;

