const questionService = require("../../service/actor/questionService");
const { DataResponse, ExceptionResponse } = require("../../utils/response");

// POST /user/question/
exports.createQuestion = async (req, res) => {
  try {
    const userId = req.user.id;

    const fileUrl = req.file ? req.file.path : null;
    const question = await questionService.createQuestion(
      { ...req.body, fileUrl },
      userId,
      req.io // Truyền socket instance để gửi thông báo
    );

    return res
      .status(201)
      .json(new DataResponse(question, 'Đặt câu hỏi thành công.', 'success'));
  } catch (err) {
    return res
      .status(err.status || 500)
      .json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};


// PUT /user/question/update
exports.updateQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const questionId = req.body.questionId || req.query.questionId || req.params.id;
    
    if (!questionId) {
      return res.status(400).json(new ExceptionResponse("Thiếu questionId", undefined, 'error'));
    }
    
    // Remove questionId from body to avoid passing it to service
    const { questionId: _, ...updateData } = req.body;
    
    const question = await questionService.updateQuestion(
      questionId,
      { 
        ...updateData, 
        fileUrl: req.file ? buildMessageLink(req.file) : null
      },
      userId
    );
    return res.status(200).json(new DataResponse(question, "Cập nhật thành công.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// DELETE /user/question/:id
exports.deleteMyQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    await questionService.deleteQuestion(req.params.id, userId, "Người dùng tự xóa");
    return res.status(200).json(new DataResponse(null, "Xóa thành công.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// POST /user/question/follow-up
exports.askFollowUpQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const parentQuestionId = req.params.id;
    const followUp = await questionService.createFollowUpQuestion(
      { 
        ...req.body, 
        parentQuestionId,
        fileUrl: req.file ? buildMessageLink(req.file) : null
      },
      userId
    );
    return res.status(201).json(new DataResponse(followUp, "Đặt câu hỏi phụ thành công.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// GET /questions?statusAnswer=false&statusPublic=true
exports.getQuestions = async (req, res) => {
  try {
    const { data, total, page, size } = await questionService.getQuestions(req.query);
    return res.status(200).json(
      new DataResponse({
        content: data,
        totalElements: total,
        totalPages: Math.ceil(total / size),
        page,
        size,
      }, "Lấy câu hỏi thành công.", 'success')
    );
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// GET /question/me
exports.getMyQuestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, total, page, size } = await questionService.getMyQuestions(userId, req.query);

    return res.status(200).json(
      new DataResponse({
        content: data,
        totalElements: total,
        totalPages: Math.ceil(total / size),
        page,
        size,
      }, "Lấy câu hỏi của bạn thành công.", 'success')
    );
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// GET /questions/list-filter-status-options
exports.getQuestionStatusOptions = async (req, res) => {
  try {
    const statusOptions = [
      { key: 'ANSWERED', displayName: 'Đã trả lời' },
      { key: 'NOT_ANSWERED', displayName: 'Chưa trả lời' },
      { key: 'PRIVATE', displayName: 'Riêng tư' },
      { key: 'PUBLIC', displayName: 'Công khai' },
      { key: 'DELETED', displayName: 'Đã xóa' },
      { key: 'APPROVED', displayName: 'Đã duyệt' }
    ];
    
    return res.status(200).json(new DataResponse(statusOptions, "Lấy danh sách trạng thái thành công.", 'success'));
  } catch (err) {
    return res.status(500).json(new ExceptionResponse("Lỗi server khi lấy danh sách trạng thái.", err.message, 'error'));
  }
};

//GET /question/search
exports.searchQuestions = async (req, res) => {
  try {
    const keyword = req.query.keyword?.trim() || "";
    const { data, total, page, size } = await questionService.searchQuestions(keyword, req.query);

    if (total === 0) {
      return res.status(200).json(
        new DataResponse({
          content: [],
          totalElements: 0,
          page,
          size,
        }, "Không tìm thấy câu hỏi nào.", 'success')
      );
    }

    return res.status(200).json(
      new DataResponse({
        content: data,
        totalElements: total,
        page,
        size,
      }, "Tìm kiếm câu hỏi thành công.", 'success')
    );
  } catch (err) {
    return res.status(500).json(new ExceptionResponse("Lỗi server khi tìm kiếm câu hỏi.", err.message, 'error'));
  }
};


// DELETE /question/delete (admin)
exports.deleteQuestionByAdmin = async (req, res) => {
  try {
    const questionId = req.params.id;
    const { reason } = req.body;

    await questionService.deleteQuestionByAdmin(questionId, req.user, reason);

    return res.status(200).json(new DataResponse(null, "Câu hỏi đã được xóa thành công.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};


// GET /question/detail
exports.getQuestionDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await questionService.getQuestionById(id);

    return res.status(200).json(new DataResponse(question, "Chi tiết câu hỏi.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};


// GET /deletion-log/list
exports.getDeletionLogs = async (req, res) => {
  try {
    const logs = await questionService.getDeletionLogs(req.query);
    return res.status(200).json(new DataResponse(logs, "Danh sách log xóa.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// GET /deletion-log/detail
exports.getDeletionLogDetail = async (req, res) => {
  try {
    const log = await questionService.getDeletionLogDetail(req.query.id);
    return res.status(200).json(new DataResponse(log, "Chi tiết log xóa.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

/**
 * GET /api/consultant/questions/pending
 * Danh sách câu hỏi chờ trả lời
 */
exports.getPendingQuestions = async (req, res) => {
  try {
    const { data, total, page, size } =
      await questionService.getPendingQuestions(req.query, req.user);

    return res.status(200).json(
      new DataResponse({
        content: data,
        totalElements: total,
        page,
        size,
      }, "Lấy danh sách câu hỏi chờ trả lời thành công.", 'success')
    );
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

/**
 * GET /api/consultant/questions/answered
 * Danh sách câu hỏi đã trả lời
 */
exports.getAnsweredQuestions = async (req, res) => {
  try {
    const { data, total, page, size } =
      await questionService.getAnsweredQuestions(req.query, req.user);

    return res.status(200).json(
      new DataResponse({
        content: data,
        totalElements: total,
        page,
        size,
      }, "Lấy danh sách câu hỏi đã trả lời thành công.", 'success')
    );
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

/**
 * GET /api/consultant/questions/all
 * Danh sách tất cả câu hỏi theo department của tư vấn viên
 */
exports.getAllQuestionsByDepartment = async (req, res) => {
  try {
    const { data, total, page, size } =
      await questionService.getAllQuestionsByDepartment(req.query, req.user);

    return res.status(200).json(
      new DataResponse({
        content: data,
        totalElements: total,
        totalPages: Math.ceil(total / size),
        page,
        size,
      }, "Lấy danh sách tất cả câu hỏi thành công.", 'success')
    );
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

/**
 * POST /api/consultant/answers
 * Tư vấn viên trả lời câu hỏi
 */
exports.createAnswer = async (req, res) => {
  try {
    
    const consultantId = req.user.id;
    const answer = await questionService.createAnswer(
      {
        ...req.body,
        fileUrl: req.file ? buildMessageLink(req.file) : null,
      },
      consultantId,
      req.io // Truyền socket instance để gửi thông báo
    );

    return res.status(201).json(new DataResponse(answer, "Trả lời câu hỏi thành công.", 'success'));
  } catch (err) {
    console.error('❌ Create Answer Error:', err.message);
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

/**
 * PUT /api/consultant/answers/:id
 * Chỉnh sửa câu trả lời
 */
exports.updateAnswer = async (req, res) => {
  try {
    const consultantId = req.user.id;
    const updated = await questionService.updateAnswer(
      req.params.id,
      {
        ...req.body,
        fileUrl: req.file ? buildMessageLink(req.file) : null,
      },
      consultantId
    );

    return res.status(200).json(new DataResponse(updated, "Cập nhật câu trả lời thành công.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

/**
 * POST /api/consultant/answers/:id/request-review
 * Yêu cầu đánh giá câu trả lời
 */
exports.requestAnswerReview = async (req, res) => {
  try {
    const consultantId = req.user.id;
    await questionService.requestAnswerReview(req.params.id, consultantId);

    return res.status(200).json(new DataResponse(null, "Đã gửi yêu cầu đánh giá câu trả lời.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

/**
 * GET /api/consultant/questions/:id
 * Xem chi tiết câu hỏi (dành cho tư vấn viên)
 */
exports.getQuestionDetailForConsultant = async (req, res) => {
  try {
    const question = await questionService.getQuestionDetailForConsultant(req.params.id);
    return res.status(200).json(new DataResponse(question, "Chi tiết câu hỏi.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

/**
 * POST /api/likes/question/:id
 * Người dùng like câu hỏi
 */
exports.likeQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const questionId = req.params.id;

    const like = await questionService.likeQuestion(questionId, userId, req.io);

    return res.status(200).json(new DataResponse(like, "Like câu hỏi thành công.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

exports.unlikeQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const questionId = req.params.id;

    await questionService.unlikeQuestion(questionId, userId);

    return res.status(200).json(new DataResponse(null, "Unlike câu hỏi thành công.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// Đếm số like câu hỏi
exports.countQuestionLikes = async (req, res) => {
  try {
    const questionId = req.params.id;

    const count = await questionService.countQuestionLikes(questionId);

    // Trả trực tiếp number trong data để khớp FE
    return res.status(200).json(new DataResponse(count, "Lấy số like thành công.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// Lấy bản ghi like của câu hỏi
exports.getQuestionLikeRecord = async (req, res) => {
  try {
    const questionId = req.params.id;
    const userId = req.user.id;

    const likeRecord = await questionService.getQuestionLikeRecord(questionId, userId);

    return res.status(200).json(new DataResponse(likeRecord, "Lấy bản ghi like thành công.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// Lấy danh sách user đã like câu hỏi
exports.getQuestionLikeUsers = async (req, res) => {
  try {
    const questionId = req.params.id;

    const users = await questionService.getQuestionLikeUsers(questionId);

    return res.status(200).json(new DataResponse(users, "Lấy danh sách user đã like thành công.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// like answer
exports.likeAnswer = async (req, res) => {
  try {
    const userId = req.user.id;
    const like = await questionService.likeAnswer(req.params.id, userId);
    return res.status(200).json(new DataResponse(like, "Đã like câu trả lời.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// unlike answer
exports.unlikeAnswer = async (req, res) => {
  try {
    const userId = req.user.id;
    await questionService.unlikeAnswer(req.params.id, userId);
    return res.status(200).json(new DataResponse(null, "Đã bỏ like câu trả lời.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// Đếm like câu trả lời
exports.getAnswerLikes = async (req, res) => {
  try {
    const answerId = req.params.id;

    const count = await questionService.countAnswerLikes(answerId);

    return res.status(200).json(new DataResponse({ count }, "Lấy số like thành công.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// Update answer by params (for frontend compatibility)
exports.updateAnswerByParams = async (req, res) => {
  try {
    const { answerId, title, content, statusApproval } = req.query;
    const consultantId = req.user.id;
    
    if (!answerId) {
      return res.status(400).json(new ExceptionResponse("Thiếu answerId", undefined, 'error'));
    }

    const updated = await questionService.updateAnswer(
      answerId,
      {
        title,
        content,
        statusApproval: statusApproval === 'true',
        fileUrl: req.file ? buildMessageLink(req.file) : null
      },
      consultantId
    );

    return res.status(200).json(new DataResponse(updated, "Cập nhật câu trả lời thành công.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// Delete answer by params (for frontend compatibility)
exports.deleteAnswerByParams = async (req, res) => {
  try {
    const { id } = req.query;
    const consultantId = req.user.id;
    
    if (!id) {
      return res.status(400).json(new ExceptionResponse("Thiếu id", undefined, 'error'));
    }

    await questionService.deleteAnswer(id, consultantId);

    return res.status(200).json(new DataResponse(null, "Xóa câu trả lời thành công.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};