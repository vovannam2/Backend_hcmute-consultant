const User = require("../models/User");

const onlineUsers = new Map();

module.exports = (io, socket) => {
  console.log("✅ User connected:", socket.id);

  // Khi client báo userId
  socket.on("userOnline", async (userId) => {
    console.log("userOnline called:", userId, "socketId:", socket.id);
    if (!userId) return;

    // Gán userId vào socket để messageSocket dùng
    socket.user = { id: userId };

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
    
    console.log(`User ${userId} is online`);
  });

  // Join conversation
  socket.on("joinConversation", (conversationId) => {
    if (!conversationId) return;
    socket.join(conversationId);
    console.log(`${socket.id} joined conversation ${conversationId}`);
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
          console.log(`User ${userId} is offline`);
        }
        break;
      }
    }
    console.log(" User disconnected:", socket.id);
  });
};
