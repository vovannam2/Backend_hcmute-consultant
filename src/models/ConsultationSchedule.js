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
    type: mongoose.Schema.Types.ObjectId, 
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
consultationScheduleSchema.index({ statusPublic: 1 });

// Virtual để lấy đăng ký tư vấn
consultationScheduleSchema.virtual('registrations', {
  ref: 'ConsultationScheduleRegistration',
  localField: '_id',
  foreignField: 'consultationSchedule'
});

// Virtual để đếm số lượng người tham gia
consultationScheduleSchema.virtual('participantCount', {
  ref: 'ConsultationScheduleRegistration',
  localField: '_id',
  foreignField: 'consultationSchedule',
  count: true
});

// Transform _id thành id để đồng bộ với frontend
consultationScheduleSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    const { _id, ...rest } = ret;
    return { id: _id, ...rest };
  }
});

module.exports = mongoose.model('ConsultationSchedule', consultationScheduleSchema);
