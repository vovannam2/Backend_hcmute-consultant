const ConsultationSchedule = require('../../models/ConsultationSchedule');
const ConsultationScheduleRegistration = require('../../models/ConsultationScheduleRegistration');
const User = require('../../models/User');
const Department = require('../../models/Department');
const mongoose = require('mongoose');

// Get all consultation schedules with filters
exports.getConsultationSchedules = async (query) => {
  const {
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    sortDir = 'desc',
    title,
    statusPublic,
    mode,
    type,
    startDate,
    endDate
  } = query;

  // Build filter
  const filter = {};

  if (title) {
    filter.title = { $regex: title, $options: 'i' };
  }

  if (statusPublic !== undefined) {
    filter.statusPublic = statusPublic === 'true';
  }

  if (mode !== undefined) {
    filter.mode = mode === 'true';
  }

  if (type !== undefined) {
    filter.type = type === 'true';
  }

  if (startDate || endDate) {
    filter.consultationDate = {};
    if (startDate) {
      filter.consultationDate.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.consultationDate.$lte = new Date(endDate);
    }
  }

  // Execute query
  const data = await ConsultationSchedule.find(filter)
    .populate('user', 'username fullName email avatarUrl')
    .populate('consultant', 'username fullName email avatarUrl')
    .populate('department', 'name')
    .sort({ [sortBy]: sortDir === 'desc' ? -1 : 1 })
    .skip(Number(page) * Number(size))
    .limit(Number(size));

  const total = await ConsultationSchedule.countDocuments(filter);

  // Transform data for frontend
  const content = await Promise.all(data.map(async (schedule) => {
    const scheduleObj = schedule.toJSON ? schedule.toJSON() : schedule.toObject();
    
    // Count participants
    const participantCount = await ConsultationScheduleRegistration.countDocuments({
      consultationSchedule: schedule._id
    });
    
    return {
      ...scheduleObj,
      id: scheduleObj.id || scheduleObj._id,
      userName: schedule.user?.fullName || schedule.user?.username,
      participantCount
    };
  }));

  return {
    content,
    total,
    page: Number(page),
    size: Number(size),
    totalPages: Math.ceil(total / Number(size))
  };
};

// Get consultation schedule by ID
exports.getConsultationScheduleById = async (scheduleId) => {
  const schedule = await ConsultationSchedule.findById(scheduleId)
    .populate('user', 'username fullName email avatarUrl')
    .populate('consultant', 'username fullName email avatarUrl')
    .populate('department', 'name');

  if (!schedule) {
    const error = new Error('Không tìm thấy lịch tư vấn');
    error.status = 404;
    throw error;
  }

  // Transform to JSON with id field
  const scheduleObj = schedule.toJSON ? schedule.toJSON() : schedule.toObject();

  // Count participants
  const participantCount = await ConsultationScheduleRegistration.countDocuments({
    consultationSchedule: schedule._id
  });

  // Add userName for compatibility with frontend
  return {
    ...scheduleObj,
    id: scheduleObj.id || scheduleObj._id,
    userName: schedule.user?.fullName || schedule.user?.username,
    participantCount
  };
};

// Create new consultation schedule
exports.createConsultationSchedule = async (data, user) => {
  
  // Validate required fields
  if (!data.title) {
    const error = new Error('Tiêu đề là bắt buộc');
    error.status = 400;
    throw error;
  }

  if (!data.consultationDate) {
    const error = new Error('Ngày tư vấn là bắt buộc');
    error.status = 400;
    throw error;
  }

  if (!data.consultationTime) {
    const error = new Error('Giờ tư vấn là bắt buộc');
    error.status = 400;
    throw error;
  }

  // Set consultant to current user if not provided
  // user object có thể có id hoặc sub
  const userId = user.id || user.sub || user._id;
  const consultantId = data.consultant || userId;

  // Check if consultant exists
  const consultant = await User.findById(consultantId);
  if (!consultant) {
    const error = new Error('Không tìm thấy tư vấn viên');
    error.status = 404;
    throw error;
  }

  // Use consultant's department if not provided
  const departmentId = data.department || consultant.department;

  // Convert consultationDate to Date object
  const consultationDateObj = new Date(data.consultationDate);


  try {
    // Create schedule
    const schedule = await ConsultationSchedule.create({
      title: data.title,
      content: data.content || '',
      consultationDate: consultationDateObj,
      consultationTime: data.consultationTime,
      location: data.location || '',
      link: data.link || '',
      mode: data.mode || false,
      statusPublic: data.statusPublic !== undefined ? data.statusPublic : true,
      type: data.type || false,
      user: data.user || consultantId,
      consultant: consultantId,
      department: departmentId,
      createdBy: userId
    });


    const createdSchedule = await ConsultationSchedule.findById(schedule._id)
      .populate('user', 'username fullName email avatarUrl')
      .populate('consultant', 'username fullName email avatarUrl')
      .populate('department', 'name');

    // Transform to JSON with id field
    const scheduleObj = createdSchedule.toJSON ? createdSchedule.toJSON() : createdSchedule.toObject();
    
    return {
      ...scheduleObj,
      id: scheduleObj.id || scheduleObj._id
    };
  } catch (error) {
    throw error;
  }
};

// Confirm consultation schedule
exports.confirmConsultationSchedule = async (scheduleId, data, user) => {
  const schedule = await ConsultationSchedule.findById(scheduleId);

  if (!schedule) {
    const error = new Error('Không tìm thấy lịch tư vấn');
    error.status = 404;
    throw error;
  }

  // Update schedule with confirmation data
  if (data.title !== undefined) schedule.title = data.title;
  if (data.content !== undefined) schedule.content = data.content;
  if (data.consultationDate !== undefined) schedule.consultationDate = data.consultationDate;
  if (data.consultationTime !== undefined) schedule.consultationTime = data.consultationTime;
  if (data.location !== undefined) schedule.location = data.location;
  if (data.link !== undefined) schedule.link = data.link;
  if (data.mode !== undefined) schedule.mode = data.mode;
  if (data.statusPublic !== undefined) schedule.statusPublic = data.statusPublic;

  await schedule.save();

  const updatedSchedule = await ConsultationSchedule.findById(scheduleId)
    .populate('user', 'username fullName email avatarUrl')
    .populate('consultant', 'username fullName email avatarUrl')
    .populate('department', 'name');

  // Transform to JSON with id field
  const scheduleObj = updatedSchedule.toJSON ? updatedSchedule.toJSON() : updatedSchedule.toObject();
  
  return {
    ...scheduleObj,
    id: scheduleObj.id || scheduleObj._id
  };
};

// Delete consultation schedule
exports.deleteConsultationSchedule = async (scheduleId, user) => {
  const schedule = await ConsultationSchedule.findById(scheduleId);

  if (!schedule) {
    const error = new Error('Không tìm thấy lịch tư vấn');
    error.status = 404;
    throw error;
  }

  // Check permission (only creator or admin can delete)
  const userId = user.id || user.sub || user._id;
  if (String(schedule.createdBy) !== String(userId) && user.role !== 'ADMIN') {
    const error = new Error('Không có quyền xóa lịch tư vấn này');
    error.status = 403;
    throw error;
  }

  // Delete related registrations
  await ConsultationScheduleRegistration.deleteMany({ consultationSchedule: scheduleId });

  // Delete schedule
  await ConsultationSchedule.findByIdAndDelete(scheduleId);
};

// Get list of members who joined
exports.getListMemberJoin = async (consultationScheduleId) => {
  const { page = 0, size = 50 } = {};

  const registrations = await ConsultationScheduleRegistration.find({
    consultationSchedule: consultationScheduleId
  })
    .populate('user', 'username fullName email avatarUrl')
    .sort({ registeredAt: -1 })
    .skip(Number(page) * Number(size))
    .limit(Number(size));

  // Transform data for frontend
  const content = registrations.map((reg) => {
    const regObj = reg.toJSON ? reg.toJSON() : reg.toObject();
    return {
      ...regObj,
      id: regObj.id || regObj._id,
      userName: reg.user?.fullName || reg.user?.username,
      avatarUrl: reg.user?.avatarUrl,
      registeredAt: reg.registeredAt,
      status: reg.status
    };
  });

  const total = await ConsultationScheduleRegistration.countDocuments({
    consultationSchedule: consultationScheduleId
  });

  return {
    content,
    total,
    page: Number(page),
    size: Number(size),
    totalPages: Math.ceil(total / Number(size))
  };
};

// Join consultation schedule
exports.joinConsultationSchedule = async (scheduleId, user) => {
  const userId = user.id || user.sub || user._id;
  
  // Check if schedule exists
  const schedule = await ConsultationSchedule.findById(scheduleId);
  if (!schedule) {
    const error = new Error('Không tìm thấy lịch tư vấn');
    error.status = 404;
    throw error;
  }

  // Check if user already joined
  const existingRegistration = await ConsultationScheduleRegistration.findOne({
    user: userId,
    consultationSchedule: scheduleId
  });

  if (existingRegistration) {
    const error = new Error('Bạn đã tham gia hoạt động này');
    error.status = 400;
    throw error;
  }

  // Create registration
  await ConsultationScheduleRegistration.create({
    user: userId,
    consultationSchedule: scheduleId,
    status: true
  });

  return { message: 'Tham gia hoạt động thành công' };
};

// Cancel consultation registration
exports.cancelConsultationRegistration = async (scheduleId, user) => {
  const userId = user.id || user.sub || user._id;
  
  // Find and delete registration
  const registration = await ConsultationScheduleRegistration.findOne({
    user: userId,
    consultationSchedule: scheduleId
  });

  if (!registration) {
    const error = new Error('Bạn chưa tham gia hoạt động này');
    error.status = 400;
    throw error;
  }

  await ConsultationScheduleRegistration.deleteOne({
    user: userId,
    consultationSchedule: scheduleId
  });

  return { message: 'Hủy tham gia thành công' };
};

// Check if user joined
exports.checkJoinConsultation = async (scheduleId, user) => {
  const userId = user.id || user.sub || user._id;
  
  const registration = await ConsultationScheduleRegistration.findOne({
    user: userId,
    consultationSchedule: scheduleId
  });

  return !!registration;
};
