const express = require("express");
const router = express.Router();
const postController = require("../controllers/actor/postController");
const { uploadFile } = require("../config/cloudinary");
const authMiddleware = require("../middleware/authMiddleware");

// Tạo bài viết (upload 1 file: ảnh hoặc file)
router.post("/", authMiddleware(), uploadFile.single("file"), postController.createPost);

// Xóa bài viết
router.delete("/:id", authMiddleware(), postController.deletePost);

// Sửa bài viết
router.put("/:id", authMiddleware(), postController.updatePost);

// Xem tất cả bài viết của mình
router.get("/me", authMiddleware(), postController.getMyPosts);

module.exports = router;
