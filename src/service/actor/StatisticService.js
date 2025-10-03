const User = require("../../models/User");
const Question = require("../../models/Question");
const Answer = require("../../models/Answer");
const Post = require("../../models/Post");
const Field = require("../../models/Field");
const { Types } = require("mongoose");

exports.getOverviewStatistics = async (departmentId) => {
  // Số lượng tư vấn viên trong khoa
  const totalConsultants = await User.countDocuments({
    department: departmentId,
    role: "TUVANVIEN",
  });

  // Tổng số câu hỏi của khoa
  const totalQuestions = await Question.countDocuments({
    department: departmentId,
    statusDelete: { $ne: true },
  });

  // Tổng số câu trả lời của khoa
  const questionIds = await Question.find({
    department: departmentId,
    statusDelete: { $ne: true },
  }).distinct("_id");

  const totalAnswers = await Answer.countDocuments({
    question: { $in: questionIds },
  });

  // Số câu hỏi chưa có câu trả lời
  const unansweredQuestions = await Question.countDocuments({
    department: departmentId,
    statusAnswer: false,
    statusDelete: { $ne: true },
  });

  // Tổng số bài viết trong khoa
  const userIds = await User.find({ department: departmentId }).distinct("_id");
  const totalPosts = await Post.countDocuments({
    user: { $in: userIds },
  });

  // Số lượng lĩnh vực trong khoa
  const totalFields = await Field.countDocuments({ department: departmentId });

  // === TÍNH MỚI THÊM ===

  // Tỷ lệ % câu hỏi được trả lời
  const answeredRate =
    totalQuestions > 0 ? (totalAnswers / totalQuestions) * 100 : 0;

  // Số câu hỏi mới trong tháng này
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const questionsThisMonth = await Question.countDocuments({
    department: departmentId,
    statusDelete: { $ne: true },
    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
  });

  return {
    totalConsultants,
    totalQuestions,
    totalAnswers,
    unansweredQuestions,
    totalPosts,
    totalFields,
    answeredRate: answeredRate.toFixed(2), 
    questionsThisMonth,
  };
};

exports.getQuestionStatistics = async (departmentId) => {
  const depId = new Types.ObjectId(departmentId);

  // Tổng số câu hỏi trong khoa
  const totalQuestions = await Question.countDocuments({
    department: depId,
    statusDelete: { $ne: true },
  });

  // Câu hỏi đã trả lời
  const answered = await Question.countDocuments({
    department: depId,
    statusAnswer: true,
    statusDelete: { $ne: true },
  });

  // Câu hỏi chưa trả lời
  const notAnswered = await Question.countDocuments({
    department: depId,
    statusAnswer: false,
    statusDelete: { $ne: true },
  });

  // Câu hỏi đang chờ duyệt
  const pendingApproval = await Question.countDocuments({
    department: depId,
    statusApproval: false,
    statusDelete: { $ne: true },
  });

  // Số câu hỏi theo tháng
  const questionsByMonth = await Question.aggregate([
    { $match: { department: depId, statusDelete: { $ne: true } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        total: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Top 5 lĩnh vực có nhiều câu hỏi nhất
  const topFields = await Question.aggregate([
    { $match: { department: depId, statusDelete: { $ne: true } } },
    { $group: { _id: "$field", total: { $sum: 1 } } },
    { $sort: { total: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "fields", // nhớ check tên collection thật sự là "fields"
        localField: "_id",
        foreignField: "_id",
        as: "fieldInfo",
      },
    },
    { $unwind: { path: "$fieldInfo", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        fieldId: "$fieldInfo._id",
        fieldName: "$fieldInfo.name",
        total: 1,
      },
    },
  ]);

  // Thống kê theo năm
  const questionsByYear = await Question.aggregate([
    { $match: { department: depId, statusDelete: { $ne: true } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" } },
        total: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1 } },
  ]);

  return {
    totalQuestions,
    byStatus: {
      answered,
      notAnswered,
      pendingApproval,
    },
    questionsByMonth,
    topFields,
    questionsByYear,
  };
};

exports.getAnswerStatistics = async (departmentId) => {
  try {
    const depId = new Types.ObjectId(departmentId);

    const stats = await Answer.aggregate([
      {
        $lookup: {
          from: "questions",
          localField: "question",
          foreignField: "_id",
          as: "questionData"
        }
      },
      { $unwind: "$questionData" },
      { $match: { "questionData.department": depId } },
      {
        $facet: {
          totalAnswers: [{ $count: "count" }],
          approvedAnswers: [
            { $match: { statusApproval: true } },
            { $count: "count" }
          ],
          notApprovedAnswers: [
            { $match: { statusApproval: false } },
            { $count: "count" }
          ],
          avgResponseTime: [
            {
              $project: {
                responseTime: {
                  $subtract: ["$createdAt", "$questionData.createdAt"]
                }
              }
            },
            {
              $group: {
                _id: null,
                avgResponse: { $avg: "$responseTime" }
              }
            }
          ],
          topConsultants: [
            {
              $group: {
                _id: "$user",
                total: { $sum: 1 }
              }
            },
            { $sort: { total: -1 } },
            { $limit: 5 }
          ]
        }
      }
    ]);

    const data = stats[0] || {};
    return {
      totalAnswers: data.totalAnswers[0]?.count || 0,
      approvedAnswers: data.approvedAnswers[0]?.count || 0,
      notApprovedAnswers: data.notApprovedAnswers[0]?.count || 0,
      avgResponseTime: data.avgResponseTime[0]
        ? Math.round(data.avgResponseTime[0].avgResponse / 1000 / 60) // phút
        : 0,
      topConsultants: data.topConsultants || []
    };
  } catch (error) {
    console.error("Error in getAnswerStatistics Service:", error);
    throw error;
  }
};