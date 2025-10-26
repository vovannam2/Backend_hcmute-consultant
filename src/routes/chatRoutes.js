const express = require("express");
const router = express.Router();
const chatController = require("../controllers/actor/chatController");
const authMiddleware = require("../middleware/authMiddleware");

// Lấy lịch sử tin nhắn
router.get("/history", authMiddleware(), chatController.getChatHistory);

// Cập nhật tin nhắn
router.post("/update-message", authMiddleware(), chatController.updateMessage);

// Thu hồi tin nhắn (chỉ mình)
router.post("/recall-message-self", authMiddleware(), chatController.recallMessageSelf);

// Thu hồi tin nhắn (cho tất cả)
router.post("/recall-message-all", authMiddleware(), chatController.recallMessageAll);

module.exports = router;
