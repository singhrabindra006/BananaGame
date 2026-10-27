const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const router = express.Router();
const User = require("../models/User");
const Score = require("../models/Score");

// In-memory token store (maps token -> username)
const sessions = {};

/**
 * REGISTER - Creates a new user document in MongoDB.
 * Password is hashed with bcrypt before saving.
 */
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

/**
 * LOGIN - Verifies credentials against MongoDB and issues
 * a token representing the user's virtual identity.
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = crypto.randomBytes(24).toString("hex");
    sessions[token] = username;

    res.json({ token, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

/**
 * SAVE SCORE - Updates or creates a score document for a user.
 */
router.post("/score", async (req, res) => {
  const { username, score } = req.body;

  try {
    const existing = await Score.findOne({ username });

    if (existing) {
      if (score > existing.score) {
        existing.score = score;
        existing.updatedAt = Date.now();
        await existing.save();
      }
    } else {
      await Score.create({ username, score });
    }

    res.json({ message: "Score saved" });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

/**
 * GET SCORES - Retrieves all scores for the leaderboard,
 * sorted highest first.
 */
router.get("/scores", async (req, res) => {
  try {
    const scores = await Score.find().sort({ score: -1 });
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

module.exports = router;
