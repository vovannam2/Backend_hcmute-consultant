const ConversationService = require("../../service/actor/conversationService");
const User = require("../../models/User");
const { DataResponse, ExceptionResponse } = require("../../utils/response");

// Tạo conversation cho user (1-1 với consultant)
exports.createUserConversation = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(new ExceptionResponse("Chưa xác thực người dùng", undefined, 'error'));
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(new ExceptionResponse("Không tìm thấy người dùng", undefined, 'error'));
    }

    const conversation = await ConversationService.createUserConversation(
      req.body,
      user
    );

    return res.status(201).json(new DataResponse(conversation, "Cuộc trò chuyện đã được tạo thành công.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// Tạo group conversation cho consultant
exports.createGroupConversation = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(new ExceptionResponse("Chưa xác thực người dùng", undefined, 'error'));
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(new ExceptionResponse("Không tìm thấy người dùng", undefined, 'error'));
    }

    const conversation = await ConversationService.createGroupConversation(
      req.body,
      user
    );

    return res.status(201).json(new DataResponse(conversation, "Nhóm trò chuyện đã được tạo thành công.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

exports.updateConversation = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(new ExceptionResponse("Chưa xác thực người dùng", undefined, 'error'));
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(new ExceptionResponse("Không tìm thấy người dùng", undefined, 'error'));
    }

    const { conversationId } = req.params;
    const conversation = await ConversationService.updateConversation(
      conversationId,
      req.body,
      user,
      req.file
    );

    return res.status(200).json(new DataResponse(conversation, "Cập nhật cuộc trò chuyện thành công.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

exports.deleteConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.query;
    if (!conversationId) {
      return res.status(400).json(new ExceptionResponse("conversationId is required", undefined, 'error'));
    }

    const user = await User.findById(req.user.id);
    await ConversationService.deleteConversation(conversationId, user);

    return res.status(200).json(new DataResponse(null, "Xóa cuộc trò chuyện thành công.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// list conversations for a user
exports.listConversations = async (req, res, next) => {
  try {
    const result = await ConversationService.listConversations(req.user.id, req.query);
    return res.status(200).json(new DataResponse(result, "Lấy danh sách cuộc trò chuyện thành công.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

exports.getConversationDetail = async (req, res, next) => {
  try {
    const conversation = await ConversationService.getConversationDetail(
      req.params.conversationId,
      req.user.id
    );

    return res.status(200).json(new DataResponse(conversation, "Lấy chi tiết cuộc trò chuyện thành công.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// exports.approveMember = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user.id);
//     const conversation = await ConversationService.approveMember(
//       req.params.conversationId,
//       req.body.memberId,
//       user
//     );

//     return res.json({
//       status: "success",
//       message: "Duyệt thành viên thành công.",
//       data: conversation,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.removeMember = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user.id);
//     const conversation = await ConversationService.removeMember(
//       req.params.conversationId,
//       req.body.memberId,
//       user
//     );

//     return res.json({
//       status: "success",
//       message: "Xóa thành viên thành công.",
//       data: conversation,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.listMembers = async (req, res, next) => {
//   try {
//     const members = await ConversationService.listMembers(
//       req.params.conversationId,
//       req.user.id
//     );

//     return res.json({
//       status: "success",
//       data: members,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.listUsers = async (req, res, next) => {
//   try {
//     const users = await ConversationService.listUsers(req.query);

//     return res.json({
//       status: "success",
//       data: users,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// Lấy số lượng hội thoại chưa đọc
exports.getUnreadConversationCount = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json(new ExceptionResponse("Chưa xác thực người dùng", undefined, 'error'));
    }

    const messageSocketService = require("../../service/actor/messageSocketService");
    const unreadCount = await messageSocketService.getUnreadConversationCount(userId);
    

    return res.status(200).json(new DataResponse(unreadCount, "Lấy số lượng hội thoại chưa đọc thành công.", 'success'));
  } catch (err) {
    console.error(`❌ Error getting unread count:`, err);
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// Đánh dấu tin nhắn đã đọc
exports.markMessageAsRead = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { messageId } = req.params;
    
    if (!userId) {
      return res.status(401).json(new ExceptionResponse("Chưa xác thực người dùng", undefined, 'error'));
    }

    if (!messageId) {
      return res.status(400).json(new ExceptionResponse("messageId is required", undefined, 'error'));
    }

    const messageSocketService = require("../../service/actor/messageSocketService");
    const message = await messageSocketService.markMessageAsRead(messageId, userId);
    
    return res.status(200).json(new DataResponse(message, "Đánh dấu tin nhắn đã đọc thành công.", 'success'));
  } catch (err) {
    console.error(`❌ Error marking message as read:`, err);
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// Đánh dấu tất cả tin nhắn trong cuộc hội thoại đã đọc
exports.markConversationAsRead = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;
    
    if (!userId) {
      return res.status(401).json(new ExceptionResponse("Chưa xác thực người dùng", undefined, 'error'));
    }

    if (!conversationId) {
      return res.status(400).json(new ExceptionResponse("conversationId is required", undefined, 'error'));
    }

    const messageSocketService = require("../../service/actor/messageSocketService");
    const markedCount = await messageSocketService.markConversationAsRead(conversationId, userId);
    
    return res.status(200).json(new DataResponse({ markedCount }, `Đánh dấu ${markedCount} tin nhắn đã đọc thành công.`, 'success'));
  } catch (err) {
    console.error(`❌ Error marking conversation as read:`, err);
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

