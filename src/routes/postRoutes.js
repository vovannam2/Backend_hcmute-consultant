const express = require("express");
const router = express.Router();
const postController = require("../controllers/actor/postController");
const { uploadAny } = require("../config/cloudinary");
const authMiddleware = require("../middleware/authMiddleware");

// Tạo bài viết (upload 1 file: ảnh hoặc file)
router.post("/", authMiddleware(["ADMIN", "TRUONGBANTUVAN", "TUVANVIEN"]), uploadAny.single("file"), postController.createPost);

// Xóa bài viết
router.delete("/:id", authMiddleware(), postController.deletePost);

// Xóa bài viết (query params) - Frontend gọi post/delete
router.delete("/delete", authMiddleware(), postController.deletePostByQuery);

// Sửa bài viết
router.put("/:id", authMiddleware(), postController.updatePost);

// Xem tất cả bài viết của mình
router.get("/me", authMiddleware(), postController.getMyPosts);

// Lấy danh sách tất cả bài viết (cho admin/manager/consultant)
router.get("/list", authMiddleware(["ADMIN", "TRUONGBANTUVAN", "TUVANVIEN"]), postController.getPosts);

// Lấy danh sách bài viết công khai (đã approved) - không cần authentication
router.get("/public", postController.getPublicPosts);

// Lấy chi tiết bài viết
router.get("/detail", authMiddleware(), postController.getPostDetail);

// Duyệt bài viết (admin) - Frontend gọi admin/post/approve
// router.post("/approve", authMiddleware(["ADMIN"]), postController.approvePost);

module.exports = router;
