const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const router = express.Router();
const User = require("../models/User");
const Score = require("../models/Score");

// In-memory token cache (maps token -> username) for fast lookups
const sessions = {};

/**
 * Authentication Middleware:
 * Validates the session token from Authorization header (Virtual Identity).
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.headers["x-auth-token"];

    if (!token) {
      return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    // Check fast in-memory cache first
    if (sessions[token]) {
      req.user = { username: sessions[token], token };
      return next();
    }

    // Check persistent database session
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Session invalid or expired, please login again" });
    }

    sessions[token] = user.username;
    req.user = { username: user.username, token };
    next();
  } catch (err) {
    res.status(500).json({ message: "Auth validation error: " + err.message });
  }
};

/**
 * REGISTER - Creates a new user document in MongoDB.
 * Password is encrypted with bcrypt.
 */
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const cleanUsername = username.trim();
  if (cleanUsername.length < 3) {
    return res.status(400).json({ message: "Username must be at least 3 characters long" });
  }

  if (cleanUsername.length > 20) {
    return res.status(400).json({ message: "Username cannot exceed 20 characters" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  try {
    // Case-insensitive uniqueness check
    const existingUser = await User.findOne({
      username: { $regex: new RegExp(`^${cleanUsername}$`, "i") },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists. Please choose another." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username: cleanUsername, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully! You can now log in." });
  } catch (err) {
    res.status(500).json({ message: "Registration failed: " + err.message });
  }
});

/**
 * LOGIN - Verifies credentials and generates a secure session token.
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const cleanUsername = username.trim();

  try {
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${cleanUsername}$`, "i") },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate token representing the user's virtual identity
    const token = crypto.randomBytes(32).toString("hex");
    user.token = token;
    await user.save();

    sessions[token] = user.username;

    res.json({
      token,
      user: {
        username: user.username,
      },
      message: "Login successful",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error during login: " + err.message });
  }
});

/**
 * GET CURRENT USER (ME) - Verifies token and returns profile details
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const scoreRecord = await Score.findOne({ username: req.user.username });
    res.json({
      username: req.user.username,
      highScore: scoreRecord ? scoreRecord.score : 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

/**
 * LOGOUT - Revokes session token
 */
router.post("/logout", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.body?.token;

    if (token) {
      delete sessions[token];
      await User.updateOne({ token }, { $set: { token: null } });
    }

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Logout error: " + err.message });
  }
});

/**
 * SAVE SCORE - Updates or creates a score document for a user.
 * Authenticated via token or fallback body username.
 * Tracks high score, games played, total points, and perfect games.
 */
router.post("/score", async (req, res) => {
  let targetUsername = req.body.username;
  const scoreVal = Number(req.body.score);

  if (isNaN(scoreVal) || scoreVal < 0) {
    return res.status(400).json({ message: "Invalid score value" });
  }

  // If auth token provided, verify identity
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (sessions[token]) {
      targetUsername = sessions[token];
    } else {
      const user = await User.findOne({ token });
      if (user) {
        sessions[token] = user.username;
        targetUsername = user.username;
      }
    }
  }

  if (!targetUsername) {
    return res.status(400).json({ message: "Username required to save score" });
  }

  try {
    let existing = await Score.findOne({ username: targetUsername });

    if (existing) {
      existing.gamesPlayed = (existing.gamesPlayed || 0) + 1;
      existing.totalScore = (existing.totalScore || 0) + scoreVal;
      if (scoreVal === 10) {
        existing.perfectGames = (existing.perfectGames || 0) + 1;
      }
      if (scoreVal > existing.score) {
        existing.score = scoreVal;
      }
      existing.updatedAt = Date.now();
      await existing.save();
    } else {
      existing = await Score.create({
        username: targetUsername,
        score: scoreVal,
        gamesPlayed: 1,
        totalScore: scoreVal,
        perfectGames: scoreVal === 10 ? 1 : 0,
        updatedAt: Date.now(),
      });
    }

    res.json({
      message: "Score saved successfully",
      scoreRecord: existing,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error saving score: " + err.message });
  }
});

/**
 * GET SCORES - Retrieves leaderboard, sorted and with global statistics.
 */
router.get("/scores", async (req, res) => {
  try {
    const { sortBy = "score", limit = 100 } = req.query;

    let sortQuery = { score: -1, updatedAt: 1 };
    if (sortBy === "games") {
      sortQuery = { gamesPlayed: -1, score: -1 };
    } else if (sortBy === "recent") {
      sortQuery = { updatedAt: -1 };
    } else if (sortBy === "perfect") {
      sortQuery = { perfectGames: -1, score: -1 };
    }

    const scores = await Score.find().sort(sortQuery).limit(Number(limit));

    // Global leaderboard stats
    const totalPlayers = await Score.countDocuments();
    const statsAgg = await Score.aggregate([
      {
        $group: {
          _id: null,
          totalGames: { $sum: "$gamesPlayed" },
          highestScore: { $max: "$score" },
          totalPoints: { $sum: "$totalScore" },
          perfectCount: { $sum: "$perfectGames" },
        },
      },
    ]);

    const stats = {
      totalPlayers,
      totalGames: statsAgg[0]?.totalGames || 0,
      highestScore: statsAgg[0]?.highestScore || 0,
      totalPoints: statsAgg[0]?.totalPoints || 0,
      perfectCount: statsAgg[0]?.perfectCount || 0,
      leader: scores[0]?.username || null,
    };

    res.json({ scores, stats });
  } catch (err) {
    res.status(500).json({ message: "Server error fetching leaderboard: " + err.message });
  }
});

module.exports = router;
