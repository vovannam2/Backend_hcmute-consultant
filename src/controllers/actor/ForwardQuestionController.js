const ForwardQuestionService = require("../../service/actor/ForwardQuestionService");
const { DataResponse, ExceptionResponse } = require("../../utils/response");

// Lấy danh sách forward questions
exports.getForwardQuestions = async (req, res) => {
  try {
    const queryParams = req.query;
    const result = await ForwardQuestionService.getForwardQuestions(queryParams, req.user);
    
    return res.status(200).json(new DataResponse(result, "Lấy danh sách câu hỏi chuyển tiếp thành công", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// Cập nhật forward question
exports.updateForwardQuestion = async (req, res) => {
  try {
    const { forwardQuestionId } = req.query;
    const updateData = req.body;

    if (!forwardQuestionId) {
      return res.status(400).json(new ExceptionResponse("Thiếu ID câu hỏi chuyển tiếp", undefined, 'error'));
    }

    const result = await ForwardQuestionService.updateForwardQuestion(forwardQuestionId, updateData, req.user);
    
    return res.status(200).json(new DataResponse("Cập nhật câu hỏi chuyển tiếp thành công", "Cập nhật thành công", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// Xóa forward question
exports.deleteForwardQuestion = async (req, res) => {
  try {
    const { forwardQuestionId } = req.query;

    if (!forwardQuestionId) {
      return res.status(400).json(new ExceptionResponse("Thiếu ID câu hỏi chuyển tiếp", undefined, 'error'));
    }

    const result = await ForwardQuestionService.deleteForwardQuestion(forwardQuestionId, req.user);
    
    return res.status(200).json(new DataResponse(result.message, "Xóa thành công", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

exports.forwardQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetDepartmentId, reason } = req.body;


    if (!targetDepartmentId || targetDepartmentId === 'NaN' || targetDepartmentId === 'undefined') {
      return res.status(400).json(new ExceptionResponse("Thiếu ID khoa đích", undefined, 'error'));
    }

    if (!req.user) {
      return res.status(401).json(new ExceptionResponse("Chưa đăng nhập", undefined, 'error'));
    }

    const question = await ForwardQuestionService.forwardQuestion(
      id,
      req.user,
      targetDepartmentId,
      reason,
      req.io // Truyền socket instance để gửi thông báo
    );

    return res.status(200).json(new DataResponse(question, "Đã chuyển tiếp câu hỏi", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};