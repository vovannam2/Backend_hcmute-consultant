const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/common/uploadController");
const authMiddleware = require("../middleware/authMiddleware");
const { uploadAny } = require("../config/cloudinary");

// Upload file
router.post("/", authMiddleware(), uploadAny.single('file'), uploadController.uploadFile);

module.exports = router;
