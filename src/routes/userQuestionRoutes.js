const express = require("express");
const router = express.Router();
const questionController = require("../controllers/actor/questionController");
const authMiddleware = require("../middleware/authMiddleware");
const { uploadAny } = require("../config/cloudinary");
const parseBoolean = require("../middleware/parseBoolean");

// =======================
// 🔹 User Question APIs
// =======================

// Tạo câu hỏi mới - Frontend gọi: POST /api/user/question/create
router.post(
  "/create",
  authMiddleware(),
  uploadAny.single("file"), // <- đưa lên trước để parse multipart (req.file + req.body)
  parseBoolean,             // <- xử lý req.body sau khi multer parse xong
  questionController.createQuestion
);
// Cập nhật câu hỏi - Frontend gọi: PUT /api/user/question/update
router.put(
  "/update",
  authMiddleware(),
  parseBoolean,
  uploadAny.single("file"),
  questionController.updateQuestion
);

// Xóa câu hỏi của user
router.delete(
  "/delete",
  authMiddleware(),
  questionController.deleteMyQuestion
);

// Lấy danh sách câu hỏi của mình
router.get(
  "/my",
  authMiddleware(),
  questionController.getMyQuestions
);

module.exports = router;
