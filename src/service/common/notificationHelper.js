const Notification = require("../../models/Notification");

// Helper function để tạo và gửi thông báo
const createNotification = async (senderId, receiverId, content, notificationType, questionId = null, answerId = null) => {
  try {
    const notification = new Notification({
      senderId,
      receiverId,
      content,
      notificationType,
      questionId,
      answerId
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Helper function để gửi thông báo qua socket
const sendNotificationViaSocket = (io, notification) => {
  try {
    const receiverId = notification.receiverId.toString();
    
    const notificationData = {
      id: notification._id.toString(),
      senderId: notification.senderId ? {
        id: notification.senderId._id.toString(),
        username: notification.senderId.username,
        avatarUrl: notification.senderId.avatarUrl,
        fullName: notification.senderId.fullName
      } : null,
      receiverId: {
        id: notification.receiverId.toString(),
        username: notification.receiverId.username || 'Unknown',
        fullName: notification.receiverId.fullName || 'Unknown'
      },
      content: notification.content,
      time: notification.time.toISOString(),
      notificationType: notification.notificationType,
      status: notification.status,
      questionId: notification.questionId ? notification.questionId.toString() : undefined,
      answerId: notification.answerId ? notification.answerId.toString() : undefined
    };
    
    
    io.to(receiverId).emit("newNotification", notificationData);
  } catch (error) {
    console.error("❌ Error sending notification via socket:", error);
  }
};

// Helper function để tạo và gửi thông báo hoàn chỉnh
const createAndSendNotification = async (io, senderId, receiverId, content, notificationType, questionId = null, answerId = null) => {
  try {
    
    // Tạo thông báo
    const notification = await createNotification(senderId, receiverId, content, notificationType, questionId, answerId);
    
    // Populate thông báo
    await notification.populate("senderId", "username avatarUrl fullName");
    
    // Gửi qua socket
    sendNotificationViaSocket(io, notification);
    
    return notification;
  } catch (error) {
    console.error("❌ Error creating and sending notification:", error);
    throw error;
  }
};

module.exports = {
  createNotification,
  sendNotificationViaSocket,
  createAndSendNotification
};
