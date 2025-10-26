const chatService = require("../../service/actor/chatService");
const { DataResponse, ExceptionResponse } = require("../../utils/response");

// Lấy lịch sử tin nhắn
exports.getChatHistory = async (req, res) => {
  try {
    const { conversationId, page = 0, size = 20, sortBy = 'date', sortDir = 'asc' } = req.query;
    
    if (!conversationId) {
      return res.status(400).json(new ExceptionResponse("conversationId is required", undefined, 'error'));
    }

    const result = await chatService.getChatHistory(conversationId, { 
      page: parseInt(page), 
      size: parseInt(size), 
      sortBy, 
      sortDir 
    });
    
    return res.status(200).json(new DataResponse(result, "Lấy lịch sử tin nhắn thành công.", 'success'));
  } catch (error) {
    console.error("getChatHistory error:", error);
    return res.status(error.status || 500).json(new ExceptionResponse(error.message, undefined, 'error'));
  }
};

// Cập nhật tin nhắn
exports.updateMessage = async (req, res) => {
  try {
    const { messageId, newContent } = req.query;
    
    if (!messageId || !newContent) {
      return res.status(400).json(new ExceptionResponse("messageId and newContent are required", undefined, 'error'));
    }

    const result = await chatService.updateMessage(
      parseInt(messageId), 
      newContent, 
      req.user.id
    );
    
    return res.status(200).json(new DataResponse(result, "Cập nhật tin nhắn thành công.", 'success'));
  } catch (error) {
    console.error("updateMessage error:", error);
    return res.status(error.status || 500).json(new ExceptionResponse(error.message, undefined, 'error'));
  }
};

// Thu hồi tin nhắn (chỉ mình)
exports.recallMessageSelf = async (req, res) => {
  try {
    const { messageId } = req.query;
    
    if (!messageId) {
      return res.status(400).json(new ExceptionResponse("messageId is required", undefined, 'error'));
    }

    const result = await chatService.recallMessage(
      parseInt(messageId), 
      req.user.id, 
      false
    );
    
    return res.status(200).json(new DataResponse(result, "Thu hồi tin nhắn thành công.", 'success'));
  } catch (error) {
    console.error("recallMessageSelf error:", error);
    return res.status(error.status || 500).json(new ExceptionResponse(error.message, undefined, 'error'));
  }
};

// Thu hồi tin nhắn (cho tất cả)
exports.recallMessageAll = async (req, res) => {
  try {
    const { messageId } = req.query;
    
    if (!messageId) {
      return res.status(400).json(new ExceptionResponse("messageId is required", undefined, 'error'));
    }

    const result = await chatService.recallMessage(
      parseInt(messageId), 
      req.user.id, 
      true
    );
    
    return res.status(200).json(new DataResponse(result, "Thu hồi tin nhắn cho tất cả thành công.", 'success'));
  } catch (error) {
    console.error("recallMessageAll error:", error);
    return res.status(error.status || 500).json(new ExceptionResponse(error.message, undefined, 'error'));
  }
};
