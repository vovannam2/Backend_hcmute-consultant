const UserService = require("../../service/common/UserService");
const { DataResponse, ExceptionResponse } = require("../../utils/response");
const bcrypt = require("bcrypt");

// GET /api/user/online-consultants
const getOnlineConsultants = async (req, res) => {
  try {
    const consultants = await UserService.getOnlineConsultants();
    return res.status(200).json(new DataResponse(consultants, "Lấy danh sách tư vấn viên đang online thành công", 'success'));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tư vấn viên online:", error);
    return res.status(500).json(new ExceptionResponse("Lỗi server", error.message, 'error'));
  }
};

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
      return res.status(400).json(new ExceptionResponse("Không có file upload", undefined, 'error'));
    }

    const userId = req.userId || req.user.sub || req.user.id;
    const updatedUser = await UserService.updateProfile(userId, {
      avatarUrl: req.file.path,
    });

    return res.status(200).json(new DataResponse({
      avatarUrl: updatedUser.avatarUrl
    }, "Upload avatar thành công", 'success'));
  } catch (error) {
    console.error("Lỗi khi upload avatar:", error);
    return res.status(500).json(new ExceptionResponse("Lỗi server", error.message, 'error'));
  }
};

// GET /api/user/consultants-by-department
const getConsultantsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.query;
    
    if (!departmentId) {
      return res.status(400).json(new ExceptionResponse("Thiếu departmentId", undefined, 'error'));
    }

    const consultants = await UserService.getConsultantsByDepartment(departmentId);
    return res.status(200).json(new DataResponse(consultants, "Lấy danh sách tư vấn viên thành công", 'success'));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tư vấn viên:", error);
    return res.status(500).json(new ExceptionResponse("Lỗi server", error.message, 'error'));
  }
};

// GET /api/list-consultant
const getAllConsultants = async (req, res) => {
  try {
    const { page = 0, size = 10, sortBy = 'firstName', sortDir = 'asc', name, departmentId } = req.query;
    
    const result = await UserService.getAllConsultants({ page, size, sortBy, sortDir, name, departmentId });
    return res.status(200).json(new DataResponse(result, "Lấy danh sách tư vấn viên thành công", 'success'));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tư vấn viên:", error);
    return res.status(500).json(new ExceptionResponse("Lỗi server", error.message, 'error'));
  }
};

// GET /api/user/list-consultant/:id
const getConsultantById = async (req, res) => {
  try {
    const { id } = req.params;
    const consultant = await UserService.getConsultantById(id);
    return res.status(200).json(new DataResponse(consultant, "Lấy thông tin tư vấn viên thành công", 'success'));
  } catch (error) {
    console.error("Lỗi khi lấy thông tin tư vấn viên:", error);
    return res.status(500).json(new ExceptionResponse("Lỗi server", error.message, 'error'));
  }
};

// POST /api/user/change-password
const changePassword = async (req, res) => {
  try {
    const userId = req.userId || req.user.sub || req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json(new ExceptionResponse("Thiếu thông tin", undefined, 'error'));
    }

    // Get user by ID
    const user = await UserService.getProfile(userId);
    if (!user) {
      return res.status(404).json(new ExceptionResponse("Không tìm thấy người dùng", undefined, 'error'));
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json(new ExceptionResponse("Mật khẩu hiện tại không đúng", undefined, 'error'));
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await UserService.updateProfile(userId, { password: hashedPassword });

    return res.status(200).json(new DataResponse(null, "Đổi mật khẩu thành công", 'success'));
  } catch (error) {
    console.error("Lỗi khi đổi mật khẩu:", error);
    return res.status(500).json(new ExceptionResponse("Lỗi server", error.message, 'error'));
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  getConsultantsByDepartment,
  getOnlineConsultants,
  getAllConsultants,
  getConsultantById,
  changePassword,
};
