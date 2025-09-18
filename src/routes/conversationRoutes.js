const express = require("express");
const router = express.Router();
const conversationController = require("../controllers/actor/conversationController");
const authMiddleware = require("../middleware/authMiddleware");
const { uploadImage } = require("../config/cloudinary");

router.post(
  "/user/create",
  authMiddleware(),
  uploadImage.single("avatar"),
  conversationController.createConversation
);

router.put(
  "/update/:conversationId",
  authMiddleware(),
  uploadImage.single("avatar"),
  conversationController.updateConversation
);

router.delete(
  "/delete/:conversationId",
  authMiddleware(),
  conversationController.deleteConversation
);

// Lấy danh sách cuộc trò chuyện của user đã đăng nhập
router.get(
  "/user",
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


module.exports = router;
