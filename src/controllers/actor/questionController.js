const questionService = require("../../service/actor/questionService");

const makeResponse = (status, message, data = null) => ({
  status,
  message,
  data,
});
// POST /user/question/
exports.createQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const question = await questionService.createQuestion(
      { 
        ...req.body, 
        fileUrl: req.file?.path || null
      },
      userId
    );
    res.json(makeResponse("success", "Đặt câu hỏi thành công.", question));
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
  }
};

// PUT /user/question/:id
exports.updateQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const question = await questionService.updateQuestion(
      req.params.id,
      { 
        ...req.body, 
        fileUrl: req.file?.path || null
      },
      userId
    );
    res.json(makeResponse("success", "Cập nhật thành công.", question));
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
  }
};

// DELETE /user/question/:id
exports.deleteMyQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    await questionService.deleteQuestion(req.params.id, userId, "Người dùng tự xóa");
    res.json(makeResponse("success", "Xóa thành công."));
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
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
        fileUrl: req.file?.path || null
      },
      userId
    );
    res.json(makeResponse("success", "Đặt câu hỏi phụ thành công.", followUp));
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
  }
};

// GET /questions?statusAnswer=false&statusPublic=true
exports.getQuestions = async (req, res) => {
  try {
    const { data, total, page, size } = await questionService.getQuestions(req.query);
    res.json(
      makeResponse("success", "Lấy câu hỏi thành công.", {
        content: data,
        totalElements: total,
        page,
        size,
      })
    );
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
  }
};

// GET /question/me
exports.getMyQuestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, total, page, size } = await questionService.getMyQuestions(userId, req.query);

    console.log("User from token:", req.user);
    res.json(
      makeResponse("success", "Lấy câu hỏi của bạn thành công.", {
        content: data,
        totalElements: total,
        page,
        size,
      })
    );
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
  }
};

//GET /question/search
exports.searchQuestions = async (req, res) => {
  try {
    const keyword = req.query.keyword?.trim() || "";
    const { data, total, page, size } = await questionService.searchQuestions(keyword, req.query);

    if (total === 0) {
      return res.status(200).json(
        makeResponse("error", "Không tìm thấy câu hỏi nào.", {
          content: [],
          totalElements: 0,
          page,
          size,
        })
      );
    }

    res.json(
      makeResponse("success", "Tìm kiếm câu hỏi thành công.", {
        content: data,
        totalElements: total,
        page,
        size,
      })
    );
  } catch (err) {
    res.status(500).json(makeResponse("error", "Lỗi server khi tìm kiếm câu hỏi."));
  }
};


// DELETE /question/delete (admin)
exports.deleteQuestionByAdmin = async (req, res) => {
  try {
    const questionId = req.params.id;
    const { reason } = req.body;

    await questionService.deleteQuestionByAdmin(questionId, req.user, reason);

    res.json(makeResponse("success", "Câu hỏi đã được xóa thành công."));
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
  }
};


// GET /question/detail
exports.getQuestionDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await questionService.getQuestionById(id);

    res.json(makeResponse("success", "Chi tiết câu hỏi.", question));
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
  }
};


// GET /deletion-log/list
exports.getDeletionLogs = async (req, res) => {
  try {
    const logs = await questionService.getDeletionLogs(req.query);
    res.json(makeResponse("success", "Danh sách log xóa.", logs));
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
  }
};

// GET /deletion-log/detail
exports.getDeletionLogDetail = async (req, res) => {
  try {
    const log = await questionService.getDeletionLogDetail(req.query.id);
    res.json(makeResponse("success", "Chi tiết log xóa.", log));
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
  }
};

/**
 * GET /api/consultant/questions/pending
 * Danh sách câu hỏi chờ trả lời
 */
exports.getPendingQuestions = async (req, res) => {
  try {
    const { data, total, page, size } =
      await questionService.getPendingQuestions(req.query);

    res.json(
      makeResponse("success", "Lấy danh sách câu hỏi chờ trả lời thành công.", {
        content: data,
        totalElements: total,
        page,
        size,
      })
    );
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
  }
};

/**
 * GET /api/consultant/questions/answered
 * Danh sách câu hỏi đã trả lời
 */
exports.getAnsweredQuestions = async (req, res) => {
  try {
    const { data, total, page, size } =
      await questionService.getAnsweredQuestions(req.query);

    res.json(
      makeResponse("success", "Lấy danh sách câu hỏi đã trả lời thành công.", {
        content: data,
        totalElements: total,
        page,
        size,
      })
    );
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
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
        fileUrl: req.file?.path || null,
      },
      consultantId
    );

    res.json(makeResponse("success", "Trả lời câu hỏi thành công.", answer));
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
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
        fileUrl: req.file?.path || null,
      },
      consultantId
    );

    res.json(makeResponse("success", "Cập nhật câu trả lời thành công.", updated));
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
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

    res.json(makeResponse("success", "Đã gửi yêu cầu đánh giá câu trả lời."));
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
  }
};

/**
 * GET /api/consultant/questions/:id
 * Xem chi tiết câu hỏi (dành cho tư vấn viên)
 */
exports.getQuestionDetailForConsultant = async (req, res) => {
  try {
    const question = await questionService.getQuestionDetailForConsultant(req.params.id);
    res.json(makeResponse("success", "Chi tiết câu hỏi.", question));
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
  }
};