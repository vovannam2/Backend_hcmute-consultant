const Question = require("../../models/Question");
const Answer = require("../../models/Answer");
const Department = require("../../models/Department");
const Field = require("../../models/Field");
const DeletionLog = require("../../models/DeletionLog");
const Notification = require("../../models/Notification");
const LikeRecord = require("../../models/likeRecord");
const User = require("../../models/User");
const mongoose = require("mongoose");

exports.createQuestion = async (data, userId) => {
  const { departmentId, fieldId, roleAsk, title, content, statusPublic, fileUrl } = data;

  const department = await Department.findById(departmentId);
  if (!department) throw new Error("Không tìm thấy phòng ban");

  const field = await Field.findById(fieldId);
  if (!field) throw new Error("Không tìm thấy lĩnh vực");

  const question = new Question({
    title,
    content,
    fileUrl,
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
    fileUrl: data.fileUrl || question.fileUrl,
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

exports.createFollowUpQuestion = async (data, userId, fileUrl) => {
  const { parentQuestionId, title, content } = data;

  const parent = await Question.findById(parentQuestionId);
  if (!parent) throw new Error("Câu hỏi cha không tồn tại");

  const followUp = new Question({
    title,
    content,
    parentQuestion: parent._id,
    user: userId,
    fileUrl,
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
  const question = await Question.findById(questionId)
    .populate("user department field subQuestions answers");

  if (!question) throw new Error("Không tìm thấy câu hỏi");

  if (!question.answers || question.answers.length === 0) {
    question.statusAnswer = false;
  } else {
    question.statusAnswer = true;
  }

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

// ================== TƯ VẤN VIÊN ==================
exports.getPendingQuestions = async (query, user) => {
  const {
    page = 0,
    size = 10,
    sortBy = "createdAt",
    sortDir = "desc",
    fieldId,
    title,
  } = query;

  const filter = {
    statusDelete: false,
    statusApproval: false, // chưa duyệt
    statusAnswer: false,   // chưa có trả lời
  };

  if (user && user.role === "TUVANVIEN") {
    filter.department = user.department;
  }

  if (fieldId) filter.field = fieldId;
  if (title) filter.title = { $regex: title, $options: "i" };

  const data = await Question.find(filter)
    .sort({ [sortBy]: sortDir === "desc" ? -1 : 1 })
    .skip(Number(page) * Number(size))
    .limit(Number(size))
    .select("title content createdAt statusAnswer department field user")
    .populate("user", "username avatarUrl")
    .populate("department", "name")
    .populate("field", "name");

  const total = await Question.countDocuments(filter);

  return { data, total, page: Number(page), size: Number(size) };
};

exports.getAnsweredQuestions = async (query, user) => {
  const {
    page = 0,
    size = 10,
    sortBy = "createdAt",
    sortDir = "desc",
    departmentId,
    fieldId,
    title,
  } = query;

  const filter = {
    statusDelete: false,
    statusApproval: false,
    statusAnswer: true,
  };
  if (user && user.role === "TUVANVIEN") {
    filter.department = user.department;
  }
  if (fieldId) filter.field = fieldId;
  if (title) filter.title = { $regex: title, $options: "i" };

  const data = await Question.find(filter)
    .sort({ [sortBy]: sortDir === "desc" ? -1 : 1 })
    .skip(page * size)
    .limit(size)
    .select("title content createdAt statusAnswer department field user")
    .populate("user", "username avatarUrl")
    .populate("department", "name")
    .populate("field", "name");


  const total = await Question.countDocuments(filter);
  return { data, totalElements: total, page: Number(page), size: Number(size) };
};


// Tư vấn viên trả lời câu hỏi
exports.createAnswer = async (data, consultantId) => {
  const { questionId, content, fileUrl, roleConsultant, title } = data;

  const question = await Question.findById(questionId);
  if (!question || question.statusDelete)
    throw new Error("Không tìm thấy câu hỏi");

  if (question.statusAnswer) {
    throw new Error("Câu hỏi đã được trả lời");
  }

  const answer = new Answer({
    question: questionId,
    user: consultantId,
    roleConsultant,
    content,
    title,
    file: fileUrl
  });
  await answer.save();

  question.statusAnswer = true;
  await question.save();

  await Notification.create({
    senderId: consultantId,
    receiverId: question.user,
    content: `Câu hỏi "${question.title}" đã được tư vấn viên trả lời.`,
    notificationType: "ANSWER",
    answerId: answer._id
  });

  return answer;
};


// Chỉnh sửa câu trả lời
exports.updateAnswer = async (answerId, data, consultantId) => {
  const answer = await Answer.findById(answerId);
  if (!answer) throw new Error("Không tìm thấy câu trả lời");

  //  kiểm tra quyền bằng user
  if (String(answer.user) !== String(consultantId)) {
    throw new Error("Không có quyền chỉnh sửa câu trả lời này");
  }

  Object.assign(answer, {
    content: data.content ?? answer.content,
    file: data.fileUrl || answer.file,
    title: data.title ?? answer.title,
    roleConsultant: data.roleConsultant ?? answer.roleConsultant,
  });

  await answer.save();
  return answer;
};


// Gửi yêu cầu đánh giá câu trả lời
exports.requestAnswerReview = async (answerId, consultantId) => {
  const answer = await Answer.findById(answerId).populate("question");
  if (!answer) throw new Error("Không tìm thấy câu trả lời");

  // Kiểm tra quyền: chỉ người tạo answer (tư vấn viên) mới được yêu cầu review
  if (String(answer.user) !== String(consultantId)) {
    throw new Error("Không có quyền yêu cầu đánh giá");
  }

  // Đánh dấu answer cần review
  answer.statusReview = true;
  await answer.save();

  // 🔹 Tìm trưởng ban tư vấn cùng khoa/phòng ban của câu hỏi
  const departmentId = answer.question.department;
  const departmentHead = await User.findOne({
    role: "TRUONGBANTUVAN",
    department: departmentId
  });

  if (!departmentHead) {
    throw new Error("Không tìm thấy Trưởng ban tư vấn trong khoa/phòng ban này");
  }

  // Gửi thông báo cho Trưởng ban tư vấn
  await Notification.create({
    senderId: consultantId,
    receiverId: departmentHead._id,
    content: `Câu trả lời cho câu hỏi "${answer.question.title}" đã được gửi yêu cầu đánh giá.`,
    notificationType: "MESSAGE",
    answerId: answer._id
  });

  return true;
};

// Chi tiết câu hỏi dành cho tư vấn viên
exports.getQuestionDetailForConsultant = async (questionId) => {
  const question = await Question.findById(questionId)
    .populate(
      "user",
      // chỉ lấy những trường cần cho tư vấn viên
      "username firstName lastName studentCode avatarUrl email phone"
    )
    .select(
      "_id title content roleAsk views statusApproval statusPublic statusDelete statusAnswer createdAt updatedAt"
    );

  if (!question) throw new Error("Không tìm thấy câu hỏi");

  return question;
};

// LIKE QUESTION
exports.likeQuestion = async (questionId, userId) => {
  const question = await Question.findById(questionId);
  if (!question) throw new Error("Không tìm thấy câu hỏi");

  const like = await LikeRecord.findOneAndUpdate(
    { targetId: questionId, userId, type: "QUESTION" },
    { $setOnInsert: { likedAt: new Date() } },
    { new: true, upsert: true }
  );

  if (String(question.user) !== String(userId)) {
    await Notification.create({
      senderId: userId,
      receiverId: question.user,
      content: `Câu hỏi "${question.title}" của bạn đã được thích.`,
      notificationType: "LIKE",
      questionId: question._id
    });
  }

  return like;
};

// UNLIKE QUESTION
exports.unlikeQuestion = async (questionId, userId) => {
  const question = await Question.findById(questionId);
  if (!question) throw new Error("Không tìm thấy câu hỏi");

  const result = await LikeRecord.findOneAndDelete({
    targetId: questionId,
    userId,
    type: "QUESTION",
  });

  if (!result) {
    throw new Error("Bạn chưa like câu hỏi này");
  }

  return true;
};

// Đếm số like
exports.countQuestionLikes = async (questionId) => {
  const question = await Question.findById(questionId);
  if (!question) throw new Error("Không tìm thấy câu hỏi");

  const count = await LikeRecord.countDocuments({
    targetId: questionId,
    type: "QUESTION",
  });

  return count;
};

// Like câu trả lời
exports.likeAnswer = async (answerId, userId) => {
  const answer = await Answer.findById(answerId);
  if (!answer) throw new Error("Không tìm thấy câu trả lời");

  const like = await LikeRecord.findOneAndUpdate(
    { targetId: answerId, userId, type: "ANSWER" },
    { $setOnInsert: { likedAt: new Date() } },
    { new: true, upsert: true }
  );

  if (String(answer.user) !== String(userId)) {
    await Notification.create({
      senderId: userId,
      receiverId: answer.user,
      content: `Câu trả lời của bạn cho câu hỏi "${answer.question?.title || ""}" đã được thích.`,
      notificationType: "LIKE",
      answerId: answer._id
    });
  }

  return like;
};

// Unlike câu trả lời
exports.unlikeAnswer = async (answerId, userId) => {
  const answer = await Answer.findById(answerId);
  if (!answer) throw new Error("Không tìm thấy câu trả lời");

  const result = await LikeRecord.findOneAndDelete({
    targetId: answerId,
    userId,
    type: "ANSWER",
  });

  if (!result) {
    throw new Error("Bạn chưa like câu trả lời này");
  }

  return true;
};

// Đếm số like của câu trả lời
exports.countAnswerLikes = async (answerId) => {
  const count = await LikeRecord.countDocuments({
    targetId: answerId,
    type: "ANSWER",
  });
  return count;
};

