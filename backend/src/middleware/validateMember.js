const validateMemberData = (req, res, next) => {
  const { business_name, business_category } = req.body;

  if (!business_name || business_name.trim().length === 0) {
    return res.status(400).json({ message: "Business name is required" });
  }

  if (!business_category || business_category.trim().length === 0) {
    return res.status(400).json({ message: "Business category is required" });
  }

  if (business_name.length > 255) {
    return res.status(400).json({ message: "Business name too long (max 255 characters)" });
  }

  if (business_category.length > 100) {
    return res.status(400).json({ message: "Business category too long (max 100 characters)" });
  }

  next();
};

const validateMemberStatus = (req, res, next) => {
  const { status } = req.body;

  if (status && !["active", "inactive"].includes(status)) {
    return res.status(400).json({ message: "Status must be 'active' or 'inactive'" });
  }

  next();
};

module.exports = { validateMemberData, validateMemberStatus };
