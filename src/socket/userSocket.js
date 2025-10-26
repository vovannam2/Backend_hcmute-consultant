const User = require("../models/User");

const onlineUsers = new Map();

module.exports = (io, socket) => {

  // Khi client báo userId
  socket.on("userOnline", async (userId) => {
    if (!userId) return;

    // User ID đã được set từ authentication middleware
    // Chỉ cần verify userId matches với authenticated user
    if (socket.user && socket.user.id !== userId) {
      return;
    }

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastActivity: new Date(),
    });

    io.emit("userStatusChanged", { userId, status: "online" });

    const onlineUserIds = Array.from(onlineUsers.keys());
    socket.emit("onlineUsersList", onlineUserIds);
    
  });

  // Join conversation
  socket.on("joinConversation", (conversationId) => {
    if (!conversationId) return;
    socket.join(conversationId);
    socket.emit("joinedConversation", { conversationId });
  });

  // Khi disconnect
  socket.on("disconnect", async () => {
    for (let [userId, sockets] of onlineUsers.entries()) {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);

          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastActivity: new Date(),
          });

          io.emit("userStatusChanged", { userId, status: "offline" });
        }
        break;
      }
    }
  });
};
