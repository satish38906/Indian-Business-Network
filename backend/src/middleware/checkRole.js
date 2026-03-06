// middleware/checkRole.js

module.exports = function (allowedRoles) {
  return (req, res, next) => {
    try {
      // Check login
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized. Please login." });
      }

      // Role check
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: "Access denied. You do not have permission."
        });
      }

      next(); // sab sahi hai
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };
};
