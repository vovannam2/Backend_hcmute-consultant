const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/common/NotificationController");
const authMiddleware = require("../middleware/authMiddleware");

// Lấy danh sách thông báo
router.get("/", authMiddleware(), NotificationController.getNotifications);

// Đánh dấu 1 thông báo đã đọc
router.put("/:id/read", authMiddleware(), NotificationController.markAsRead);

// Đánh dấu tất cả đã đọc
router.put("/read-all", authMiddleware(), NotificationController.markAllAsRead);

module.exports = router;
