const { cloudinary } = require("../../config/cloudinary");
const { DataResponse, ExceptionResponse } = require("../../utils/response");

exports.uploadFile = async (req, res, next) => {
  try {
    console.log('Upload file request received');
    console.log('req.file:', req.file);
    
    if (!req.file) {
      return res.status(400).json(new ExceptionResponse("Không có file được upload", undefined, 'error'));
    }

    // Upload file lên Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "chat/files",
      resource_type: "auto"
    });

    console.log('Upload successful:', result.secure_url);

    return res.status(200).json(new DataResponse(
      { fileUrl: result.secure_url },
      "Upload file thành công",
      'success'
    ));
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json(new ExceptionResponse(error.message, undefined, 'error'));
  }
};
