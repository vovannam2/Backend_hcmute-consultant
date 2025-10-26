const messageService = require("./messageService");
const Conversation = require("../../models/Conversation");
const Message = require("../../models/Message");

exports.handleSendMessage = async (conversationId, senderId, content) => {
  const newMessage = await messageService.sendMessage(conversationId, senderId, content);
  return newMessage;
};

exports.handleUpdateMessage = async (messageId, senderId, content) => {
  const updatedMessage = await messageService.updateMessage(messageId, senderId, content);
  return updatedMessage;
};

exports.handleDeleteMessage = async (messageId, senderId) => {
  const deletedMessage = await messageService.deleteMessage(messageId, senderId);
  return deletedMessage;
};

exports.getConversationById = async (conversationId) => {
  return await Conversation.findById(conversationId).populate('members', 'id');
};

// Đánh dấu tin nhắn đã đọc
exports.markMessageAsRead = async (messageId, userId) => {
  const Message = require("../../models/Message");
  
  const message = await Message.findById(messageId);
  if (!message) {
    throw new Error("Tin nhắn không tồn tại");
  }
  
  // Kiểm tra xem user đã đọc tin nhắn này chưa
  const alreadyRead = message.readBy.some(read => read.user.toString() === userId.toString());
  
  if (!alreadyRead) {
    message.readBy.push({
      user: userId,
      readAt: new Date()
    });
    
    await message.save();
  }
  
  return message;
};

// Đánh dấu tất cả tin nhắn trong cuộc hội thoại đã đọc
exports.markConversationAsRead = async (conversationId, userId) => {
  const Message = require("../../models/Message");
  
  // Lấy tất cả tin nhắn chưa đọc trong cuộc hội thoại
  const unreadMessages = await Message.find({
    conversation: conversationId,
    sender: { $ne: userId },
    $or: [
      { readBy: { $exists: false } },
      { readBy: { $size: 0 } },
      { 'readBy.user': { $ne: userId } }
    ]
  });
  
  // Đánh dấu tất cả tin nhắn đã đọc
  for (const message of unreadMessages) {
    message.readBy.push({
      user: userId,
      readAt: new Date()
    });
    await message.save();
  }
  
  return unreadMessages.length;
};

exports.getUnreadConversationCount = async (userId) => {
  
  // Tìm tất cả conversations của user
  const conversations = await Conversation.find({
    $or: [
      { user: userId },
      { consultant: userId },
      { 'members.user': userId }
    ],
    statusActive: true
  });
  
  
  let unreadCount = 0;
  
  for (const conversation of conversations) {
    // Tìm tin nhắn cuối cùng trong conversation
    const lastMessage = await Message.findOne({
      conversation: conversation._id
    }).sort({ createdAt: -1 });
    
    if (lastMessage) {
      
      // Kiểm tra nếu tin nhắn cuối cùng không phải từ user hiện tại
      const isFromOtherUser = lastMessage.sender.toString() !== userId.toString();
      
      // Kiểm tra nếu user hiện tại chưa đọc tin nhắn này
      const hasUserRead = lastMessage.readBy && lastMessage.readBy.some(
        read => read.user.toString() === userId.toString()
      );
      
      
      if (isFromOtherUser && !hasUserRead) {
        unreadCount++;
      } else {
      }
    } else {
    }
  }
  
  return unreadCount;
};
