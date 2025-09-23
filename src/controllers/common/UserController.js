const UserService = require("../../service/common/UserService");

// GET /api/user/profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await UserService.getProfile(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin user:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// PUT /api/user/profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const updatedUser = await UserService.updateProfile(userId, updateData);

    return res.status(200).json(updatedUser);
  } catch (error) {
    // Bắt lỗi duplicate key MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `${field} đã tồn tại`,
        field: field,
        value: error.keyValue[field]
      });
    }

    // Bắt lỗi validation của Mongoose
    if (error.name === "ValidationError") {
      const errors = Object.keys(error.errors).map((field) => ({
        field,
        message: error.errors[field].message
      }));
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        errors
      });
    }

    // Các lỗi khác
    console.error("Lỗi khi cập nhật user:", error);
    return res.status(500).json({
      message: "Lỗi server",
      error: error.message
    });
  }
};


// POST /api/user/upload-avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "Không có file upload" });
    }

    const userId = req.user.id;
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
