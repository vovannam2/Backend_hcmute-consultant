const express = require("express");
const router = express.Router();
const conversationController = require("../controllers/actor/conversationController");
const authMiddleware = require("../middleware/authMiddleware");
const { uploadImageOnly } = require("../config/cloudinary");

// Tạo conversation cho user
router.post(
  "/user/conversation/create",
  authMiddleware(),
  conversationController.createUserConversation
);

// Tạo group conversation cho consultant
router.post(
  "/consultant/conversation/create",
  authMiddleware(),
  conversationController.createGroupConversation
);

router.put(
  "/update/:conversationId",
  authMiddleware(),
  uploadImageOnly.single("avatar"),
  conversationController.updateConversation
);

// Xóa conversation
router.delete(
  "/conversation/delete",
  authMiddleware(),
  conversationController.deleteConversation
);

// Lấy danh sách cuộc trò chuyện
router.get(
  "/conversation/list",
  authMiddleware(),
  conversationController.listConversations
);

// Lấy chi tiết cuộc trò chuyện
router.get(
  "/detail/:conversationId",
  authMiddleware(),
  conversationController.getConversationDetail
);

// router.post(
//   "/approve-member/:conversationId",
//   authMiddleware(),
//   conversationController.approveMember
// );

// router.post(
//   "/remove-member/:conversationId",
//   authMiddleware(),
//   conversationController.removeMember
// );

// router.get(
//   "/members/:conversationId",
//   authMiddleware(),
//   conversationController.listMembers
// );

// router.get(
//   "/user/list-users",
//   authMiddleware(),
//   conversationController.listUsers
// );

// Lấy số lượng hội thoại chưa đọc
router.get(
  "/conversation/unread-count",
  authMiddleware(),
  conversationController.getUnreadConversationCount
);

// Đánh dấu tin nhắn đã đọc
router.put(
  "/message/:messageId/read",
  authMiddleware(),
  conversationController.markMessageAsRead
);

// Đánh dấu tất cả tin nhắn trong cuộc hội thoại đã đọc
router.put(
  "/conversation/:conversationId/read",
  authMiddleware(),
  conversationController.markConversationAsRead
);

module.exports = router;
