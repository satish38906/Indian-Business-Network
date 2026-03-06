require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const chapterRoutes = require("./routes/chapterRoutes");
const meetingRoutes = require("./routes/meetingRoutes");
const referralRoutes = require("./routes/referralRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const memberRoutes = require("./routes/memberRoutes");
const leadershipRoutes = require("./routes/leadershipRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

/* =======================
   MIDDLEWARE
======================= */
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// ✅ Static folder for images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =======================
   ROUTES
======================= */
app.use("/api/auth", authRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/leadership", leadershipRoutes);
app.use("/api/users", userRoutes);

/* =======================
   HEALTH CHECK
======================= */
app.get("/", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ message: "Server & DB working", status: "healthy" });
  } catch (err) {
    console.error("Health check failed:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

/* =======================
   404 HANDLER
======================= */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* =======================
   GLOBAL ERROR HANDLER
======================= */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

/* =======================
   SERVER START
======================= */
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is busy, trying ${PORT + 1}...`);
    app.listen(PORT + 1, HOST, () => {
      console.log(`🚀 Server running on ${HOST}:${PORT + 1}`);
    });
  }
});
