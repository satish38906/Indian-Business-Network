const express = require("express");
const router = express.Router();
const leadershipController = require("../controllers/leadership.controller");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, leadershipController.getLeadership);

module.exports = router;