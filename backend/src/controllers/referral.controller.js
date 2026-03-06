const referralModel = require("../models/referral.model");
const memberModel = require("../models/member.model");

exports.createReferral = async (req, res) => {
  try {
    const { to_member_id, chapter_id, meeting_id, business_name, contact_number, amount } = req.body;
    const userId = req.user.id;

    if (!to_member_id) {
      return res.status(400).json({ message: "Recipient member is required" });
    }

    const fromMember = await memberModel.getMemberByUserId(userId);
    if (!fromMember) {
      return res.status(404).json({ message: "Member profile not found" });
    }

    const finalBusinessName = business_name || 'Business Referral';
    const referral = await referralModel.create(fromMember.id, to_member_id, chapter_id, meeting_id, finalBusinessName, contact_number, amount);
    res.status(201).json({ message: "Referral created successfully", referral });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllReferrals = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('getAllReferrals called by userId:', userId, 'role:', userRole);

    if (userRole === "admin") {
      const referrals = await referralModel.getAll();
      console.log('Admin: returning all referrals:', referrals.length);
      return res.json(referrals);
    }

    const member = await memberModel.getMemberByUserId(userId);
    if (!member) {
      console.log('No member profile found for userId:', userId);
      return res.json([]);
    }

    console.log('Member found:', { memberId: member.id, userId: userId });
    const referrals = await referralModel.getByMember(member.id);
    console.log('Returning referrals for member:', referrals.length);
    console.log('Sample referral:', referrals[0]);
    res.json(referrals);
  } catch (err) {
    console.error('getAllReferrals error:', err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getReferralById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const referral = await referralModel.getById(id);
    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }

    if (userRole === "member" && referral.from_user_id !== userId && referral.to_user_id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(referral);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateReferralStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!['given', 'accepted', 'closed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const referral = await referralModel.getById(id);
    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }

    if (referral.to_user_id !== userId && req.user.role === "member") {
      return res.status(403).json({ message: "Only recipient can update status" });
    }

    const updated = await referralModel.updateStatus(id, status);
    res.json({ message: "Referral status updated", referral: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const { business_name, contact_number, amount, status } = req.body;

    const updated = await referralModel.update(id, business_name, contact_number, amount, status);
    if (!updated) {
      return res.status(404).json({ message: "Referral not found" });
    }

    res.json({ message: "Referral updated successfully", referral: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await referralModel.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Referral not found" });
    }

    res.json({ message: "Referral deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getChapterReferrals = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const referrals = await referralModel.getByChapter(chapterId);
    res.json(referrals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMemberReport = async (req, res) => {
  try {
    const { memberId } = req.params;
    const report = await referralModel.getMemberReport(memberId);
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getChapterReport = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const report = await referralModel.getChapterReport(chapterId);
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.transferReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_to_member_id } = req.body;
    const userId = req.user.id;

    if (!new_to_member_id) {
      return res.status(400).json({ message: "New recipient member ID is required" });
    }

    const referral = await referralModel.getById(id);
    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }

    const fromMember = await memberModel.getMemberByUserId(userId);
    if (!fromMember || referral.from_member_id !== fromMember.id) {
      return res.status(403).json({ message: "Only the referral giver can transfer it" });
    }

    const updated = await referralModel.transfer(id, new_to_member_id);
    res.json({ message: "Referral transferred successfully", referral: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

