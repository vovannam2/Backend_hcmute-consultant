const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Đường dẫn thư mục public/upload
const uploadPath = path.join(__dirname, "../public/upload");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // giữ đuôi file gốc
  },
});

const upload = multer({ storage });

module.exports = upload;
