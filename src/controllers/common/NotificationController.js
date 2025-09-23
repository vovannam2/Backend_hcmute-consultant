// src/controllers/common/NotificationController.js
const notificationService = require("../../service/common/NotificationService");

const makeResponse = (status, message, data = null) => ({
  status,
  message,
  data,
});

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getNotifications(req.user.id);
    res.json(makeResponse("success", "Lấy danh sách thông báo thành công", notifications));
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user.id   
    );
    res.json(makeResponse("success", "Đã đánh dấu đã đọc", notification));
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
  }
};


exports.markAllAsRead = async (req, res) => {
  try {
    const count = await notificationService.markAllAsRead(req.user.id);
    res.json(makeResponse("success", `Đã đánh dấu ${count} thông báo đã đọc`));
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
  }
};
