const statisticService = require("../../service/actor/StatisticService");
const User = require("../../models/User");

const makeResponse = (status, message, data = null) => ({
  status,
  message,
  data,
});

// GET /api/statistics/overview
exports.getOverviewStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    const departmentId = req.user.department; // trưởng ban thuộc khoa nào thì xem khoa đó

    const stats = await statisticService.getOverviewStatistics(departmentId);

    res.json(makeResponse("success", "Lấy thống kê tổng quan khoa thành công.", stats));
  } catch (err) {
    res.status(400).json(makeResponse("error", err.message));
  }
};

// GET /api/statistics/questions
exports.getQuestionStatistics = async (req, res) => {
  try {
    const departmentId = req.user.department; // trưởng khoa chỉ xem trong khoa mình

    const stats = await statisticService.getQuestionStatistics(departmentId);

    res.json(makeResponse("success", "Lấy thống kê câu hỏi thành công.", stats));
  } catch (err) {
    console.error(err);
    res.status(400).json(makeResponse("error", err.message));
  }
};

exports.getAnswerStatistics = async (req, res) => {
  try {
    // Lấy userId từ token
    const userId = req.user.id;

    // Tìm user để lấy departmentId
    const user = await User.findById(userId).select("department");
    if (!user || !user.department) {
      return res.status(400).json({
        status: "error",
        message: "Không tìm thấy phòng ban của người dùng."
      });
    }

    const departmentId = user.department.toString();

    // Gọi service với departmentId này
    const data = await statisticService.getAnswerStatistics(departmentId);

    return res.status(200).json({
      status: "success",
      message: "Lấy thống kê câu trả lời thành công.",
      data,
    });
  } catch (error) {
    console.error("Error getAnswerStatistics:", error);
    return res.status(500).json({
      status: "error",
      message: "Có lỗi xảy ra khi lấy thống kê câu trả lời.",
    });
  }
};
