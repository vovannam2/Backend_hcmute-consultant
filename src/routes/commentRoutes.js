const express = require("express");
const router = express.Router();
const commentController = require("../controllers/common/CommentController");
const authMiddleware = require("../middleware/authMiddleware");

// Tạo bình luận
router.post("/create", authMiddleware(), commentController.createComment);

// Cập nhật bình luận
router.put("/update", authMiddleware(), commentController.updateComment);

// Lấy bình luận theo bài viết
router.get("/get-comment-by-post", authMiddleware(), commentController.getComments);

// Trả lời bình luận
router.post("/reply", authMiddleware(), commentController.replyComment);

// Xóa bình luận
router.delete("/delete", authMiddleware(), commentController.deleteComment);

module.exports = router;
