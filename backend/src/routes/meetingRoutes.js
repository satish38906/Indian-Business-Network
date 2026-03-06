const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");
const meetingController = require("../controllers/meeting.controller");

router.post("/", authenticateToken, checkRole(["president", "admin"]), meetingController.createMeeting);
router.get("/", authenticateToken, meetingController.getAllMeetings);
router.get("/chapter/:chapterId", authenticateToken, meetingController.getChapterMeetings);
router.get("/:id", authenticateToken, meetingController.getMeetingById);
router.put("/:id", authenticateToken, checkRole(["president", "admin"]), meetingController.updateMeeting);
router.delete("/:id", authenticateToken, checkRole(["president", "admin"]), meetingController.deleteMeeting);

router.post("/:meetingId/attendance", authenticateToken, checkRole(["president", "admin"]), meetingController.recordAttendance);
router.get("/:meetingId/attendance", authenticateToken, meetingController.getAttendance);

router.post("/:meetingId/visitors", authenticateToken, meetingController.addVisitor);
router.get("/:meetingId/visitors", authenticateToken, meetingController.getVisitors);
router.delete("/visitors/:id", authenticateToken, checkRole(["president", "admin"]), meetingController.deleteVisitor);

module.exports = router;
