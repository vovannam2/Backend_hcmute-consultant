const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const StatisticController = require("../controllers/actor/StatisticController");

const router = express.Router();

router.get("/overview", authMiddleware(["TRUONGBANTUVAN"]), StatisticController.getOverviewStatistics);
router.get("/questions", authMiddleware(["TRUONGBANTUVAN"]), StatisticController.getQuestionStatistics);
router.get("/answers", authMiddleware(["TRUONGBANTUVAN"]), StatisticController.getAnswerStatistics);
module.exports = router;