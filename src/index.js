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
const userQuestionRoutes = require("./routes/userQuestionRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/NotificationRoutes");
const managerRoutes = require("./routes/managerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const likeRoutes = require("./routes/likeRoutes");
const forwardQuestionRoutes = require("./routes/forwardQuestionRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const consultationScheduleRoutes = require("./routes/consultationScheduleRoutes");

// Socket handlers
const userSocket = require("./socket/userSocket");
const messageSocket = require("./socket/messageSocket");
const notificationSocket = require("./socket/notificationSocket");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Socket middleware
const socketMiddleware = require("./middleware/socketMiddleware");
const socketAuthMiddleware = require("./middleware/socketAuthMiddleware");

// Socket authentication middleware - cho phép kết nối có hoặc không có token
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  // Nếu không có token, cho phép kết nối nhưng không có user info
  if (!token) {
    socket.user = null;
    socket.authenticated = false;
    return next();
  }
  
  // Có token thì xác thực
  return socketAuthMiddleware(io)(socket, next);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/user/question", socketMiddleware(io), userQuestionRoutes);
app.use("/api/questions", socketMiddleware(io), questionRoutes);
app.use("/api", conversationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/forward", socketMiddleware(io), forwardQuestionRoutes);
app.use("/api", departmentRoutes);
app.use("/api", messageRoutes);
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/post", postRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/like", likeRoutes);
app.use("/api/export", require("./routes/exportRoutes"));
app.use("/api", consultationScheduleRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend running..." });
});

// Socket.io
io.on("connection", (socket) => {
  userSocket(io, socket);
  messageSocket(io, socket);
  notificationSocket(io, socket);
});

// Chạy server
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ MongoDB connected`);
  });
});
