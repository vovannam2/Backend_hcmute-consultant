const Notification = require("../../models/Notification");

exports.getNotifications = async (userId, page = 0, size = 10) => {
  const skip = page * size;
  
  const notifications = await Notification.find({ receiverId: userId })
    .sort({ createdAt: -1 })
    .populate("senderId", "username avatarUrl fullName")
    .populate("receiverId", "username fullName")
    .skip(skip)
    .limit(size);

  const totalElements = await Notification.countDocuments({ receiverId: userId });
  const totalPages = Math.ceil(totalElements / size);

  return {
    content: notifications,
    pageable: {
      sort: {
        empty: false,
        sorted: true,
        unsorted: false
      },
      offset: skip,
      pageNumber: page,
      pageSize: size,
      paged: true,
      unpaged: false
    },
    last: page >= totalPages - 1,
    totalElements,
    totalPages,
    first: page === 0,
    numberOfElements: notifications.length,
    size,
    number: page,
    sort: {
      empty: false,
      sorted: true,
      unsorted: false
    },
    empty: notifications.length === 0
  };
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

exports.getNotificationDetail = async (notificationId, userId) => {
  const notification = await Notification.findOne({ 
    _id: notificationId, 
    receiverId: userId 
  })
    .populate("senderId", "username avatarUrl fullName")
    .populate("receiverId", "username fullName");
  
  if (!notification) {
    throw new Error("Không tìm thấy thông báo hoặc không có quyền");
  }
  return notification;
};

exports.deleteAllNotifications = async (userId) => {
  const result = await Notification.deleteMany({ receiverId: userId });
  return result.deletedCount;
};

exports.deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOneAndDelete({ 
    _id: notificationId, 
    receiverId: userId 
  });
  
  if (!notification) {
    throw new Error("Không tìm thấy thông báo hoặc không có quyền");
  }
  return notification;
};

// Đếm số thông báo chưa đọc
exports.getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({ 
    receiverId: userId, 
    status: "UNREAD" 
  });
  return count;
};