const mongoose = require('mongoose');

const consultationScheduleSchema = new mongoose.Schema({
  // Thông tin lịch tư vấn
  title: { 
    type: String, 
    required: true, 
    maxlength: 255 
  },
  content: { 
    type: String, 
    maxlength: 255 
  },
  
  // Thời gian và địa điểm
  consultationDate: { 
    type: Date, 
    required: true 
  },
  consultationTime: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    maxlength: 255 
  },
  link: { 
    type: String, 
    maxlength: 255 
  },
  
  // Chế độ tư vấn
  mode: { 
    type: Boolean, 
    default: false // false: offline, true: online
  },
  
  // Trạng thái
  statusConfirmed: { 
    type: Boolean, 
    default: false 
  },
  statusPublic: { 
    type: Boolean, 
    default: true 
  },
  
  // Loại tư vấn
  type: { 
    type: Boolean, 
    default: false // false: cá nhân, true: nhóm
  },
  
  // Thành viên tham gia
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  consultant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Khoa/phòng ban
  department: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Department', 
    required: true 
  },
  
  // Người tạo
  createdBy: { 
    type: Number, 
    required: true 
  },
  
  // Thời gian tạo
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Indexes
consultationScheduleSchema.index({ user: 1 });
consultationScheduleSchema.index({ consultant: 1 });
consultationScheduleSchema.index({ department: 1 });
consultationScheduleSchema.index({ consultationDate: 1 });
consultationScheduleSchema.index({ statusConfirmed: 1 });
consultationScheduleSchema.index({ statusPublic: 1 });

// Virtual để lấy đăng ký tư vấn
consultationScheduleSchema.virtual('registrations', {
  ref: 'ConsultationScheduleRegistration',
  localField: '_id',
  foreignField: 'consultationSchedule'
});

module.exports = mongoose.model('ConsultationSchedule', consultationScheduleSchema);
