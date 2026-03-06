const memberModel = require("../models/member.model");
const pool = require("../config/db");

exports.addMember = async (req, res) => {
  try {
    const { business_name, business_category, contact } = req.body;
    const { chapterId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only president, vice_president, and secretary can add members
    if (!['president', 'vice_president', 'secretary'].includes(userRole)) {
      return res.status(403).json({ message: "Access denied. Only President, Vice President, and Secretary can add members" });
    }

    if (!business_name || !business_category) {
      return res.status(400).json({ message: "Business name and category are required" });
    }

    // Check if category already exists in chapter
    const existing = await memberModel.checkCategoryExists(chapterId, business_category);
    if (existing) {
      return res.status(400).json({ message: "Business category already exists in this chapter" });
    }

    const image = req.file ? `/uploads/profile/${req.file.filename}` : null;
    const member = await memberModel.createMember(userId, chapterId, business_name, business_category, contact, image);

    res.status(201).json({ message: "Member added successfully", member });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMembers = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const members = await memberModel.getMembersByChapter(chapterId);
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const member = await memberModel.getMemberById(id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Data isolation: members can only see their own data
    if (userRole === "member" && member.user_id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyMemberData = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Fetching member profile for userId:", userId);
    
    let member = await memberModel.getMemberByUserId(userId);
    
    if (!member) {
      console.log("No member profile found, creating default profile for userId:", userId);
      
      // Auto-create member profile with default data
      try {
        const userQuery = await pool.query('SELECT name, email, role FROM users WHERE id = $1', [userId]);
        const user = userQuery.rows[0];
        
        if (user && user.role === 'member') {
          const chapterQuery = await pool.query('SELECT id FROM chapters LIMIT 1');
          const chapterId = chapterQuery.rows[0]?.id || 1;
          
          const timestamp = Date.now();
          const newMember = await pool.query(
            `INSERT INTO members (user_id, chapter_id, business_name, business_category, status)
             VALUES ($1, $2, $3, $4, 'active') RETURNING *`,
            [userId, chapterId, `${user.name}'s Business`, `Category-${timestamp}`]
          );
          
          member = {
            ...newMember.rows[0],
            name: user.name,
            email: user.email,
            role: user.role
          };
        }
      } catch (createErr) {
        console.log("Failed to create member profile:", createErr.message);
      }
    }
    
    // Return default data if still no member profile
    if (!member) {
      const userQuery = await pool.query('SELECT name, email, role FROM users WHERE id = $1', [userId]);
      const user = userQuery.rows[0];
      
      return res.json({
        id: null,
        name: user?.name || 'User',
        email: user?.email || '',
        role: user?.role || 'member',
        business_name: 'Complete your profile',
        business_category: 'Not specified',
        contact: null,
        image: null,
        status: 'incomplete'
      });
    }

    console.log("Member profile found:", member.business_name);
    res.json(member);
  } catch (err) {
    console.error("Member profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { business_name, business_category, contact, status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const member = await memberModel.getMemberById(id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Data isolation: members can only update their own data
    if (userRole === "member" && member.user_id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check category uniqueness if category is being changed
    if (business_category && business_category !== member.business_category) {
      const existing = await memberModel.checkCategoryExists(member.chapter_id, business_category, id);
      if (existing) {
        return res.status(400).json({ message: "Business category already exists in this chapter" });
      }
    }

    const updated = await memberModel.updateMember(
      id,
      business_name || member.business_name,
      business_category || member.business_category,
      contact || member.contact,
      status || member.status
    );

    res.json({ message: "Member updated successfully", member: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateMemberImage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const member = await memberModel.getMemberById(id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Data isolation
    if (userRole === "member" && member.user_id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image provided" });
    }

    const image = `/uploads/profile/${req.file.filename}`;
    const updated = await memberModel.updateMemberImage(id, image);

    res.json({ message: "Image updated successfully", member: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await memberModel.deleteMember(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json({ message: "Member deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
