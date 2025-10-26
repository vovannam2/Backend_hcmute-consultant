const express = require("express");
const router = express.Router();
const questionController = require("../controllers/actor/questionController");
const authMiddleware = require("../middleware/authMiddleware");
const { uploadAny } = require("../config/cloudinary");
const parseBoolean = require("../middleware/parseBoolean");

// Tạo câu hỏi mới
router.post(
  "/",
  authMiddleware(),
  parseBoolean,
  uploadAny.single("file"),
  questionController.createQuestion
);

// Sửa câu hỏi
router.put(
  "/:id",
  authMiddleware(),
  uploadAny.single("file"),
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

// Lấy danh sách trạng thái câu hỏi
router.get(
  "/list-filter-status-options",
  questionController.getQuestionStatusOptions
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
  uploadAny.single("file"),
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

const onlyConsultant = authMiddleware(["TUVANVIEN","TRUONGBANTUVAN"]);

// Xem câu hỏi chờ trả lời
router.get("/consultant/questions/pending", onlyConsultant, questionController.getPendingQuestions);

// Xem câu hỏi đã trả lời
router.get("/consultant/questions/answered", onlyConsultant, questionController.getAnsweredQuestions);

// Xem tất cả câu hỏi theo department của tư vấn viên
router.get("/consultant/questions/all", onlyConsultant, questionController.getAllQuestionsByDepartment);

// Trả lời câu hỏi
router.post(
  "/consultant/answers",
  onlyConsultant,
  uploadAny.single("file"),
  questionController.createAnswer
);

// Chỉnh sửa câu trả lời
router.put(
  "/consultant/answers/:id",
  onlyConsultant,
  uploadAny.single("file"),
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

// Lấy bản ghi like của câu hỏi
router.get(
  "/:id/like-records",
  authMiddleware(),
  questionController.getQuestionLikeRecord
);

// Lấy danh sách user đã like câu hỏi
router.get(
  "/:id/like-users",
  questionController.getQuestionLikeUsers
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

// Update answer (for frontend compatibility)
router.put(
  "/answer/update",
  authMiddleware(),
  uploadAny.single("file"),
  questionController.updateAnswerByParams
);

// Delete answer (for frontend compatibility)
router.delete(
  "/answer/delete",
  authMiddleware(),
  questionController.deleteAnswerByParams
);

module.exports = router;
