require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');

const app = express();
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected");
  app.listen(process.env.PORT || 5000, () => {
    console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
  });
})
.catch((err) => console.error("MongoDB connection error:", err));
