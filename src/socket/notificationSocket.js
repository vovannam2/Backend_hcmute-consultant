const Notification = require("../models/Notification");
const User = require("../models/User");

// Map để lưu trữ socket connections theo userId
const userSockets = new Map();

module.exports = (io, socket) => {

  // Lưu socket connection theo userId
  socket.on("joinNotificationRoom", (userId) => {
    if (!userId) {
      return;
    }
    
    
    // Use socket.user.id if available, otherwise use provided userId
    const actualUserId = socket.user?.id || userId;

    userSockets.set(actualUserId, socket.id);
    socket.join(actualUserId.toString());
  });

  // Gửi thông báo real-time
  socket.on("sendNotification", async (data) => {
    try {
      const { receiverId, content, notificationType, questionId, answerId } = data;
      
      // Tạo thông báo mới
      const notification = new Notification({
        senderId: socket.user.id,
        receiverId,
        content,
        notificationType,
        questionId,
        answerId
      });

      await notification.save();
      
      // Populate thông báo
      await notification.populate("senderId", "username avatarUrl fullName");
      
      // Gửi thông báo đến user cụ thể
      io.to(`notification_${receiverId}`).emit("newNotification", notification);
      
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  });

  // Khi disconnect
  socket.on("disconnect", () => {
    // Xóa socket connection
    for (let [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
  });
};

// Helper function để gửi thông báo từ bất kỳ đâu trong app
const sendNotification = async (io, senderId, receiverId, content, notificationType, questionId = null, answerId = null) => {
  try {
    // Tạo thông báo mới
    const notification = new Notification({
      senderId,
      receiverId,
      content,
      notificationType,
      questionId,
      answerId
    });

    await notification.save();
    
    // Populate thông báo
    await notification.populate("senderId", "username avatarUrl fullName");
    
    // Gửi thông báo đến user cụ thể
    io.to(`notification_${receiverId}`).emit("newNotification", notification);
    
    return notification;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};

module.exports.sendNotification = sendNotification;
