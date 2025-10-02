const Field = require("../../models/Field");
const mongoose = require("mongoose");

// Lấy fields theo department
const getFieldsByDepartment = async (departmentId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      throw new Error("departmentId không hợp lệ");
    }

    const fields = await Field.find({ department: departmentId })
      .select('name createdAt updatedAt')
      .sort({ name: 1 });

    return fields;
  } catch (error) {
    throw new Error(`Lỗi khi lấy danh sách lĩnh vực: ${error.message}`);
  }
};

// Lấy field theo ID
const getFieldById = async (fieldId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(fieldId)) {
      throw new Error("fieldId không hợp lệ");
    }

    const field = await Field.findById(fieldId)
      .populate('department', 'name')
      .select('name department createdAt updatedAt');

    if (!field) {
      throw new Error("Không tìm thấy lĩnh vực");
    }

    return field;
  } catch (error) {
    throw new Error(`Lỗi khi lấy thông tin lĩnh vực: ${error.message}`);
  }
};

// Tạo field mới
const createField = async (fieldData) => {
  try {
    const { name, department } = fieldData;
    
    if (!mongoose.Types.ObjectId.isValid(department)) {
      throw new Error("department không hợp lệ");
    }

    const field = new Field({ name, department });
    await field.save();
    
    return field;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Tên lĩnh vực đã tồn tại trong phòng/khoa này");
    }
    throw new Error(`Lỗi khi tạo lĩnh vực: ${error.message}`);
  }
};

// Cập nhật field
const updateField = async (fieldId, updateData) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(fieldId)) {
      throw new Error("fieldId không hợp lệ");
    }

    const field = await Field.findByIdAndUpdate(
      fieldId,
      updateData,
      { new: true, runValidators: true }
    ).select('name department createdAt updatedAt');

    if (!field) {
      throw new Error("Không tìm thấy lĩnh vực");
    }

    return field;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Tên lĩnh vực đã tồn tại");
    }
    throw new Error(`Lỗi khi cập nhật lĩnh vực: ${error.message}`);
  }
};

// Xóa field
const deleteField = async (fieldId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(fieldId)) {
      throw new Error("fieldId không hợp lệ");
    }

    const field = await Field.findByIdAndDelete(fieldId);
    
    if (!field) {
      throw new Error("Không tìm thấy lĩnh vực");
    }

    return { message: "Xóa lĩnh vực thành công" };
  } catch (error) {
    throw new Error(`Lỗi khi xóa lĩnh vực: ${error.message}`);
  }
};

module.exports = {
  getFieldsByDepartment,
  getFieldById,
  createField,
  updateField,
  deleteField
};
