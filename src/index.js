require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const questionRoutes = require("./routes/questionRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/NotificationRoutes");
const managerRoutes = require("./routes/managerRoutes");

// Socket handlers
const userSocket = require("./socket/userSocket");
const messageSocket = require("./socket/messageSocket");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // chỉnh lại cho đúng domain frontend
    methods: ["GET", "POST"],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api", messageRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend running..." });
});

// Socket.io
io.on("connection", (socket) => {
  userSocket(io, socket);
  messageSocket(io, socket);
});

// Chạy server
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
});
