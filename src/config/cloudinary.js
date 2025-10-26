const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const sanitizeBaseName = (filename) => {
  const base = path.parse(filename).name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return base || 'file';
};

// xác định resource_type rõ ràng theo mimetype
const decideResourceType = (mimetype) => {
  if (
    mimetype === 'application/pdf' ||
    mimetype === 'application/msword' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) return 'raw';
  if (mimetype.startsWith('image/')) return 'image';
  return 'auto';
};

const storageAny = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = path.extname(file.originalname).replace('.', '').toLowerCase(); // 'pdf' | 'doc' | 'docx' | 'jpg'...
    const isImage = file.mimetype.startsWith('image/');
    const isDoc   = ['pdf','doc','docx'].includes(ext);

    const folder = isImage ? 'uploads/images' : 'uploads/files';
    const baseName = sanitizeBaseName(file.originalname); // KHÔNG thêm Date.now() nếu muốn URL gọn

    return {
      folder,
      public_id: baseName,                  // giữ tên gốc (không cần nối timestamp)
      resource_type: isDoc ? 'raw' : 'image',
      use_filename: true,
      unique_filename: false,
      access_mode: 'public',
      invalidate: true,
      type: 'upload',
      ...(isDoc ? { format: ext } : {}),    // <<<< QUAN TRỌNG: thêm đuôi cho raw
    };
  },
});

const storageImageOnly = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const publicId = `${sanitizeBaseName(file.originalname)}`;
    return {
      folder: 'uploads/avatars',
      public_id: publicId,
      resource_type: 'image',
      use_filename: true,
      unique_filename: false,
      access_mode: 'public',
      invalidate: true,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      type: 'upload',
    };
  },
});

const fileFilterAny = (req, file, cb) => {
  const ok =
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/msword' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  if (!ok) return cb(new Error('Chỉ cho phép ảnh hoặc PDF/DOC/DOCX.'), false);
  cb(null, true);
};

const uploadAny = multer({
  storage: storageAny,
  fileFilter: fileFilterAny,
  limits: { fileSize: 20 * 1024 * 1024 },
});

const uploadImageOnly = multer({
  storage: storageImageOnly,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Chỉ cho phép ảnh (jpg, png, jpeg, webp).'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = { cloudinary, uploadAny, uploadImageOnly };
