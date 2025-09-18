const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage cho avatar hoặc các route khác
const storageImage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "avatars",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const uploadImage = multer({ storage: storageImage });

// Storage riêng cho chat (ảnh hoặc file)
const storageChat = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    if (file.fieldname === "image") {
      return {
        folder: "chat/images",
        allowed_formats: ["jpg", "png", "jpeg"],
      };
    } else if (file.fieldname === "file") {
      return {
        folder: "chat/files",
        resource_type: "raw",
        public_id: file.originalname.split(".")[0],
        format: file.originalname.split(".").pop(),
      };
    }
    return {};
  },
});
const uploadChat = multer({ storage: storageChat });

module.exports = { cloudinary, uploadImage, uploadChat };
