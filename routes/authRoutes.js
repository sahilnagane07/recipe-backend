const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// 🔑 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found ❌" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password ❌" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      "secretkey",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful ✅",
      token,
      user
    });

  } catch (error) {
    res.status(500).json({
      message: "Login error ❌",
      error: error.message
    });
  }
});

  // 👤 GET USER BY ID
router.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found ❌"
      });
    }

    res.json({
      message: "User fetched successfully ✅",
      user
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching user ❌",
      error: error.message
    });
  }
});


// 📝 REGISTER
router.post("/user", async (req, res) => {
  try {
    const { name, email, password, profileImage } = req.body;

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists ❌" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      profileImage
    });

    await user.save();

    res.status(201).json({
      message: "User created successfully ✅",
      user
    });

  } catch (error) {
    res.status(500).json({
      message: "Error creating user ❌",
      error: error.message
    });
  }
});

module.exports = router;