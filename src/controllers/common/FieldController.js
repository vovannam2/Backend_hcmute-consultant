const FieldService = require("../../service/common/FieldService");
const { DataResponse, ExceptionResponse } = require("../../utils/response");

// GET /api/list-field-by-department
const getFieldsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.query;
    
    if (!departmentId) {
      return res.status(400).json(new ExceptionResponse("departmentId là bắt buộc", undefined, 'error'));
    }

    const fields = await FieldService.getFieldsByDepartment(departmentId);
    return res.status(200).json(new DataResponse(fields, "Lấy danh sách lĩnh vực thành công", 'success'));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách lĩnh vực:", error);
    return res.status(500).json(new ExceptionResponse("Lỗi server", error.message, 'error'));
  }
};

// GET /api/field/:id
const getFieldById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const field = await FieldService.getFieldById(id);
    return res.status(200).json(new DataResponse(field, "Lấy thông tin lĩnh vực thành công", 'success'));
  } catch (error) {
    console.error("Lỗi khi lấy thông tin lĩnh vực:", error);
    
    if (error.message.includes("Không tìm thấy")) {
      return res.status(404).json(new ExceptionResponse(error.message, undefined, 'error'));
    }
    
    return res.status(500).json(new ExceptionResponse("Lỗi server", error.message, 'error'));
  }
};

module.exports = {
  getFieldsByDepartment,
  getFieldById
};
