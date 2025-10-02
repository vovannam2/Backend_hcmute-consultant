const { DataResponse, ExceptionResponse } = require("../../utils/response");

// GET /api/user/question/role-ask
const getRoleAskList = async (req, res) => {
  try {
    // Danh sách vai trò cố định theo enum trong Question model
    const roleAskList = [
      {
        id: 1,
        name: "SINHVIEN",
        description: "Sinh viên đang học tại trường"
      },
      {
        id: 2, 
        name: "GIANGVIEN",
        description: "Giảng viên của trường"
      },
      {
        id: 3,
        name: "NHANVIEN", 
        description: "Nhân viên của trường"
      },
      {
        id: 4,
        name: "USER",
        description: "Người dùng khác"
      }
    ];

    return res.status(200).json(new DataResponse(roleAskList, "Lấy danh sách vai trò thành công", 'success'));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách vai trò:", error);
    return res.status(500).json(new ExceptionResponse("Lỗi server", error.message, 'error'));
  }
};

module.exports = {
  getRoleAskList
};
