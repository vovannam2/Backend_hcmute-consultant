const mongoose = require("mongoose");
const Message = require("../../models/Message");
const Conversation = require("../../models/Conversation");

exports.getMessages = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new Error("Không tìm thấy cuộc trò chuyện");
  }

  // Kiểm tra quyền thành viên
  const isMember =
    conversation.user.equals(userId) ||
    conversation.consultant.equals(userId) ||
    conversation.members.some(m => m.user.equals(userId));

  if (!isMember) {
    throw new Error("Bạn không có quyền xem tin nhắn trong cuộc trò chuyện này");
  }

  // Lấy tin nhắn thuộc cuộc trò chuyện
  return Message.find({
     conversation: conversationId,
     recalledForEveryone: false
    })
    .populate("sender", "firstName lastName email avatarUrl")
    .populate("receivers", "firstName lastName email avatarUrl")
    .sort({ createdAt: 1 });
};


exports.sendMessage = async (conversationId, senderId, data) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new Error("Không tìm thấy cuộc trò chuyện");

  const senderObjectId = new mongoose.Types.ObjectId(senderId);

  const isMember =
    conversation.user.equals(senderObjectId) ||
    conversation.consultant.equals(senderObjectId) ||
    conversation.members.some((m) => m.user.equals(senderObjectId));

  if (!isMember) throw new Error("Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này");

  const memberIds = [
    conversation.user,
    conversation.consultant,
    ...conversation.members.map((m) => m.user),
  ];

  const uniqueReceivers = [...new Set(memberIds.map((id) => id.toString()))]
    .filter((id) => id !== senderId.toString())
    .map((id) => new mongoose.Types.ObjectId(id));

  const message = new Message({
    conversation: conversation._id,
    sender: senderId,
    receivers: uniqueReceivers,
    message: data.message,
    imageUrl: data.imageUrl || null,
    fileUrl: data.fileUrl || null,
  });

  await message.save();
  return message.populate("sender", "firstName lastName email avatarUrl");
};

exports.updateMessage = async (messageId, data, user) => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw new Error("Không tìm thấy tin nhắn");
  }

  if (message.sender.toString() !== user.id.toString()) {
    throw new Error("Bạn không có quyền chỉnh sửa tin nhắn này");
  }

  message.message = data.message || message.message;
  message.edited = true;
  message.editedDate = new Date();

  await message.save();
  return message;
};

exports.deleteMessage = async (messageId, user) => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw new Error("Không tìm thấy tin nhắn");
  }

  if (message.sender.toString() !== user.id.toString()) {
    throw new Error("Bạn không có quyền thu hồi tin nhắn này");
  }

  message.recalledForEveryone = true;
  await message.save();
  return message;
};
