const Notification = require("../../models/Notification");

exports.getNotifications = async (userId) => {
  return await Notification.find({ receiverId: userId })
    .sort({ createdAt: -1 })
    .populate("senderId", "username avatarUrl")
    .populate("receiverId", "username");
};

exports.markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, receiverId: userId },
    { status: "READ" },
    { new: true }
  );
  if (!notification) throw new Error("Không tìm thấy thông báo hoặc không có quyền");
  return notification;
};

exports.markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { receiverId: userId, status: "UNREAD" },
    { status: "READ" }
  );
  return result.modifiedCount;
};
