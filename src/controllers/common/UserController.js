const UserService = require("../../service/common/UserService");
const { DataResponse, ExceptionResponse } = require("../../utils/response");

// GET /api/user/profile
const getProfile = async (req, res) => {
  try {
    const userId = req.userId || req.user.sub || req.user.id;
    const user = await UserService.getProfile(userId);
    if (!user) {
      return res.status(404).json(new ExceptionResponse("Không tìm thấy người dùng", undefined, 'error'));
    }
    return res.status(200).json(new DataResponse(user, "Get profile successful", 'success'));
  } catch (error) {
    console.error("Lỗi khi lấy thông tin user:", error);
    return res.status(500).json(new ExceptionResponse("Lỗi server", error.message, 'error'));
  }
};

// PUT /api/user/profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId || req.user.sub || req.user.id;
    const updateData = req.body;

    const updatedUser = await UserService.updateProfile(userId, updateData);

    return res.status(200).json(new DataResponse(updatedUser, "Update profile successful", 'success'));
  } catch (error) {
    // Bắt lỗi duplicate key MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json(new ExceptionResponse(`${field} đã tồn tại`, { field, value: error.keyValue[field] }, 'error'));
    }

    // Bắt lỗi validation của Mongoose
    if (error.name === "ValidationError") {
      const errors = Object.keys(error.errors).map((field) => ({
        field,
        message: error.errors[field].message
      }));
      return res.status(400).json(new ExceptionResponse("Dữ liệu không hợp lệ", errors, 'error'));
    }

    // Các lỗi khác
    console.error("Lỗi khi cập nhật user:", error);
    return res.status(500).json(new ExceptionResponse("Lỗi server", error.message, 'error'));
  }
};


// POST /api/user/upload-avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "Không có file upload" });
    }

    const userId = req.userId || req.user.sub || req.user.id;
    const updatedUser = await UserService.updateProfile(userId, {
      avatarUrl: req.file.path,
    });

    return res.status(200).json({
      message: "Upload avatar thành công",
      avatarUrl: updatedUser.avatarUrl,
    });
  } catch (error) {
    console.error("Lỗi khi upload avatar:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar, 
};
