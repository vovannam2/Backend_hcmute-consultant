// src/index.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Protected route test
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: `Hello user ${req.user.id}, you are authenticated!` });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Backend is running!" });
});

// Connect MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));
