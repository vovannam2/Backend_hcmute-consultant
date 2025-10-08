const bcrypt = require('bcrypt');
const Answer = require("../../models/Answer");
const Question = require("../../models/Question");
const User = require("../../models/User");
const Notification = require("../../models/Notification");
const mongoose = require("mongoose");

exports.getPendingAnswers = async (user, query) => {
  if (user.role !== "TRUONGBANTUVAN") throw new Error("Không có quyền");

  const { page = 0, size = 10, sortBy = "createdAt", sortDir = "desc" } = query;

  const filter = { statusApproval: false, statusAnswer: true };
  const departmentId = user.department;

  const data = await Answer.find(filter)
    .populate({
      path: "question",
      match: { department: departmentId },
      populate: { path: "user", select: "username firstName lastName email" },
    })
    .populate("user", "username firstName lastName email")
    .sort({ [sortBy]: sortDir === "desc" ? -1 : 1 })
    .skip(Number(page) * Number(size))
    .limit(Number(size));

  const filtered = data.filter((a) => a.question);
  const total = await Answer.countDocuments({
    ...filter,
    question: { $in: filtered.map((a) => a.question._id) },
  });

  return { data: filtered, total, page: Number(page), size: Number(size) };
};

exports.approveAnswer = async (answerId, user) => {
  if (user.role !== "TRUONGBANTUVAN") throw new Error("Không có quyền");
  const answer = await Answer.findById(answerId).populate("question");
  if (!answer) throw new Error("Không tìm thấy câu trả lời");
  if (String(answer.question.department) !== String(user.department))
    throw new Error("Không thuộc khoa của bạn");

  answer.statusApproval = true;
  await answer.save();

  await Notification.create({
    senderId: user.id,
    receiverId: answer.user,
    content: `Câu trả lời cho câu hỏi "${answer.question.title}" đã được duyệt.`,
    notificationType: "SYSTEM",
  });
};

exports.rejectAnswer = async (answerId, user, reason) => {
  if (!reason) throw new Error("Cần nhập lý do");
  if (user.role !== "TRUONGBANTUVAN") throw new Error("Không có quyền");

  const answer = await Answer.findById(answerId).populate("question");
  if (!answer) throw new Error("Không tìm thấy câu trả lời");
  if (String(answer.question.department) !== String(user.department))
    throw new Error("Không thuộc khoa của bạn");

  answer.statusApproval = false;
  await answer.save();

  await Notification.create({
    senderId: user.id,
    receiverId: answer.user,
    content: `Câu trả lời cho câu hỏi "${answer.question.title}" bị từ chối: ${reason}`,
    notificationType: "SYSTEM",
  });
};

// exports.sendFeedback = async (answerId, user, feedback) => {
//   if (!feedback) throw new Error("Cần nội dung phản hồi");
//   if (user.role !== "TRUONGBANTUVAN") throw new Error("Không có quyền");

//   const answer = await Answer.findById(answerId).populate("question");
//   if (!answer) throw new Error("Không tìm thấy câu trả lời");
//   if (String(answer.question.department) !== String(user.department))
//     throw new Error("Không thuộc khoa của bạn");

//   await Notification.create({
//     senderId: user._id,
//     receiverId: answer.user,
//     content: `Phản hồi từ Trưởng ban tư vấn: ${feedback}`,
//     notificationType: "MESSAGE",
//   });
// };

exports.getConsultantsByDepartment = async (departmentId) => {
  // Lấy tất cả user có role TUVANVIEN và cùng khoa
  return await User.find(
  { role: "TUVANVIEN", department: departmentId }
  ).select("-password -refreshToken -__v -verifyCodeAttemptCount -provider -isActivity -isOnline -isVerified");
 // Ẩn password
};

exports.addConsultant = async (data, managerUser) => {
  if (managerUser.role !== "TRUONGBANTUVAN") {
    throw new Error("Không có quyền thêm tư vấn viên");
  }

  const existed = await User.findOne({ email: data.email });
  if (existed) throw new Error("Email đã tồn tại");

  // 🔒 Hash mật khẩu trước khi lưu
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const consultant = await User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    username: data.email,
    phone: data.phone || null,
    password: hashedPassword,  
    role: "TUVANVIEN",
    department: managerUser.department,
    isVerified: true,
    provider: "local",
  });

  const result = consultant.toObject();
  delete result.password;
  delete result.refreshToken;
  delete result.__v;

  return result;
};

exports.updateConsultant = async (managerUser, consultantId, data) => {
  if (managerUser.role !== "TRUONGBANTUVAN") {
    throw new Error("Không có quyền");
  }

  const consultant = await User.findOne({
    _id: consultantId,
    role: "TUVANVIEN",
    department: managerUser.department
  });
  if (!consultant) {
    throw new Error("Không tìm thấy tư vấn viên trong khoa");
  }

  // Cho phép chỉnh sửa các trường
  const allowedFields = ["firstName", "lastName", "phone", "email", "password"];

  for (const f of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(data, f)) {
      if (f === "password") {
        // hash mật khẩu mới
        consultant.password = await bcrypt.hash(data.password, 10);
      } else {
        consultant[f] = data[f];
      }
    }
  }

  await consultant.save();
  return consultant;
};

exports.deleteConsultant = async (managerUser, consultantId) => {
  // 1. Kiểm tra quyền
  if (managerUser.role !== "TRUONGBANTUVAN") {
    throw new Error("Không có quyền");
  }

  // 2. Tìm tư vấn viên
  const consultant = await User.findById(consultantId);
  if (!consultant) throw new Error("Không tìm thấy tư vấn viên");
  if (consultant.role !== "TUVANVIEN") throw new Error("Không phải tư vấn viên");

  // 3. Chỉ xóa khi cùng khoa
  if (String(consultant.department) !== String(managerUser.department)) {
    throw new Error("Không thuộc khoa của bạn");
  }

  // 4. Xóa (hard delete hoặc soft delete tuỳ nhu cầu)
  await User.findByIdAndDelete(consultantId);

  return { id: consultantId };
};

exports.getConsultantPerformance = async (managerUser, consultantId) => {
  // Chỉ trưởng ban
  if (managerUser.role !== "TRUONGBANTUVAN")
    throw new Error("Không có quyền");

  // Lấy thông tin tư vấn viên
  const consultant = await User.findById(consultantId);
  if (!consultant || consultant.role !== "TUVANVIEN")
    throw new Error("Không tìm thấy tư vấn viên");

  // Kiểm tra cùng khoa
  if (String(consultant.department) !== String(managerUser.department))
    throw new Error("Không thuộc khoa của bạn");

  // Thống kê hiệu suất: tổng câu trả lời, đã duyệt, chờ duyệt…
  const totalAnswers = await Answer.countDocuments({ user: consultantId });
  const approvedAnswers = await Answer.countDocuments({
    user: consultantId,
    statusApproval: true,
  });
  const pendingAnswers = await Answer.countDocuments({
    user: consultantId,
    statusApproval: false,
    statusAnswer: true,
  });

  return {
    consultant: {
      id: consultant._id,
      firstName: consultant.firstName,
      lastName: consultant.lastName,
      email: consultant.email,
      department: consultant.department,
    },
    stats: {
      totalAnswers,
      approvedAnswers,
      pendingAnswers,
      approvalRate:
        totalAnswers > 0
          ? Math.round((approvedAnswers / totalAnswers) * 100)
          : 0,
    },
  };
};