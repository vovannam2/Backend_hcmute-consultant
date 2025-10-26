const Question = require("../../models/Question");
const User = require("../../models/User");
const Notification = require("../../models/Notification");
const ForwardQuestion = require("../../models/ForwardQuestion");
const Department = require("../../models/Department");
const { createAndSendNotification } = require("../common/notificationHelper");

exports.forwardQuestion = async (questionId, managerUser, targetDepartmentId, reason, io = null) => {
  if (managerUser.role !== "TUVANVIEN") {
    throw new Error("Không có quyền");
  }

  const question = await Question.findById(questionId);
  if (!question || question.statusDelete) {
    throw new Error("Không tìm thấy câu hỏi");
  }

  // Chỉ cho phép forward khi câu hỏi thuộc khoa của trưởng ban hiện tại
  if (String(question.department) !== String(managerUser.department)) {
    throw new Error("Không thuộc khoa của bạn");
  }

  // Lấy thông tin khoa gốc và khoa đích
  const fromDepartment = await Department.findById(question.department);
  const toDepartment = await Department.findById(targetDepartmentId);

  if (!fromDepartment || !toDepartment) {
    throw new Error("Không tìm thấy thông tin khoa");
  }

  // Tạo ForwardQuestion record để theo dõi việc chuyển tiếp
  const forwardQuestion = new ForwardQuestion({
    question: question._id,
    fromDepartment: question.department,
    toDepartment: targetDepartmentId,
    title: question.title,
    statusForward: true,
    createdBy: managerUser.id
  });

  await forwardQuestion.save();

  // Cập nhật department của câu hỏi và lưu originalDepartment
  const originalDepartment = question.department;
  question.department = targetDepartmentId;
  question.originalDepartment = originalDepartment; // Lưu khoa gốc
  await question.save();

  // Lấy tất cả tư vấn viên của khoa mới
  const consultants = await User.find({
    role: "TUVANVIEN",
    department: targetDepartmentId
  });

  // Gửi thông báo cho tất cả tư vấn viên của khoa mới
  if (consultants.length > 0) {
    const notificationPromises = consultants.map(async (consultant) => {
      const content = `Câu hỏi "${question.title}" đã được chuyển từ ${fromDepartment.name} đến ${toDepartment.name}. Lý do: ${reason || "Không có lý do cụ thể"}.`;
      
      if (io) {
        // Gửi qua socket nếu có io instance
        return await createAndSendNotification(
          io,
          managerUser.id,
          consultant._id,
          content,
          "QUESTION",
          question._id
        );
      } else {
        // Chỉ tạo notification trong DB nếu không có socket
        return await Notification.create({
          senderId: managerUser.id,
          receiverId: consultant._id,
          content,
          notificationType: "QUESTION",
          questionId: question._id,
          status: "UNREAD"
        });
      }
    });

    await Promise.all(notificationPromises);
  }

  return forwardQuestion;
};

// Lấy danh sách forward questions với pagination và filter
exports.getForwardQuestions = async (queryParams, user) => {
  const {
    page = 0,
    size = 5,
    sortBy = 'createdAt',
    sortDir = 'desc',
    title,
    startDate,
    endDate
  } = queryParams;

  // Tạo filter object
  const filter = {};
  
  // Filter theo department của user đang đăng nhập
  if (user && user.department) {
    filter.fromDepartment = user.department; // Chỉ hiển thị forward questions có khoa gốc là khoa của user
  }
  
  
  if (title) {
    filter.title = { $regex: title, $options: 'i' };
  }
  
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = endDateTime;
    }
  }

  // Tạo sort object
  const sort = {};
  sort[sortBy] = sortDir === 'desc' ? -1 : 1;

  // Thực hiện query với pagination
  const skip = parseInt(page) * parseInt(size);
  const limit = parseInt(size);

  const [forwardQuestions, totalElements] = await Promise.all([
    ForwardQuestion.find(filter)
      .populate('question', 'title content')
      .populate('fromDepartment', 'name')
      .populate('toDepartment', 'name')
      .populate('consultant', 'fullName')
      .populate('createdBy', 'fullName')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    ForwardQuestion.countDocuments(filter)
  ]);

  // Format data để khớp với frontend
  const formattedQuestions = forwardQuestions.map(fq => ({
    id: fq._id.toString(),
    title: fq.title,
    fromDepartment: {
      id: fq.fromDepartment._id.toString(),
      name: fq.fromDepartment.name
    },
    toDepartment: {
      id: fq.toDepartment._id.toString(),
      name: fq.toDepartment.name
    },
    consultant: {
      id: fq.consultant ? fq.consultant._id.toString() : '',
      name: fq.consultant ? fq.consultant.fullName : ''
    },
    statusForward: fq.statusForward,
    createdBy: fq.createdBy ? fq.createdBy.fullName : '',
    createdAt: fq.createdAt.toISOString(),
    questionId: fq.question ? fq.question._id.toString() : ''
  }));

  const totalPages = Math.ceil(totalElements / limit);

  return {
    content: formattedQuestions,
    totalElements,
    totalPages,
    size: limit,
    number: parseInt(page)
  };
};

// Cập nhật forward question
exports.updateForwardQuestion = async (id, updateData, user) => {
  const forwardQuestion = await ForwardQuestion.findById(id)
    .populate('fromDepartment', 'name')
    .populate('toDepartment', 'name')
    .populate('consultant', 'fullName');

  if (!forwardQuestion) {
    throw new Error("Không tìm thấy câu hỏi chuyển tiếp");
  }

  // Kiểm tra quyền (chỉ người tạo hoặc admin mới được sửa)
  if (String(forwardQuestion.createdBy) !== String(user.id) && user.role !== 'ADMIN') {
    throw new Error("Không có quyền sửa câu hỏi chuyển tiếp này");
  }

  // Cập nhật các trường được phép
  if (updateData.title) {
    forwardQuestion.title = updateData.title;
  }
  
  if (updateData.toDepartment) {
    forwardQuestion.toDepartment = updateData.toDepartment;
  }
  
  if (updateData.consultant) {
    forwardQuestion.consultant = updateData.consultant;
  }

  await forwardQuestion.save();

  // Populate lại để trả về đầy đủ thông tin
  await forwardQuestion.populate([
    { path: 'fromDepartment', select: 'name' },
    { path: 'toDepartment', select: 'name' },
    { path: 'consultant', select: 'fullName' },
    { path: 'createdBy', select: 'fullName' }
  ]);

  return forwardQuestion;
};

// Xóa forward question
exports.deleteForwardQuestion = async (id, user) => {
  const forwardQuestion = await ForwardQuestion.findById(id);

  if (!forwardQuestion) {
    throw new Error("Không tìm thấy câu hỏi chuyển tiếp");
  }

  // Kiểm tra quyền (chỉ người tạo hoặc admin mới được xóa)
  if (String(forwardQuestion.createdBy) !== String(user.id) && user.role !== 'ADMIN') {
    throw new Error("Không có quyền xóa câu hỏi chuyển tiếp này");
  }

  await ForwardQuestion.findByIdAndDelete(id);
  return { message: "Đã xóa câu hỏi chuyển tiếp thành công" };
};

