const ManagerService = require("../../service/actor/ManagerService");

const makeResponse = (status, message, data = null) => ({
  status,
  message,
  data,
});

exports.getPendingAnswers = async (req, res) => {
  try {
    const result = await ManagerService.getPendingAnswers(req.user, req.query);
    res.json(makeResponse("success", "Danh sách câu trả lời chờ duyệt", result));
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
  }
};

exports.approveAnswer = async (req, res) => {
  try {
    await ManagerService.approveAnswer(req.params.id, req.user);
    res.json(makeResponse("success", "Đã duyệt câu trả lời"));
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
  }
};

exports.rejectAnswer = async (req, res) => {
  try {
    await ManagerService.rejectAnswer(req.params.id, req.user, req.body.reason);
    res.json(makeResponse("success", "Đã từ chối câu trả lời"));
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
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

    res.json(makeResponse("success", "Danh sách tư vấn viên", consultants));
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
  }
};

exports.addConsultant = async (req, res) => {
  try {
    const newConsultant = await ManagerService.addConsultant(req.body, req.user);
    res.json(makeResponse("success", "Đã thêm tư vấn viên", newConsultant));
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
  }
};

exports.updateConsultant = async (req, res) => {
  try {
    // kiểm tra dữ liệu đầu vào
    if (!req.params.id) {
      return res.status(400).json(makeResponse("error", "Thiếu ID tư vấn viên"));
    }
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json(makeResponse("error", "Thiếu dữ liệu cập nhật"));
    }

    const consultant = await ManagerService.updateConsultant(
      req.user,          // user hiện tại (TRUONGBANTUVAN)
      req.params.id,     // id tư vấn viên
      req.body           // dữ liệu cập nhật
    );

    res.json(makeResponse("success", "Cập nhật thành công", consultant));
  } catch (err) {
    console.error(err);
    res.status(400).json(makeResponse("error", err.message));
  }
};

exports.deleteConsultant = async (req, res) => {
  try {
    const result = await ManagerService.deleteConsultant(req.user, req.params.id);
    res.json(makeResponse("success", "Đã xóa tư vấn viên", result));
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
  }
};

exports.getConsultantPerformance = async (req, res) => {
  try {
    const data = await ManagerService.getConsultantPerformance(
      req.user,        // TRUONGBANTUVAN đang đăng nhập
      req.params.id    // id tư vấn viên
    );
    res.json(makeResponse("success", "Lấy hiệu suất thành công", data));
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
  }
};
