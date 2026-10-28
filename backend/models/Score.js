const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  gamesPlayed: {
    type: Number,
    default: 1,
  },
  totalScore: {
    type: Number,
    default: 0,
  },
  perfectGames: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Score", scoreSchema);
