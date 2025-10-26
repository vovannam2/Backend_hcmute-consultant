const Message = require("../../models/Message");
const User = require("../../models/User");

// Lấy lịch sử tin nhắn
exports.getChatHistory = async (conversationId, options) => {
  try {
    const { page, size, sortBy, sortDir } = options;
    const offset = page * size;
    
    const sortOrder = sortDir.toLowerCase() === 'asc' ? 1 : -1;
    const sortObj = {};
    // Default sort by createdAt if sortBy is empty
    const sortField = sortBy || 'createdAt';
    sortObj[sortField] = sortOrder;
    
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'fullName avatarUrl')
      .sort(sortObj)
      .skip(offset)
      .limit(parseInt(size));
    
    const totalCount = await Message.countDocuments({ conversation: conversationId });
    
    return {
      content: messages,
      totalElements: totalCount,
      totalPages: Math.ceil(totalCount / size),
      size: parseInt(size),
      number: parseInt(page)
    };
  } catch (error) {
    console.error("getChatHistory service error:", error);
    throw error;
  }
};

// Cập nhật tin nhắn
exports.updateMessage = async (messageId, newContent, userId) => {
  try {
    const message = await Message.findOne({
      _id: messageId, 
      sender: userId
    });
    
    if (!message) {
      throw new Error("Message not found or not authorized");
    }
    
    message.message = newContent;
    message.edited = true;
    message.editedDate = new Date();
    await message.save();
    
    return message;
  } catch (error) {
    console.error("updateMessage service error:", error);
    throw error;
  }
};

// Thu hồi tin nhắn
exports.recallMessage = async (messageId, userId, recallForEveryone) => {
  try {
    const message = await Message.findOne({
      _id: messageId, 
      sender: userId
    });
    
    if (!message) {
      throw new Error("Message not found or not authorized");
    }
    
    if (recallForEveryone) {
      message.recalledForEveryone = true;
    } else {
      message.recalledBySender = true;
    }
    
    await message.save();
    return message;
  } catch (error) {
    console.error("recallMessage service error:", error);
    throw error;
  }
};
