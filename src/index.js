import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// route test
app.get("/api/health", (req, res) => {
  res.json({ message: "Backend is running!" });
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
});
