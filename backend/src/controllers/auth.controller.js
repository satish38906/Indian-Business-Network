// auth.controller.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const pool = require("../config/db");

// ================= SIGNUP =================
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('Signup attempt:', { name, email });

    // 1️⃣ Check existing user
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Create user (default role = member)
    const newUser = await userModel.create(
      name,
      email,
      hashedPassword
    );
    console.log('User created:', { id: newUser.id, email: newUser.email });

    // 4️⃣ Verify user was created
    const verifyUser = await userModel.findByEmail(email);
    console.log('Verification check:', verifyUser ? 'User found' : 'User NOT found');

    // 5️⃣ Auto-create member profile
    try {
      const chapter = await pool.query('SELECT id FROM chapters LIMIT 1');
      if (chapter.rows[0]) {
        const timestamp = Date.now();
        await pool.query(
          `INSERT INTO members (user_id, chapter_id, business_name, business_category, status)
           VALUES ($1, $2, $3, $4, 'active')`,
          [newUser.id, chapter.rows[0].id, `${name}'s Business`, `Category-${timestamp}`]
        );
      }
    } catch (err) {
      console.log('Member profile creation skipped:', err.message);
    }

    res.status(201).json({
      message: "Signup successful",
      user: newUser,
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, passwordProvided: !!password });
    console.log('Request body keys:', Object.keys(req.body));

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await userModel.findByEmail(email);
    console.log('User lookup result:', user ? { id: user.id, email: user.email } : 'NOT FOUND');
    
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Server error" });
  }
};
