const express = require("express");
const router = express.Router();
const messageController = require("../controllers/actor/messageController");
const authMiddleware = require("../middleware/authMiddleware");

// Lấy tin nhắn trong cuộc trò chuyện
router.get(
  "/conversations/:id/messages",
  authMiddleware(),
  messageController.getMessages
);

module.exports = router;
