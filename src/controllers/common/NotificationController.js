// src/controllers/common/NotificationController.js
const notificationService = require("../../service/common/NotificationService");
const { DataResponse, ExceptionResponse } = require("../../utils/response");

exports.getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 20; // Tăng từ 10 lên 50
    
    const notifications = await notificationService.getNotifications(req.user.id, page, size);
    return res.status(200).json(new DataResponse(notifications, "Lấy danh sách thông báo thành công", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(
      req.query.id,
      req.user.id   
    );
    return res.status(200).json(new DataResponse(notification, "Đã đánh dấu đã đọc", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const count = await notificationService.markAllAsRead(req.user.id);
    return res.status(200).json(new DataResponse({ count }, `Đã đánh dấu ${count} thông báo đã đọc`, 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

exports.getNotificationDetail = async (req, res) => {
  try {
    const notification = await notificationService.getNotificationDetail(req.query.id, req.user.id);
    return res.status(200).json(new DataResponse(notification, "Lấy chi tiết thông báo thành công", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

exports.deleteAllNotifications = async (req, res) => {
  try {
    const count = await notificationService.deleteAllNotifications(req.user.id);
    return res.status(200).json(new DataResponse({ count }, `Đã xóa ${count} thông báo`, 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await notificationService.deleteNotification(req.query.id, req.user.id);
    return res.status(200).json(new DataResponse(notification, "Đã xóa thông báo", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    return res.status(200).json(new DataResponse({ count }, "Lấy số thông báo chưa đọc thành công", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};