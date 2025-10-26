const mongoose = require("mongoose");
const Message = require("../../models/Message");
const Conversation = require("../../models/Conversation");
const User = require("../../models/User");

exports.getMessages = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new Error("Không tìm thấy cuộc hội thoại");

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const isMember =
    (conversation.user && conversation.user.equals(userObjectId)) ||
    (conversation.consultant && conversation.consultant.equals(userObjectId)) ||
    (Array.isArray(conversation.members) && conversation.members.some((m) => m.user && m.user.equals(userObjectId)));

  if (!isMember) {
    throw new Error("Bạn không thuộc cuộc hội thoại này");
  }

  return Message.find({ conversation: conversation._id })
    .sort({ createdAt: 1 })
    .populate("sender", "fullName avatarUrl");
};

exports.sendMessage = async (conversationId, senderId, data) => {
  
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new Error("Không tìm thấy cuộc trò chuyện");
  }

  const senderObjectId = new mongoose.Types.ObjectId(senderId);

  const isMember =
    (conversation.user && conversation.user.equals(senderObjectId)) ||
    (conversation.consultant && conversation.consultant.equals(senderObjectId)) ||
    (Array.isArray(conversation.members) && conversation.members.some((m) => m.user && m.user.equals(senderObjectId)));

  if (!isMember) {
    throw new Error("Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này");
  }

  const memberIds = [
    conversation.user,
    conversation.consultant,
    ...(Array.isArray(conversation.members) ? conversation.members.map((m) => m.user) : []),
  ].filter(Boolean);

  const uniqueReceivers = [...new Set(memberIds.map((id) => id.toString()))]
    .filter((id) => id !== senderId.toString())
    .map((id) => new mongoose.Types.ObjectId(id));


  const message = new Message({
    conversation: conversation._id,
    sender: new mongoose.Types.ObjectId(senderId),
    receivers: uniqueReceivers,
    message: data.message || null,
    imageUrl: data.imageUrl || null,
    fileUrl: data.fileUrl || null,
  });

  await message.save();
  
  await message.populate("sender", "fullName email avatarUrl");

  await User.findByIdAndUpdate(senderId, { lastActivity: new Date(), isOnline: true });
  
  return message;
};

exports.updateMessage = async (messageId, userId, newContent) => {
  const message = await Message.findById(messageId);
  if (!message) throw new Error("Tin nhắn không tồn tại");

  if (message.sender.toString() !== userId.toString()) {
    throw new Error("Bạn không có quyền sửa tin nhắn này");
  }

  message.message = newContent;
  message.edited = true;
  message.editedDate = Date.now();
  await message.save();
  return message.populate("sender", "fullName email avatarUrl");
};

exports.deleteMessage = async (messageId, userId) => {
  const message = await Message.findById(messageId);
  if (!message) throw new Error("Tin nhắn không tồn tại");

  if (message.sender.toString() !== userId.toString()) {
    throw new Error("Bạn không có quyền xoá tin nhắn này");
  }

  await message.deleteOne();
  return { id: messageId, conversation: message.conversation };
};

exports.getLastReadMessage = async (userId, conversationId) => {
  // Tìm tin nhắn cuối cùng mà user đã đọc trong cuộc hội thoại
  // Đây là một implementation đơn giản, có thể cần cải thiện tùy theo logic business
  const messages = await Message.find({
    conversation: conversationId,
    sender: { $ne: userId }
  }).sort({ createdAt: -1 }).limit(1);
  
  return messages.length > 0 ? messages[0] : null;
};

exports.getLastMessageInConversation = async (conversationId) => {
  // Tìm tin nhắn cuối cùng trong cuộc hội thoại
  const message = await Message.findOne({
    conversation: conversationId
  }).sort({ createdAt: -1 });
  
  return message;
};