const userModel = require("../models/user.model");

// GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.getUserById(userId);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updated = await userModel.updateUser(userId, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE IMAGE
exports.updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const image = req.file.filename;
    const updated = await userModel.updateUser(userId, { image });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
