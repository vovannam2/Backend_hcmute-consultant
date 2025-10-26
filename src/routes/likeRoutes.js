const express = require("express");
const router = express.Router();
const likeController = require("../controllers/common/LikeController");
const authMiddleware = require("../middleware/authMiddleware");

// Like post
router.post("/post", authMiddleware(), likeController.likePost);

// Unlike post
router.delete("/unlike/post", authMiddleware(), likeController.unlikePost);

// Count likes of post
router.get("/like-count/post", authMiddleware(), likeController.countLikeOfPost);

// Get like record of post
router.get("/like-records/post", authMiddleware(), likeController.getPostRecord);

// Get users who liked the post
router.get("/like-users/post", authMiddleware(), likeController.getLikeUsersOfPost);

module.exports = router;

