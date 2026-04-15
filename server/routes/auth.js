const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// ---------- SIGNUP ----------
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.json({
      message: "Signup successful",
      user: {
        id: user._id,
        email: user.email,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed" });
  }
});


// ---------- LOGIN ----------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});


// ---------- GET ALL USERS (IMPORTANT FOR CHAT) ----------
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("name email");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// UPDATE PROFILE
router.post("/update-profile", async (req, res) => {
  try {
    const { email, bio, avatar } = req.body;

    const user = await User.findOneAndUpdate(
      { email },
      { bio, avatar },
      { new: true }
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Profile update failed" });
  }
});
module.exports = router;