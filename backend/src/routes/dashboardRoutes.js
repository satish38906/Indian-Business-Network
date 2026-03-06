const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const authenticateToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");

router.get("/member", authenticateToken, dashboardController.getMemberDashboard);
router.get("/president", authenticateToken, checkRole(["president", "admin"]), dashboardController.getPresidentDashboard);

module.exports = router;
