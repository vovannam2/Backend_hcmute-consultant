const ConsultationScheduleService = require('../../service/actor/ConsultationScheduleService');
const { DataResponse, ExceptionResponse } = require('../../utils/response');

// GET /consultation-schedule/list - Get all consultation schedules with filters
exports.getConsultationSchedules = async (req, res) => {
  try {
    const result = await ConsultationScheduleService.getConsultationSchedules(req.query);
    return res.status(200).json(new DataResponse(result, 'Lấy danh sách lịch tư vấn thành công', 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// GET /consultation-schedule/detail - Get consultation schedule by ID
exports.getConsultationScheduleById = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const schedule = await ConsultationScheduleService.getConsultationScheduleById(scheduleId);
    return res.status(200).json(new DataResponse(schedule, 'Lấy chi tiết lịch tư vấn thành công', 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// POST /advisor-admin/consultation-schedule/create - Create new consultation schedule
exports.createConsultationSchedule = async (req, res) => {
  try {
    const schedule = await ConsultationScheduleService.createConsultationSchedule(req.body, req.user);
    return res.status(201).json(new DataResponse(schedule, 'Tạo lịch tư vấn thành công', 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// POST /consultant/consultation-schedule/confirm - Confirm consultation schedule
exports.confirmConsultationSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const schedule = await ConsultationScheduleService.confirmConsultationSchedule(scheduleId, req.body, req.user);
    return res.status(200).json(new DataResponse(schedule, 'Xác nhận lịch tư vấn thành công', 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// DELETE /consultation-schedule/delete - Delete consultation schedule
exports.deleteConsultationSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    await ConsultationScheduleService.deleteConsultationSchedule(scheduleId, req.user);
    return res.status(200).json(new DataResponse(null, 'Xóa lịch tư vấn thành công', 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// GET /advisor-admin/consultation-schedule/list-member-join - Get list of members who joined
exports.getListMemberJoin = async (req, res) => {
  try {
    const { consultationScheduleId } = req.query;
    const result = await ConsultationScheduleService.getListMemberJoin(consultationScheduleId);
    return res.status(200).json(new DataResponse(result, 'Lấy danh sách thành viên tham gia thành công', 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// POST /user/consultation-schedule/join - Join consultation schedule
exports.joinConsultationSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.query;
    const result = await ConsultationScheduleService.joinConsultationSchedule(scheduleId, req.user);
    return res.status(200).json(new DataResponse(result, 'Tham gia hoạt động thành công', 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// POST /user/consultation-schedule/cancel - Cancel consultation registration
exports.cancelConsultationRegistration = async (req, res) => {
  try {
    const { scheduleId } = req.query;
    const result = await ConsultationScheduleService.cancelConsultationRegistration(scheduleId, req.user);
    return res.status(200).json(new DataResponse(result, 'Hủy tham gia thành công', 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

// GET /user/consultation-schedule/check - Check if user joined
exports.checkJoinConsultation = async (req, res) => {
  try {
    const { scheduleId } = req.query;
    const result = await ConsultationScheduleService.checkJoinConsultation(scheduleId, req.user);
    return res.status(200).json(new DataResponse(result, 'Kiểm tra tham gia thành công', 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};
