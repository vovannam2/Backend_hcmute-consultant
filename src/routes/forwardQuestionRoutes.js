const express = require("express");
const router = express.Router();
const ForwardQuestionController = require("../controllers/actor/ForwardQuestionController");
const authMiddleware = require("../middleware/authMiddleware");

// Lấy danh sách forward questions
router.get(
  "/forward-question/list",
  authMiddleware(),
  ForwardQuestionController.getForwardQuestions
);

// Cập nhật forward question
router.put(
  "/forward-question/update",
  authMiddleware(),
  ForwardQuestionController.updateForwardQuestion
);

// Xóa forward question
router.delete(
  "/forward-question/delete",
  authMiddleware(),
  ForwardQuestionController.deleteForwardQuestion
);

router.post(
  "/questions/:id/forward",
  authMiddleware(["TUVANVIEN"]),
  ForwardQuestionController.forwardQuestion
);


module.exports = router;
