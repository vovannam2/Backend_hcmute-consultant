const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/common/NotificationController");
const authMiddleware = require("../middleware/authMiddleware");

// Lấy danh sách thông báo
router.get("/", authMiddleware(), NotificationController.getNotifications);

// Lấy số thông báo chưa đọc
router.get("/unread-count", authMiddleware(), NotificationController.getUnreadCount);

// Đánh dấu 1 thông báo đã đọc
router.post("/read", authMiddleware(), NotificationController.markAsRead);

// Đánh dấu tất cả đã đọc
router.post("/read-all", authMiddleware(), NotificationController.markAllAsRead);

// Lấy chi tiết thông báo
router.get("/detail", authMiddleware(), NotificationController.getNotificationDetail);

// Xóa tất cả thông báo
router.post("/delete-all", authMiddleware(), NotificationController.deleteAllNotifications);

// Xóa 1 thông báo
router.post("/delete", authMiddleware(), NotificationController.deleteNotification);

module.exports = router;
