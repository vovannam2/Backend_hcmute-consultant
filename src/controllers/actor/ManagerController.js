const ManagerService = require("../../service/actor/ManagerService");
const { DataResponse, ExceptionResponse } = require("../../utils/response");

exports.getPendingAnswers = async (req, res) => {
  try {
    const result = await ManagerService.getPendingAnswers(req.user, req.query);
    return res.status(200).json(new DataResponse(result, "Danh sách câu trả lời chờ duyệt", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

exports.approveAnswer = async (req, res) => {
  try {
    await ManagerService.approveAnswer(req.params.id, req.user);
    return res.status(200).json(new DataResponse(null, "Đã duyệt câu trả lời", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

exports.rejectAnswer = async (req, res) => {
  try {
    await ManagerService.rejectAnswer(req.params.id, req.user, req.body.reason);
    return res.status(200).json(new DataResponse(null, "Đã từ chối câu trả lời", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// exports.sendFeedback = async (req, res) => {
//   try {
//     await ManagerService.sendFeedback(req.params.id, req.user, req.body.feedback);
//     res.json(makeResponse("success", "Đã gửi phản hồi"));
//   } catch (err) {
//     res.status(400).json(makeResponse("error", err.message));
//   }
// };

exports.getConsultants = async (req, res) => {
  try {
    // req.user.department có từ authMiddleware()
    const consultants = await ManagerService.getConsultantsByDepartment(
      req.user.department
    );

    return res.status(200).json(new DataResponse(consultants, "Danh sách tư vấn viên", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

exports.addConsultant = async (req, res) => {
  try {
    const newConsultant = await ManagerService.addConsultant(req.body, req.user);
    return res.status(201).json(new DataResponse(newConsultant, "Đã thêm tư vấn viên", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

exports.updateConsultant = async (req, res) => {
  try {
    // kiểm tra dữ liệu đầu vào
    if (!req.params.id) {
      return res.status(400).json(new ExceptionResponse("Thiếu ID tư vấn viên", undefined, 'error'));
    }
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json(new ExceptionResponse("Thiếu dữ liệu cập nhật", undefined, 'error'));
    }

    const consultant = await ManagerService.updateConsultant(
      req.user,          // user hiện tại (TRUONGBANTUVAN)
      req.params.id,     // id tư vấn viên
      req.body           // dữ liệu cập nhật
    );

    return res.status(200).json(new DataResponse(consultant, "Cập nhật thành công", 'success'));
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

exports.deleteConsultant = async (req, res) => {
  try {
    const result = await ManagerService.deleteConsultant(req.user, req.params.id);
    return res.status(200).json(new DataResponse(result, "Đã xóa tư vấn viên", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

exports.getConsultantPerformance = async (req, res) => {
  try {
    const data = await ManagerService.getConsultantPerformance(
      req.user,        // TRUONGBANTUVAN đang đăng nhập
      req.params.id    // id tư vấn viên
    );
    return res.status(200).json(new DataResponse(data, "Lấy hiệu suất thành công", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// POST /advisor-admin/answer/review - Phê duyệt câu trả lời
exports.reviewAnswer = async (req, res) => {
  try {
    const { questionId, content } = req.query;
    const fileUrl = req.file ? req.file.path : null;
    
    if (!questionId || !content) {
      return res.status(400).json(new ExceptionResponse("Thiếu questionId hoặc content", undefined, 'error'));
    }

    const result = await ManagerService.reviewAnswer(questionId, content, fileUrl, req.user);
    return res.status(200).json(new DataResponse(result, "Phê duyệt câu trả lời thành công", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// POST /advisor-admin/common-question/convert-to-common - Chuyển thành câu hỏi chung
exports.convertToCommonQuestion = async (req, res) => {
  try {
    const { questionId } = req.query;
    
    if (!questionId) {
      return res.status(400).json(new ExceptionResponse("Thiếu questionId", undefined, 'error'));
    }

    const result = await ManagerService.convertToCommonQuestion(questionId, req.user);
    return res.status(200).json(new DataResponse(result, "Chuyển thành câu hỏi chung thành công", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};