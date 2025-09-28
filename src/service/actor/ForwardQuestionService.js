const Question = require("../../models/Question");
const User = require("../../models/User");
const Notification = require("../../models/Notification");

exports.forwardQuestion = async (questionId, managerUser, targetDepartmentId,  reason) => {
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

  // Cập nhật department
  question.department = targetDepartmentId;
  await question.save();

  // Lấy tất cả tư vấn viên của khoa mới
  const consultants = await User.find({
    role: "TUVANVIEN",
    department: targetDepartmentId
  });

  // Gửi thông báo cho tất cả tư vấn viên của khoa mới
  const notifications = consultants.map((c) => ({
  senderId: managerUser.id,
  receiverId: c._id,
  content: `Câu hỏi "${question.title}" đã được chuyển đến khoa của bạn. 
              Lý do: ${reason || "Không có lý do cụ thể"}.`,
  notificationType: "QUESTION",
  questionId: question._id
}));


  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  return question;
};

