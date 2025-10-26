const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const ConsultationScheduleController = require('../controllers/actor/ConsultationScheduleController');

const router = express.Router();

// GET /consultation-schedule/list - Get all consultation schedules (public or authenticated)
router.get('/consultation-schedule/list', ConsultationScheduleController.getConsultationSchedules);

// GET /consultation-schedule/detail/:scheduleId - Get consultation schedule by ID (public or authenticated)
router.get('/consultation-schedule/detail/:scheduleId', ConsultationScheduleController.getConsultationScheduleById);

// POST /advisor-admin/consultation-schedule/create - Create new consultation schedule (ADMIN or TUVANVIEN)
router.post(
  '/advisor-admin/consultation-schedule/create',
  authMiddleware(['ADMIN', 'TUVANVIEN']),
  ConsultationScheduleController.createConsultationSchedule
);

// POST /consultant/consultation-schedule/confirm/:scheduleId - Confirm consultation schedule (TUVANVIEN)
router.post(
  '/consultant/consultation-schedule/confirm/:scheduleId',
  authMiddleware(['TUVANVIEN', 'ADMIN']),
  ConsultationScheduleController.confirmConsultationSchedule
);

// DELETE /consultation-schedule/delete/:scheduleId - Delete consultation schedule (ADMIN or creator)
router.delete(
  '/consultation-schedule/delete/:scheduleId',
  authMiddleware(['ADMIN', 'TUVANVIEN']),
  ConsultationScheduleController.deleteConsultationSchedule
);

// GET /advisor-admin/consultation-schedule/list-member-join - Get list of members who joined (ADMIN or TUVANVIEN)
router.get(
  '/advisor-admin/consultation-schedule/list-member-join',
  authMiddleware(['ADMIN', 'TUVANVIEN']),
  ConsultationScheduleController.getListMemberJoin
);

module.exports = router;
