const mongoose = require("mongoose");
const DepartmentService = require("../../service/common/DepartmentService");
const { DataResponse, ExceptionResponse } = require("../../utils/response");

// GET /api/list-department
const getAllDepartments = async (req, res) => {
  try {
    const departments = await DepartmentService.getAllDepartments();
    return res.status(200).json(new DataResponse(departments, "Lấy danh sách phòng/khoa thành công", 'success'));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phòng/khoa:", error);
    return res.status(500).json(new ExceptionResponse("Lỗi server", error.message, 'error'));
  }
};

// GET /api/department/:id
const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(new ExceptionResponse("ID không hợp lệ", undefined, 'error'));
    }

    const department = await DepartmentService.getDepartmentById(id);
    return res.status(200).json(new DataResponse(department, "Lấy thông tin phòng/khoa thành công", 'success'));
  } catch (error) {
    console.error("Lỗi khi lấy thông tin phòng/khoa:", error);
    
    if (error.message.includes("Không tìm thấy")) {
      return res.status(404).json(new ExceptionResponse(error.message, undefined, 'error'));
    }
    
    return res.status(500).json(new ExceptionResponse("Lỗi server", error.message, 'error'));
  }
};

// POST /api/department
const createDepartment = async (req, res) => {
  try {
    const { name, description, logo } = req.body;
    
    if (!name) {
      return res.status(400).json(new ExceptionResponse("Tên phòng/khoa là bắt buộc", undefined, 'error'));
    }

    const department = await DepartmentService.createDepartment({ name, description, logo });
    return res.status(201).json(new DataResponse(department, "Tạo phòng/khoa thành công", 'success'));
  } catch (error) {
    console.error("Lỗi khi tạo phòng/khoa:", error);
    
    if (error.message.includes("đã tồn tại")) {
      return res.status(409).json(new ExceptionResponse(error.message, undefined, 'error'));
    }
    
    return res.status(500).json(new ExceptionResponse("Lỗi server", error.message, 'error'));
  }
};

// PUT /api/department/:id
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, logo } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(new ExceptionResponse("ID không hợp lệ", undefined, 'error'));
    }

    const department = await DepartmentService.updateDepartment(id, { name, description, logo });
    return res.status(200).json(new DataResponse(department, "Cập nhật phòng/khoa thành công", 'success'));
  } catch (error) {
    console.error("Lỗi khi cập nhật phòng/khoa:", error);
    
    if (error.message.includes("Không tìm thấy")) {
      return res.status(404).json(new ExceptionResponse(error.message, undefined, 'error'));
    }
    
    if (error.message.includes("đã tồn tại")) {
      return res.status(409).json(new ExceptionResponse(error.message, undefined, 'error'));
    }
    
    return res.status(500).json(new ExceptionResponse("Lỗi server", error.message, 'error'));
  }
};

// DELETE /api/department/:id
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(new ExceptionResponse("ID không hợp lệ", undefined, 'error'));
    }

    const result = await DepartmentService.deleteDepartment(id);
    return res.status(200).json(new DataResponse(result, "Xóa phòng/khoa thành công", 'success'));
  } catch (error) {
    console.error("Lỗi khi xóa phòng/khoa:", error);
    
    if (error.message.includes("Không tìm thấy")) {
      return res.status(404).json(new ExceptionResponse(error.message, undefined, 'error'));
    }
    
    return res.status(500).json(new ExceptionResponse("Lỗi server", error.message, 'error'));
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
