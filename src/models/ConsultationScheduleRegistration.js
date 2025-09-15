const mongoose = require('mongoose');

const consultationScheduleRegistrationSchema = new mongoose.Schema({
  // Thành viên đăng ký
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Lịch tư vấn
  consultationSchedule: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ConsultationSchedule', 
    required: true 
  },
  
  // Thời gian đăng ký
  registeredAt: { 
    type: Date, 
    default: Date.now 
  },
  
  // Trạng thái đăng ký
  status: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

// Indexes
consultationScheduleRegistrationSchema.index({ user: 1 });
consultationScheduleRegistrationSchema.index({ consultationSchedule: 1 });
consultationScheduleRegistrationSchema.index({ registeredAt: -1 });

// Compound index để tránh đăng ký trùng
consultationScheduleRegistrationSchema.index({ 
  user: 1, 
  consultationSchedule: 1 
}, { unique: true });

module.exports = mongoose.model('ConsultationScheduleRegistration', consultationScheduleRegistrationSchema);
