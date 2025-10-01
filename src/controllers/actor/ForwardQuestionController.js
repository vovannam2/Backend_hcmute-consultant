const ForwardQuestionService = require("../../service/actor/ForwardQuestionService");

const makeResponse = (status, message, data = null) => ({
  status,
  message,
  data,
});

exports.forwardQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetDepartmentId, reason } = req.body;

    if (!targetDepartmentId) {
      return res.status(400).json(makeResponse("error", "Thiếu ID khoa đích"));
    }

    const question = await ForwardQuestionService.forwardQuestion(
      id,
      req.user,
      targetDepartmentId,
      reason
    );

    res.json(makeResponse("success", "Đã chuyển tiếp câu hỏi", question));
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
  }
};
