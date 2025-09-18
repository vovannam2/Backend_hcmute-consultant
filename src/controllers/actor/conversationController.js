const ConversationService = require("../../service/actor/conversationService");
const User = require("../../models/User");

exports.createConversation = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Chưa xác thực người dùng" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const conversation = await ConversationService.createConversation(
      req.body,
      user,
      req.file
    );

    return res.json({
      status: "success",
      message: "Cuộc trò chuyện đã được tạo thành công.",
      data: conversation,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateConversation = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Chưa xác thực người dùng" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const { conversationId } = req.params;
    const conversation = await ConversationService.updateConversation(
      conversationId,
      req.body,
      user,
      req.file
    );

    return res.json({
      status: "success",
      message: "Cập nhật cuộc trò chuyện thành công.",
      data: conversation,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteConversation = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    await ConversationService.deleteConversation(req.params.conversationId, user);

    return res.json({
      status: "success",
      message: "Xóa cuộc trò chuyện thành công.",
    });
  } catch (err) {
    next(err);
  }
};

// list conversations for a user
exports.listConversations = async (req, res, next) => {
  try {
    const conversations = await ConversationService.listConversations(req.user.id);
    return res.json({
      status: "success",
      data: conversations,
    });
  } catch (err) {
    next(err);
  }
};

exports.getConversationDetail = async (req, res, next) => {
  try {
    const conversation = await ConversationService.getConversationDetail(
      req.params.conversationId,
      req.user.id
    );

    return res.json({
      status: "success",
      data: conversation,
    });
  } catch (err) {
    next(err);
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

