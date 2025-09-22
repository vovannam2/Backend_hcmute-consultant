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

const storageFile = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (file.mimetype.startsWith("image/")) {
      // Nếu là ảnh
      return {
        folder: "uploads/images",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      };
    }
    // Nếu là tệp bất kỳ
    return {
      folder: "uploads/files",
      resource_type: "raw",
      public_id: file.originalname.split(".")[0],
      format: file.originalname.split(".").pop(),
    };
  },
});
const uploadFile = multer({ storage: storageFile });

module.exports = { cloudinary, uploadImage, uploadFile };
