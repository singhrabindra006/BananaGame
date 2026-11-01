const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");

/**
 * Express server connected to MongoDB.
 * Handles authentication, profiles, and score storage for Banana Quiz.
 */
const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "BananaGame Backend API",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
  });
});

app.use("/api/auth", authRoutes);

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
