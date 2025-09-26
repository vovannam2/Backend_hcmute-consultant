const express = require("express");
const router = express.Router();
const questionController = require("../controllers/actor/questionController");
const authMiddleware = require("../middleware/authMiddleware");
const { uploadImage } = require("../config/cloudinary");
const { uploadFile } = require("../config/cloudinary");
const parseBoolean = require("../middleware/parseBoolean");

// Tạo câu hỏi mới
router.post(
  "/",
  authMiddleware(),
  parseBoolean,
  uploadImage.single("file"),
  questionController.createQuestion
);

// Sửa câu hỏi
router.put(
  "/:id",
  authMiddleware(),
  uploadImage.single("file"),
  questionController.updateQuestion
);

// Xóa câu hỏi (user)
router.delete(
  "/:id",
  authMiddleware(),
  questionController.deleteMyQuestion
);

// Xóa câu hỏi (admin)
router.delete(
  "/admin/:id",
  authMiddleware(),
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
  authMiddleware(),
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
  uploadImage.single("file"),
  authMiddleware(),
  questionController.askFollowUpQuestion
);

// Danh sách log xóa
router.get(
  "/logs/deletion",
  authMiddleware(),
  questionController.getDeletionLogs
);

// Chi tiết log xóa
router.get(
  "/logs/deletion/:id",
  authMiddleware(),
  questionController.getDeletionLogDetail
);

const onlyConsultant = authMiddleware(["TUVANVIEN"]);

// Xem câu hỏi chờ trả lời
router.get("/consultant/questions/pending", onlyConsultant, questionController.getPendingQuestions);

// Xem câu hỏi đã trả lời
router.get("/consultant/questions/answered", onlyConsultant, questionController.getAnsweredQuestions);

// Trả lời câu hỏi
router.post(
  "/consultant/answers",
  onlyConsultant,
  uploadFile.single("file"),
  questionController.createAnswer
);

// Chỉnh sửa câu trả lời
router.put(
  "/consultant/answers/:id",
  onlyConsultant,
  uploadFile.single("file"),
  questionController.updateAnswer
);

// Yêu cầu đánh giá câu trả lời
router.post(
  "/consultant/answers/:id/request-review",
  onlyConsultant,
  questionController.requestAnswerReview
);

// Xem chi tiết câu hỏi cho tư vấn viên
router.get(
  "/consultant/questions/:id",
  onlyConsultant,
  questionController.getQuestionDetailForConsultant
);

// Like câu hỏi
router.post(
  "/:id/like",
  authMiddleware(),
  questionController.likeQuestion
);

// Unlike câu hỏi
router.delete(
  "/:id/like",
  authMiddleware(),
  questionController.unlikeQuestion
);

// Đếm số like của câu hỏi
router.get(
  "/:id/likes/count",
  questionController.countQuestionLikes
);

// Like câu trả lời
router.post(
  "/likes/answer/:id",
  authMiddleware(),
  questionController.likeAnswer
);

// Unlike câu trả lời
router.delete(
  "/likes/answer/:id",
  authMiddleware(),
  questionController.unlikeAnswer
);

// Đếm và lấy danh sách like của câu trả lời
router.get(
  "/likes/answer/count/:id",
  questionController.getAnswerLikes
);

module.exports = router;
