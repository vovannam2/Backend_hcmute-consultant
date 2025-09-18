const express = require("express");
const router = express.Router();
const { uploadChat } = require("../config/cloudinary");
const messageController = require("../controllers/actor/messageController");
const authMiddleware = require("../middleware/authMiddleware");

// Middleware: chỉ cho phép upload 1 file (image hoặc file)
const uploadSingleFile = (req, res, next) => {
  uploadChat.fields([
    { name: "image", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });

    const image = req.files?.image;
    const file = req.files?.file;

    if ((image && file) || (!image && !file)) {
      return res
        .status(400)
        .json({ error: "Chỉ được upload 1 trong 2: image hoặc file" });
    }

    next();
  });
};

// Lấy tin nhắn trong cuộc trò chuyện
router.get(
  "/conversations/:id/messages",
  authMiddleware(),
  messageController.getMessages
);

// Gửi tin nhắn
router.post(
  "/conversations/:id/messages",
  authMiddleware(),
  uploadSingleFile,
  messageController.sendMessage
);

// Chỉnh sửa tin nhắn
router.put(
  "/messages/:id",
  authMiddleware(),
  messageController.updateMessage
);

// Thu hồi tin nhắn
router.delete(
  "/messages/:id",
  authMiddleware(),
  messageController.deleteMessage
);

module.exports = router;
