const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const ManagerController = require("../controllers/actor/ManagerController");
const { uploadAny } = require("../config/cloudinary");

const router = express.Router();

router.get("/answers/pending-review", authMiddleware(["TRUONGBANTUVAN"]), ManagerController.getPendingAnswers);
router.put("/answers/:id/approve", authMiddleware(["TRUONGBANTUVAN"]), ManagerController.approveAnswer);
router.put("/answers/:id/reject", authMiddleware(["TRUONGBANTUVAN"]), ManagerController.rejectAnswer);
// router.post("/answers/:id/feedback", authMiddleware(["TRUONGBANTUVAN"]), ManagerController.sendFeedback);
router.get("/consultants",authMiddleware(["TRUONGBANTUVAN"]),ManagerController.getConsultants);
router.post("/consultants", authMiddleware(["TRUONGBANTUVAN"]), ManagerController.addConsultant);
router.put("/consultants/:id",authMiddleware(["TRUONGBANTUVAN"]),ManagerController.updateConsultant);
router.delete("/consultants/:id",authMiddleware(["TRUONGBANTUVAN"]),ManagerController.deleteConsultant);
router.get("/consultants/:id/performance",authMiddleware(["TRUONGBANTUVAN"]),ManagerController.getConsultantPerformance);

// Advisor-Admin routes
router.post("/answer/review", authMiddleware(["TRUONGBANTUVAN", "ADMIN"]), uploadAny.single("file"), ManagerController.reviewAnswer);
router.post("/common-question/convert-to-common", authMiddleware(["TRUONGBANTUVAN", "ADMIN"]), ManagerController.convertToCommonQuestion);

module.exports = router;
