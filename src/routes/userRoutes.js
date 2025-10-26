const express = require("express");
const { getProfile, updateProfile, uploadAvatar: uploadAvatarController, getConsultantsByDepartment, getOnlineConsultants, getAllConsultants, getConsultantById, changePassword } = require("../controllers/common/UserController");
const { joinConsultationSchedule, cancelConsultationRegistration, checkJoinConsultation } = require("../controllers/actor/ConsultationScheduleController");
const authMiddleware = require("../middleware/authMiddleware");
const { uploadImageOnly } = require("../config/cloudinary");

const router = express.Router();

// =======================
// 🔹 User APIs (Private)
// =======================
router.get("/profile", authMiddleware(), getProfile);
// router.put("/profile", authMiddleware(), updateProfile);
router.put("/profile", authMiddleware(), updateProfile);

router.post("/change-password", authMiddleware(), changePassword);

router.post("/upload-avatar", authMiddleware(), uploadImageOnly.single("avatar"), uploadAvatarController);

// Lấy danh sách tư vấn viên theo khoa
router.get("/consultants-by-department", authMiddleware(), getConsultantsByDepartment);

// Lấy danh sách tư vấn viên đang online
router.get("/online-consultants", authMiddleware(), getOnlineConsultants);

// Lấy tất cả tư vấn viên
router.get("/list-consultant", getAllConsultants);

// Lấy thông tin tư vấn viên theo ID
router.get("/list-consultant/:id", getConsultantById);

// Consultation schedule APIs
router.post("/consultation-schedule/join", authMiddleware(), joinConsultationSchedule);
router.post("/consultation-schedule/cancel", authMiddleware(), cancelConsultationRegistration);
router.get("/consultation-schedule/check", authMiddleware(), checkJoinConsultation);

module.exports = router;
