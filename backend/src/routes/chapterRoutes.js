const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const chapterController = require("../controllers/chapter.controller");

router.post("/", authenticateToken, chapterController.createChapter);
router.get("/", authenticateToken, chapterController.getAllChapters);
router.get("/:id", authenticateToken, chapterController.getChapterById);
router.put("/:id", authenticateToken, chapterController.updateChapter);
router.delete("/:id", authenticateToken, chapterController.deleteChapter);

module.exports = router;
