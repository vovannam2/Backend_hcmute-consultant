const express = require("express");
const { getProfile, updateProfile, uploadAvatar } = require("../controllers/common/UserController");
const authMiddleware = require("../middleware/authMiddleware");
const { uploadCloud } = require("../config/cloudinary");

const router = express.Router();

// =======================
// 🔹 User APIs (Private)
// =======================
router.get("/profile", authMiddleware(), getProfile);
// router.put("/profile", authMiddleware(), updateProfile);
router.put("/profile", authMiddleware(), updateProfile);

router.post("/upload-avatar", authMiddleware(), uploadCloud.single("avatar"), uploadAvatar);

module.exports = router;
