const messageService = require("./messageService");

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
