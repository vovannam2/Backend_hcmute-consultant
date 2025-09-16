const express = require("express");
const router = express.Router();
const questionController = require("../controllers/actor/questionController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const parseBoolean = require("../middleware/parseBoolean");

// Tạo câu hỏi mới
router.post(
  "/",
  authMiddleware,
  parseBoolean,
  upload.single("file"),
  questionController.createQuestion
);

// Sửa câu hỏi
router.put(
  "/:id",
  authMiddleware,
  upload.single("file"),
  questionController.updateQuestion
);

// Xóa câu hỏi (user)
router.delete(
  "/:id",
  authMiddleware,
  questionController.deleteMyQuestion
);

// Xóa câu hỏi (admin)
router.delete(
  "/admin/:id",
  authMiddleware,
  questionController.deleteQuestionByAdmin
);

// Lấy danh sách câu hỏi (lọc + phân trang)
router.get(
  "/",
  parseBoolean,
  questionController.getQuestions
);

// Lấy danh sách câu hỏi của mình
router.get(
  "/my",
  authMiddleware,
  questionController.getMyQuestions
);

// Tìm kiếm câu hỏi
router.get(
  "/search",
  questionController.searchQuestions
);

// Lấy chi tiết câu hỏi theo ID
router.get(
  "/:id",
  questionController.getQuestionDetail
);

// Tạo câu hỏi bổ sung (follow-up question)
router.post(
  "/:id/follow-up",
  upload.single("file"),
  authMiddleware,
  questionController.askFollowUpQuestion
);

// Danh sách log xóa
router.get(
  "/logs/deletion",
  authMiddleware,
  questionController.getDeletionLogs
);

// Chi tiết log xóa
router.get(
  "/logs/deletion/:id",
  authMiddleware,
  questionController.getDeletionLogDetail
);

module.exports = router;
