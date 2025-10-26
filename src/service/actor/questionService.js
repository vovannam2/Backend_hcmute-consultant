const Question = require("../../models/Question");
const Answer = require("../../models/Answer");
const Department = require("../../models/Department");
const Field = require("../../models/Field");
const DeletionLog = require("../../models/DeletionLog");
const Notification = require("../../models/Notification");
const LikeRecord = require("../../models/LikeRecord");
const User = require("../../models/User");
const mongoose = require("mongoose");
const { createAndSendNotification } = require("../common/notificationHelper");

exports.createQuestion = async (data, userId, io = null) => {
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

  // Gửi thông báo đến tư vấn viên nếu có socket instance
  if (io) {
    try {
      // Tìm tư vấn viên trong cùng phòng ban
      const consultants = await User.find({
        role: { $in: ['TUVANVIEN', 'TRUONGBANTUVAN'] },
        department: departmentId
      });

      // Gửi thông báo đến từng tư vấn viên
      for (const consultant of consultants) {
        await createAndSendNotification(
          io,
          userId, // Người gửi (người đặt câu hỏi)
          consultant._id, // Người nhận (tư vấn viên)
          `Có câu hỏi mới trong ${department.name}: ${title}`,
          'QUESTION',
          question._id
        );
      }

    } catch (error) {
      console.error('❌ Error sending notifications:', error);
      // Không throw error để không ảnh hưởng đến việc tạo câu hỏi
    }
  }

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
    fieldId,
    status,
    startDate,
    endDate,
    content,
    isNewest,
    isMostLiked,
    page = 0,
    size = 10,
    sortBy = "createdAt",
    sortDir = "desc",
  } = query;

  const filter = { statusDelete: false };

  if (statusApproval !== undefined) filter.statusApproval = statusApproval === "true";
  if (statusAnswer !== undefined) filter.statusAnswer = statusAnswer === "true";
  if (title) filter.title = { $regex: title, $options: "i" };
  if (departmentId) filter.department = departmentId; // vì bạn lưu string
  if (fieldId) filter.field = fieldId; // thêm filter field
  if (status !== undefined) filter.statusPublic = status === "true";
  if (content) filter.content = { $regex: content, $options: "i" }; // thêm filter content

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Xử lý advanced sorting
  let sortOptions = { [sortBy]: sortDir === "desc" ? -1 : 1 };
  
  if (isNewest === "true") {
    sortOptions = { createdAt: -1 };
  } else if (isMostLiked === "true") {
    // Sort by like count (cần join với LikeRecord)
    sortOptions = { createdAt: -1 }; // Tạm thời sort by createdAt
  }

  
  const data = await Question.find(filter)
    .sort(sortOptions)
    .skip(Number(page) * Number(size))
    .limit(Number(size))
    .populate("user", "_id username fullName studentCode avatarUrl")
    .populate("department", "_id name")
    .populate("originalDepartment", "_id name")
    .populate("field", "_id name")
    .populate({
      path: "answers",
      populate: {
        path: "user",
        select: "_id username fullName avatarUrl"
      },
      options: { sort: { createdAt: -1 } }  // Lấy câu trả lời mới nhất trước
    });


  // Transform data to match frontend expected format
  const transformedData = data.map(question => {
    const questionObj = question.toJSON();
    
    
    // Transform user data (người hỏi)
    if (questionObj.user) {
      questionObj.askerFullName = questionObj.user.fullName || '';
      questionObj.askerAvatarUrl = questionObj.user.avatarUrl || '';
      questionObj.askerId = questionObj.user._id;
      
      // ❌ XÓA user object để tránh duplicate data
      delete questionObj.user;
    }
    
    // Map roleAsk string to object for frontend compatibility
    const roleAskMapping = {
      'SINHVIEN': { id: 'SINHVIEN', name: 'Sinh viên' },
      'GIANGVIEN': { id: 'GIANGVIEN', name: 'Giảng viên' },
      'NHANVIEN': { id: 'NHANVIEN', name: 'Nhân viên' },
      'USER': { id: 'USER', name: 'Người dùng' }
    };
    questionObj.roleAsk = roleAskMapping[questionObj.roleAsk] || { id: questionObj.roleAsk, name: questionObj.roleAsk };
    
    // Add additional fields for frontend compatibility
    questionObj.questionFilterStatus = questionObj.statusAnswer ? 'ANSWERED' : 'NOT_ANSWERED';
    questionObj.filterStatus = [];
    questionObj.forwardQuestionDTO = null;
    
    // Transform answers data (câu trả lời)
    if (questionObj.answers && questionObj.answers.length > 0) {
      const latestAnswer = questionObj.answers[0]; // Lấy câu trả lời mới nhất
      
      
      questionObj.answerContent = latestAnswer.content || '';
      questionObj.answerTitle = latestAnswer.title || '';
      questionObj.answerId = latestAnswer._id;
      questionObj.answerCreatedAt = latestAnswer.createdAt;
      questionObj.answerFileUrl = latestAnswer.file || '';
      
      // Thông tin người trả lời
      if (latestAnswer.user) {
        questionObj.answerUserFullName = latestAnswer.user.fullName || '';
        questionObj.answerAvatarUrl = latestAnswer.user.avatarUrl || '';
      }
      
      // ❌ XÓA answers array để tránh duplicate data
      delete questionObj.answers;
    } else {
      // Set default values nếu không có câu trả lời
      questionObj.answerContent = '';
      questionObj.answerTitle = '';
      questionObj.answerId = null;
      questionObj.answerCreatedAt = '';
      questionObj.answerFileUrl = '';
      questionObj.answerUserFullName = '';
      questionObj.answerAvatarUrl = '';
    }
    
    return questionObj;
  });

  const total = await Question.countDocuments(filter);

  return { data: transformedData, total, page: Number(page), size: Number(size) };
};


//get question of me
exports.getMyQuestions = async (userId, query) => {
  const {
    page = 0,
    size = 10,
    sortBy = "createdAt",
    sortDir = "desc",
    // filters
    keyword,
    title,
    content,
    departmentId,
    fieldId,
    statusAnswer,
    statusPublic,
    status, // từ dropdown filter
    startDate,
    endDate,
  } = query;

  const filter = {
    statusDelete: false,
    user: new mongoose.Types.ObjectId(userId)
  };

  if (typeof statusAnswer !== 'undefined') {
    filter.statusAnswer = String(statusAnswer) === 'true';
  }
  if (typeof statusPublic !== 'undefined') {
    filter.statusPublic = String(statusPublic) === 'true';
  }
  
  // Map status từ dropdown sang các trường tương ứng
  if (status) {
    switch (status) {
      case 'ANSWERED':
        filter.statusAnswer = true;
        break;
      case 'NOT_ANSWERED':
        filter.statusAnswer = false;
        break;
      case 'PUBLIC':
        filter.statusPublic = true;
        break;
      case 'PRIVATE':
        filter.statusPublic = false;
        break;
      case 'APPROVED':
        filter.statusApproval = true;
        break;
      case 'DELETED':
        filter.statusDelete = true;
        break;
    }
  }
  if (departmentId) filter.department = departmentId;
  if (fieldId) filter.field = fieldId;
  if (title) filter.title = { $regex: title, $options: 'i' };
  if (content) filter.content = { $regex: content, $options: 'i' };

  if (keyword && String(keyword).trim() !== '') {
    const kw = String(keyword).trim();
    filter.$or = [
      { title: { $regex: kw, $options: 'i' } },
      { content: { $regex: kw, $options: 'i' } },
    ];
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const sort = { [sortBy]: sortDir === 'desc' ? -1 : 1 };

  
  const data = await Question.find(filter)
    .sort(sort)
    .skip(Number(page) * Number(size))
    .limit(Number(size))
    .populate("user", "_id username fullName studentCode avatarUrl")
    .populate("department", "_id name")
    .populate("originalDepartment", "_id name")
    .populate("field", "_id name")
    .populate({
      path: "answers",
      populate: {
        path: "user",
        select: "_id username fullName avatarUrl"
      },
      options: { sort: { createdAt: -1 } }
    });

  // Transform data to match frontend expected format
  const transformedData = data.map(question => {
    const questionObj = question.toJSON();
    
    // Transform user data (người hỏi)
    if (questionObj.user) {
      questionObj.askerFullName = questionObj.user.fullName || '';
      questionObj.askerAvatarUrl = questionObj.user.avatarUrl || '';
      questionObj.askerId = questionObj.user._id;
      
      // ❌ XÓA user object để tránh duplicate data
      delete questionObj.user;
    }
    
    // Map roleAsk string to object for frontend compatibility
    const roleAskMapping = {
      'SINHVIEN': { id: 'SINHVIEN', name: 'Sinh viên' },
      'GIANGVIEN': { id: 'GIANGVIEN', name: 'Giảng viên' },
      'NHANVIEN': { id: 'NHANVIEN', name: 'Nhân viên' },
      'USER': { id: 'USER', name: 'Người dùng' }
    };
    questionObj.roleAsk = roleAskMapping[questionObj.roleAsk] || { id: questionObj.roleAsk, name: questionObj.roleAsk };
    
    // Add additional fields for frontend compatibility
    questionObj.questionFilterStatus = questionObj.statusAnswer ? 'ANSWERED' : 'NOT_ANSWERED';
    questionObj.filterStatus = [];
    questionObj.forwardQuestionDTO = null;
    
    // Transform answers data (câu trả lời)
    if (questionObj.answers && questionObj.answers.length > 0) {
      const latestAnswer = questionObj.answers[0]; // Lấy câu trả lời mới nhất
      
      
      questionObj.answerContent = latestAnswer.content || '';
      questionObj.answerTitle = latestAnswer.title || '';
      questionObj.answerId = latestAnswer._id;
      questionObj.answerCreatedAt = latestAnswer.createdAt;
      questionObj.answerFileUrl = latestAnswer.file || '';
      
      // Thông tin người trả lời
      if (latestAnswer.user) {
        questionObj.answerUserFullName = latestAnswer.user.fullName || '';
        questionObj.answerAvatarUrl = latestAnswer.user.avatarUrl || '';
      }
      
      // ❌ XÓA answers array để tránh duplicate data
      delete questionObj.answers;
    } else {
      // Set default values nếu không có câu trả lời
      questionObj.answerContent = '';
      questionObj.answerTitle = '';
      questionObj.answerId = null;
      questionObj.answerCreatedAt = '';
      questionObj.answerFileUrl = '';
      questionObj.answerUserFullName = '';
      questionObj.answerAvatarUrl = '';
    }
    
    return questionObj;
  });

  const total = await Question.countDocuments(filter);

  return { data: transformedData, total, page: Number(page), size: Number(size) };
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
    .populate("user department field subQuestions")
    .populate({
      path: 'answers',
      populate: {
        path: 'user',
        select: 'username fullName avatarUrl'
      }
    });

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

// Lấy tất cả câu hỏi theo department của tư vấn viên
exports.getAllQuestionsByDepartment = async (query, user) => {
  const {
    page = 0,
    size = 10,
    sortBy = "createdAt",
    sortDir = "desc",
    title,
    fieldId,
    status,
    startDate,
    endDate,
    content,
    isNewest,
    isMostLiked,
    statusDelete,
    statusAnswer,
    statusPublic,
    statusApproval,
  } = query;

  const filter = {
    statusDelete: statusDelete === 'true' ? true : false
  };

  // Tự động filter theo department của tư vấn viên
  // Lưu ý: Khi forward question, department đã được cập nhật sang khoa mới
  // nên sẽ tự động hiển thị ở khoa mới, không còn ở khoa gốc nữa
  if (user && user.role === "TUVANVIEN") {
    filter.department = user.department;
  }

  // Xử lý status filter giống getMyQuestions
  if (status) {
    switch (status) {
      case 'ANSWERED':
        filter.statusAnswer = true;
        break;
      case 'PENDING':
        filter.statusAnswer = false;
        break;
      case 'PUBLIC':
        filter.statusPublic = true;
        break;
      case 'PRIVATE':
        filter.statusPublic = false;
        break;
      case 'PENDING_APPROVAL':
        filter.statusApproval = false;
        break;
      case 'DELETED':
        filter.statusDelete = true;
        break;
    }
  }

  // Xử lý các parameter riêng lẻ (để tương thích ngược)
  if (typeof statusAnswer !== 'undefined') {
    filter.statusAnswer = String(statusAnswer) === 'true';
  }
  if (typeof statusPublic !== 'undefined') {
    filter.statusPublic = String(statusPublic) === 'true';
  }
  if (typeof statusApproval !== 'undefined') {
    filter.statusApproval = String(statusApproval) === 'true';
  }

  // Các filter khác
  if (title) filter.title = { $regex: title, $options: "i" };
  if (fieldId) filter.field = fieldId;
  if (content) filter.content = { $regex: content, $options: "i" };


  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Xử lý advanced sorting
  let sortOptions = { [sortBy]: sortDir === "desc" ? -1 : 1 };
  
  if (isNewest === "true") {
    sortOptions = { createdAt: -1 };
  } else if (isMostLiked === "true") {
    sortOptions = { createdAt: -1 }; // Tạm thời sort by createdAt
  }

  const data = await Question.find(filter)
    .sort(sortOptions)
    .skip(Number(page) * Number(size))
    .limit(Number(size))
    .populate("user", "_id username fullName studentCode avatarUrl")
    .populate("department", "_id name")
    .populate("originalDepartment", "_id name")
    .populate("field", "_id name")
    .populate({
      path: "answers",
      populate: {
        path: "user",
        select: "_id username fullName avatarUrl"
      },
      options: { sort: { createdAt: -1 } }
    });

  // Transform data to match frontend expected format
  const transformedData = data.map(question => {
    const questionObj = question.toJSON();
    
    // Transform user data (người hỏi)
    if (questionObj.user) {
      questionObj.askerFullName = questionObj.user.fullName || '';
      questionObj.askerAvatarUrl = questionObj.user.avatarUrl || '';
      questionObj.askerId = questionObj.user._id;
      
      // XÓA user object để tránh duplicate data
      delete questionObj.user;
    }
    
    // Map roleAsk string to object for frontend compatibility
    const roleAskMapping = {
      'SINHVIEN': { id: 'SINHVIEN', name: 'Sinh viên' },
      'GIANGVIEN': { id: 'GIANGVIEN', name: 'Giảng viên' },
      'NHANVIEN': { id: 'NHANVIEN', name: 'Nhân viên' },
      'USER': { id: 'USER', name: 'Người dùng' }
    };
    questionObj.roleAsk = roleAskMapping[questionObj.roleAsk] || { id: questionObj.roleAsk, name: questionObj.roleAsk };
    
    // Add additional fields for frontend compatibility
    questionObj.questionFilterStatus = questionObj.statusAnswer ? 'ANSWERED' : 'NOT_ANSWERED';
    questionObj.filterStatus = [];
    questionObj.forwardQuestionDTO = null;
    
    // Transform answers data (câu trả lời)
    if (questionObj.answers && questionObj.answers.length > 0) {
      const latestAnswer = questionObj.answers[0]; // Lấy câu trả lời mới nhất
      
      questionObj.answerContent = latestAnswer.content || '';
      questionObj.answerTitle = latestAnswer.title || '';
      questionObj.answerId = latestAnswer._id;
      questionObj.answerCreatedAt = latestAnswer.createdAt;
      questionObj.answerFileUrl = latestAnswer.file || '';
      
      // Thông tin người trả lời
      if (latestAnswer.user) {
        questionObj.answerUserFullName = latestAnswer.user.fullName || '';
        questionObj.answerAvatarUrl = latestAnswer.user.avatarUrl || '';
      }
      
      // XÓA answers array để tránh duplicate data
      delete questionObj.answers;
    } else {
      // Set default values nếu không có câu trả lời
      questionObj.answerContent = '';
      questionObj.answerTitle = '';
      questionObj.answerId = null;
      questionObj.answerCreatedAt = '';
      questionObj.answerFileUrl = '';
      questionObj.answerUserFullName = '';
      questionObj.answerAvatarUrl = '';
    }
    
    return questionObj;
  });

  const total = await Question.countDocuments(filter);

  return { data: transformedData, total, page: Number(page), size: Number(size) };
};


// Tư vấn viên trả lời câu hỏi
exports.createAnswer = async (data, consultantId, io = null) => {
  const { questionId, content, fileUrl, title } = data;

  const question = await Question.findById(questionId);
  if (!question || question.statusDelete)
    throw new Error("Không tìm thấy câu hỏi");

  if (question.statusAnswer) {
    throw new Error("Câu hỏi đã được trả lời");
  }

  // Lấy thông tin user để xác định roleConsultant
  const consultant = await User.findById(consultantId);
  if (!consultant) {
    throw new Error("Không tìm thấy thông tin tư vấn viên");
  }

  const answer = new Answer({
    question: questionId,
    user: consultantId,
    roleConsultant: consultant.role, // Lấy role từ thông tin user
    content,
    title,
    file: fileUrl
  });
  await answer.save();

  question.statusAnswer = true;
  await question.save();

  // Tạo thông báo
  const notification = await Notification.create({
    senderId: consultantId,
    receiverId: question.user,
    content: `Câu hỏi "${question.title}" đã được tư vấn viên trả lời.`,
    notificationType: "ANSWER",
    answerId: answer._id
  });

  // Gửi thông báo real-time nếu có socket
  if (io) {
    try {
      await createAndSendNotification(
        io,
        consultantId,
        question.user,
        `Câu hỏi "${question.title}" đã được tư vấn viên trả lời.`,
        'ANSWER',
        question._id,
        answer._id
      );
    } catch (error) {
      console.error('❌ Error sending answer notification:', error);
    }
  }

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
      "username fullName studentCode avatarUrl email phone"
    )
    .select(
      "_id title content roleAsk views statusApproval statusPublic statusDelete statusAnswer createdAt updatedAt"
    );

  if (!question) throw new Error("Không tìm thấy câu hỏi");

  return question;
};

// LIKE QUESTION
exports.likeQuestion = async (questionId, userId, io = null) => {
  const question = await Question.findById(questionId);
  if (!question) throw new Error("Không tìm thấy câu hỏi");

  const like = await LikeRecord.findOneAndUpdate(
    { targetId: questionId, userId, type: "QUESTION" },
    { $setOnInsert: { likedAt: new Date() } },
    { new: true, upsert: true }
  );

  if (String(question.user) !== String(userId)) {
    // Gửi notification qua socket nếu có io instance
    if (io) {
      try {
        const { createAndSendNotification } = require("../common/notificationHelper");
        await createAndSendNotification(
          io,
          userId,
          question.user,
          `Câu hỏi "${question.title}" của bạn đã được thích.`,
          'LIKE',
          question._id
        );
      } catch (error) {
        console.error('❌ Error sending like notification:', error);
      }
    } else {
      // Fallback: tạo notification trong DB nếu không có socket
      const notification = await Notification.create({
        senderId: userId,
        receiverId: question.user,
        content: `Câu hỏi "${question.title}" của bạn đã được thích.`,
        notificationType: "LIKE",
        questionId: question._id
      });
    }
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

// Lấy bản ghi like của câu hỏi theo cấu trúc likeKey
exports.getQuestionLikeRecord = async (questionId, userId) => {
  const question = await Question.findById(questionId);
  if (!question) throw new Error("Không tìm thấy câu hỏi");

  const likeRecords = await LikeRecord.find({
    targetId: questionId,
    type: "QUESTION",
  });

  // Chuẩn hóa theo cấu trúc FE mong đợi
  return likeRecords.map((r) => ({
    likeKey: {
      targetId: r.targetId,
      userId: r.userId,
      type: r.type,
    },
  }));
};

// Lấy danh sách user đã like câu hỏi
exports.getQuestionLikeUsers = async (questionId) => {
  const question = await Question.findById(questionId);
  if (!question) throw new Error("Không tìm thấy câu hỏi");

  const likeRecords = await LikeRecord.find({
    targetId: questionId,
    type: "QUESTION",
  }).populate('userId', 'fullName avatarUrl');

  const users = likeRecords.map(record => ({
    id: record.userId._id,
    fullName: record.userId.fullName,
    avatarUrl: record.userId.avatarUrl
  }));

  return users;
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

// Xóa câu trả lời
exports.deleteAnswer = async (answerId, consultantId) => {
  const answer = await Answer.findById(answerId);
  if (!answer) throw new Error("Không tìm thấy câu trả lời");

  // Kiểm tra quyền: chỉ người tạo answer mới được xóa
  if (String(answer.user) !== String(consultantId)) {
    throw new Error("Không có quyền xóa câu trả lời này");
  }

  // Xóa câu trả lời
  await Answer.findByIdAndDelete(answerId);

  // Cập nhật trạng thái câu hỏi nếu cần
  const question = await Question.findById(answer.question);
  if (question) {
    question.statusAnswer = false;
    question.answerContent = null;
    question.answerFileUrl = null;
    question.answerUserFullName = null;
    question.answerCreatedAt = null;
    await question.save();
  }

  return true;
};

