const Department = require("../../models/Department");

// Lấy tất cả departments
const getAllDepartments = async () => {
  try {
    const departments = await Department.find({})
      .select('name description logo createdAt updatedAt')
      .sort({ name: 1 }); // Sắp xếp theo tên A-Z

    return departments;
  } catch (error) {
    throw new Error(`Lỗi khi lấy danh sách phòng/khoa: ${error.message}`);
  }
};

// Lấy department theo ID
const getDepartmentById = async (departmentId) => {
  try {
    const department = await Department.findById(departmentId)
      .select('name description logo createdAt updatedAt');

    if (!department) {
      throw new Error("Không tìm thấy phòng/khoa");
    }

    return department;
  } catch (error) {
    throw new Error(`Lỗi khi lấy thông tin phòng/khoa: ${error.message}`);
  }
};

// Tạo department mới
const createDepartment = async (departmentData) => {
  try {
    const department = new Department(departmentData);
    await department.save();
    return department;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Tên phòng/khoa đã tồn tại");
    }
    throw new Error(`Lỗi khi tạo phòng/khoa: ${error.message}`);
  }
};

// Cập nhật department
const updateDepartment = async (departmentId, updateData) => {
  try {
    const department = await Department.findByIdAndUpdate(
      departmentId,
      updateData,
      { new: true, runValidators: true }
    ).select('name description logo createdAt updatedAt');

    if (!department) {
      throw new Error("Không tìm thấy phòng/khoa");
    }

    return department;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Tên phòng/khoa đã tồn tại");
    }
    throw new Error(`Lỗi khi cập nhật phòng/khoa: ${error.message}`);
  }
};

// Xóa department
const deleteDepartment = async (departmentId) => {
  try {
    const department = await Department.findByIdAndDelete(departmentId);
    
    if (!department) {
      throw new Error("Không tìm thấy phòng/khoa");
    }

    return { message: "Xóa phòng/khoa thành công" };
  } catch (error) {
    throw new Error(`Lỗi khi xóa phòng/khoa: ${error.message}`);
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
