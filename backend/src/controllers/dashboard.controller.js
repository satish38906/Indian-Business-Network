const Dashboard = require("../models/dashboard.model");

exports.getMemberDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Fetching dashboard for userId:", userId);
    
    const data = await Dashboard.getMemberDashboard(userId);

    if (!data) {
      console.log("No member profile found, returning empty data");
      return res.json({
        member: null,
        referrals: {
          given_count: "0",
          received_count: "0",
          given_value: "0",
          received_value: "0",
          closed_count: "0",
          closed_value: "0"
        },
        attendance: {
          total_meetings: "0",
          present_count: "0",
          late_count: "0",
          absent_count: "0"
        },
        recentReferrals: []
      });
    }

    res.json(data);
  } catch (err) {
    console.error("Dashboard error:", err.message);
    console.error("Stack:", err.stack);
    
    res.json({
      member: null,
      referrals: {
        given_count: "0",
        received_count: "0",
        given_value: "0",
        received_value: "0",
        closed_count: "0",
        closed_value: "0"
      },
      attendance: {
        total_meetings: "0",
        present_count: "0",
        late_count: "0",
        absent_count: "0"
      },
      recentReferrals: []
    });
  }
};

exports.getPresidentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== "president" && userRole !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const data = await Dashboard.getPresidentDashboard(userId);

    if (!data) {
      return res.status(404).json({ message: "Chapter data not found" });
    }

    res.json(data);
  } catch (err) {
    console.error("President dashboard error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
