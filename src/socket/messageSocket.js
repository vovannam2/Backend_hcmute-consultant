const { cloudinary } = require("../config/cloudinary");
const messageSocketService = require("../service/actor/messageSocketService");
const User = require("../models/User");

module.exports = (io, socket) => {
  // Gửi tin nhắn
  socket.on("sendMessage", async (data, callback) => {
    try {
      if (!socket.user || !socket.user.id) {
        return callback({ success: false, error: "User chưa đăng nhập socket" });
      }

      let imageUrl = null;
      let fileUrl = null;

      if (data.imageBase64 && data.fileBase64) {
        return callback({
          success: false,
          error: "Chỉ được upload 1 trong 2: ảnh hoặc file",
        });
      }

      if (data.imageBase64) {
        const result = await cloudinary.uploader.upload(data.imageBase64, {
          folder: "chat/images",
          allowed_formats: ["jpg", "jpeg", "png"],
        });
        imageUrl = result.secure_url;
      }

      if (data.fileUrl) {
        fileUrl = data.fileUrl;
      }

      // Lưu DB qua service
      const message = await messageSocketService.handleSendMessage(
        data.conversationId,
        socket.user.id,
        { message: data.message, imageUrl, fileUrl }
      );

      // Cập nhật trạng thái online
      await User.findByIdAndUpdate(socket.user.id, {
        isOnline: true,
        lastActivity: new Date(),
      });

      // Emit sự kiện ở đây
      io.to(data.conversationId).emit("newMessage", message);
      callback({ success: true, message });
    } catch (err) {
      console.error("sendMessage error:", err);
      callback({ success: false, error: err.message });
    }
  });

  // Sửa tin nhắn
  socket.on("updateMessage", async (data, callback) => {
    try {
      // Bắt lỗi input sớm
      if (!data?.messageId || (typeof data?.message !== 'string' && data?.message !== null)) {
        return callback({ success: false, error: "Thiếu messageId hoặc nội dung message không hợp lệ" });
      }

      const updated = await messageSocketService.handleUpdateMessage(
        data.messageId,
        socket.user.id,
        data.message
      );

      io.to(updated.conversation.toString()).emit("messageUpdated", updated);
      callback({ success: true, message: updated });
    } catch (err) {
      callback({ success: false, error: err.message });
    }
  });

  // Xoá tin nhắn
  socket.on("deleteMessage", async (data, callback) => {
    try {
      const deleted = await messageSocketService.handleDeleteMessage(
        data.messageId,
        socket.user.id
      );

      io.to(deleted.conversation.toString()).emit("messageDeleted", deleted);
      callback({ success: true, message: deleted });
    } catch (err) {
      callback({ success: false, error: err.message });
    }
  });
};
