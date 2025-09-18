// src/index.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authMiddleware = require("./middleware/authMiddleware");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser"); // nếu muốn parse form urlencoded
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const questionRoutes = require("./routes/questionRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

// Middlewares
app.use(cors());               // Cho phép frontend gọi API
app.use(express.json());       // Parse body JSON
app.use(bodyParser.urlencoded({ extended: true })); // parse form (nếu cần)
app.use(morgan("dev"));        // Log request ra console

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api", messageRoutes);


// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend running..." });
});
// Kết nối DB và chạy server
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
});