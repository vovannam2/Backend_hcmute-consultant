const Question = require("../../models/Question");
const Department = require("../../models/Department");
const Field = require("../../models/Field");
const DeletionLog = require("../../models/DeletionLog");
const Notification = require("../../models/Notification");
const mongoose = require("mongoose");

exports.createQuestion = async (data, userId) => {
  const { departmentId, fieldId, roleAsk, title, content, statusPublic, fileName } = data;
  
  const department = await Department.findById(departmentId);
  if (!department) throw new Error("Không tìm thấy phòng ban");

  const field = await Field.findById(fieldId);
  if (!field) throw new Error("Không tìm thấy lĩnh vực");

  const question = new Question({
    title,
    content,
    fileName,
    user: userId,
    department: departmentId,
    field: fieldId,
    roleAsk,
    statusPublic: statusPublic ?? true,
    statusAnswer: false,
  });

  await question.save();
  return question;
};

exports.updateQuestion = async (questionId, data, userId) => {
  const question = await Question.findById(questionId);
  if (!question) throw new Error("Không tìm thấy câu hỏi");

  if (String(question.user) !== String(userId)) {
    throw new Error("Không có quyền sửa");
  }

  if (question.statusAnswer === true) {
    throw new Error("Câu hỏi đã có câu trả lời, không thể chỉnh sửa");
  }

  Object.assign(question, {
    title: data.title ?? question.title,
    content: data.content ?? question.content,
    department: data.departmentId ?? question.department,
    field: data.fieldId ?? question.field,
    roleAsk: data.roleAsk ?? question.roleAsk,
    statusPublic: data.statusPublic ?? question.statusPublic,
    fileName: data.fileName || question.fileName,
  });

  await question.save();
  return question;
};

// DELETE QUESTION (USER)
exports.deleteQuestion = async (questionId, userId, reason) => {
  const question = await Question.findById(questionId);
  if (!question) throw new Error("Không tìm thấy câu hỏi");

  if (String(question.user) !== String(userId)) {
    throw new Error("Không có quyền xóa");
  }

  question.statusDelete = true;
  await question.save();

  const log = new DeletionLog({
    question: question._id,
    reason,
    deletedBy: userId,
  });
  await log.save();

  return true;
};

exports.createFollowUpQuestion = async (data, userId, fileName) => {
  const { parentQuestionId, title, content } = data;

  const parent = await Question.findById(parentQuestionId);
  if (!parent) throw new Error("Câu hỏi cha không tồn tại");

  const followUp = new Question({
    title,
    content,
    parentQuestion: parent._id,
    user: userId,
    fileName,
    department: parent.department,
    field: parent.field,
    roleAsk: parent.roleAsk,
  });

  await followUp.save();
  return followUp;
};

// lọc
exports.getQuestions = async (query) => {
  const {
    statusApproval,
    statusAnswer,
    title,
    departmentId,
    status,
    startDate,
    endDate,
    page = 0,
    size = 10,
    sortBy = "createdAt",
    sortDir = "desc",
  } = query;

  const filter = { statusDelete: false };
  if (statusApproval !== undefined) filter.statusApproval = statusApproval;
  if (statusAnswer !== undefined) filter.statusAnswer = statusAnswer;
  if (title) filter.title = { $regex: title, $options: "i" };
  if (departmentId) filter.department = departmentId;
  if (status) filter.statusPublic = statusPublic === "true";

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const data = await Question.find(filter)
    .sort({ [sortBy]: sortDir === "desc" ? -1 : 1 })
    .skip(Number(page) * Number(size))
    .limit(Number(size))
    .populate("user department field");

  const total = await Question.countDocuments(filter);

  return { data, total, page: Number(page), size: Number(size) };
};

//get question of me
exports.getMyQuestions = async (userId, query) => {
  const {
    page = 0,
    size = 10,
    sortBy = "createdAt",
    sortDir = "desc",
  } = query;

  const filter = {
    statusDelete: false,
    user: new mongoose.Types.ObjectId(userId)
  };

  const data = await Question.find(filter)
    .sort({ [sortBy]: sortDir === "desc" ? -1 : 1 })
    .skip(Number(page) * Number(size))
    .limit(Number(size))
    .populate("user department field");

  const total = await Question.countDocuments(filter);

  return { data, total, page: Number(page), size: Number(size) };
};

//DELETE QUESTION (TUVANVIEN)
exports.deleteQuestionByAdmin = async (questionId, user, reason) => {
  const question = await Question.findById(questionId);
  if (!question) throw new Error("Câu hỏi không tồn tại");

  if (!["TUVANVIEN"].includes(user.role)) {
    throw new Error("Không có quyền xóa câu hỏi này");
  }

  if (!reason) throw new Error("Cần lý do xóa");

  question.statusDelete = true;
  await question.save();

  const log = new DeletionLog({
    question: question._id,
    reason,
    deletedBy: user.id,
  });
  await log.save();

  const notification = new Notification({
    senderId: user.id,
    receiverId: question.user,
    content: `Câu hỏi của bạn đã bị xóa: ${reason}`,
    notificationType: "SYSTEM",
  });
  await notification.save();

  return true;
};

exports.getQuestionById = async (questionId) => {
  const question = await Question.findById(questionId).populate(
    "user department field subQuestions"
  );
  if (!question) throw new Error("Không tìm thấy câu hỏi");
  return question;
};

//Search questions by title and content
exports.searchQuestions = async (keyword, query) => {
  const {
    page = 0,
    size = 10,
  } = query;

  if (!keyword) {
    return { data: [], total: 0, page: Number(page), size: Number(size) };
  }

  const filter = {
    $text: { $search: keyword },
    statusDelete: false
  };

  const data = await Question.find(filter, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .skip(Number(page) * Number(size))
    .limit(Number(size));

  const total = await Question.countDocuments(filter);

  return { data, total, page: Number(page), size: Number(size) };
};

/// sau test 
exports.getDeletionLogs = async (query) => {
  const { page = 0, size = 10 } = query;

  const logs = await DeletionLog.find()
    .sort({ createdAt: -1 })
    .skip(Number(page) * Number(size))
    .limit(Number(size))
    .populate("question");

  const total = await DeletionLog.countDocuments();

  return { content: logs, totalElements: total, page: Number(page), size: Number(size) };
};

// sau test
exports.getDeletionLogDetail = async (id) => {
  const log = await DeletionLog.findById(id).populate("question");
  if (!log) throw new Error("Không tìm thấy log");
  return log;
};
