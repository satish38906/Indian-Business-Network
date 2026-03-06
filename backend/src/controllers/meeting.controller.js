const meetingModel = require("../models/meeting.model");

exports.createMeeting = async (req, res) => {
  try {
    const { chapter_id, title, meeting_date, location, description } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('Create meeting request:', { chapter_id, title, meeting_date, userId, userRole });

    if (!chapter_id || !title || !meeting_date) {
      return res.status(400).json({ message: "Chapter, title, and meeting date are required" });
    }

    const meeting = await meetingModel.create(chapter_id, title, meeting_date, location, description, userId);
    console.log('Meeting created successfully:', meeting.id);
    res.status(201).json({ message: "Meeting created successfully", meeting });
  } catch (err) {
    console.error('Create meeting error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllMeetings = async (req, res) => {
  try {
    const meetings = await meetingModel.getAll();
    res.json(meetings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMeetingById = async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await meetingModel.getById(id);
    
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    res.json(meeting);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { chapter_id, title, meeting_date, location, description } = req.body;

    const updated = await meetingModel.update(id, chapter_id, title, meeting_date, location, description);
    if (!updated) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    res.json({ message: "Meeting updated successfully", meeting: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await meetingModel.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    res.json({ message: "Meeting deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getChapterMeetings = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const meetings = await meetingModel.getByChapter(chapterId);
    res.json(meetings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.recordAttendance = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { member_id, status, notes } = req.body;

    if (!['present', 'late', 'absent'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const attendance = await meetingModel.recordAttendance(meetingId, member_id, status, notes);
    res.json({ message: "Attendance recorded", attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const attendance = await meetingModel.getAttendance(meetingId);
    res.json(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addVisitor = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { name, business_name, contact_phone, email, invited_by, notes } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ message: "Visitor name is required" });
    }

    const visitor = await meetingModel.addVisitor(meetingId, name, business_name, contact_phone, email, invited_by, notes);
    res.status(201).json({ message: "Visitor added", visitor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getVisitors = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const visitors = await meetingModel.getVisitors(meetingId);
    res.json(visitors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteVisitor = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await meetingModel.deleteVisitor(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res.json({ message: "Visitor deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
