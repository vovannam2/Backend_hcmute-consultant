const mongoose = require('mongoose');

// Schema cho địa chỉ (embedded document)
const addressSchema = new mongoose.Schema({
  line: { type: String, maxlength: 255 },
  province: { type: String, maxlength: 20 },
  district: { type: String, maxlength: 20 },
  ward: { type: String, maxlength: 20 }
}, { _id: false });

const userSchema = new mongoose.Schema({
  // Thông tin cơ bản
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    maxlength: 50,
    lowercase: true 
  },
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    maxlength: 50 
  },
  password: { 
    type: String, 
    required: true, 
    maxlength: 255 
  },
  
  // Thông tin xác thực
  provider: { 
    type: String, 
    enum: ['local', 'google'], 
    default: 'local' 
  },
  providerId: { type: String },
  
  // Thông tin cá nhân
  studentCode: { 
    type: String, 
    unique: true, 
    maxlength: 50 
  },
  schoolName: { type: String, maxlength: 255 },
  firstName: { type: String, maxlength: 50 },
  lastName: { type: String, maxlength: 50 },
  phone: { 
    type: String, 
    unique: true, 
    maxlength: 10 
  },
  avatarUrl: { type: String, maxlength: 900 },
  gender: { 
    type: String, 
    enum: ['Nam', 'Nữ', 'Khác'], 
    maxlength: 3 
  },
  
  // Địa chỉ
  address: addressSchema,
  
  // Thông tin tài khoản
  isActivity: { type: Boolean, default: true },
  isOnline: { type: Boolean, default: false },
  lastActivity: { type: Date },
  
  // Xác thực email
  verifyCode: { type: String, maxlength: 50 },
  verifyRegister: { type: String, maxlength: 50 },
  verifyCodeExpirationTime: { type: Date },
  verifyCodeAttemptCount: { type: Number, default: 0 },
  
  // Phân quyền
  role: { 
    type: String, 
    enum: ['USER', 'TUVANVIEN', 'TRUONGBANTUVAN', 'ADMIN'], 
    required: true 
  },
  roleConsultant: { 
    type: String, 
    enum: ['GIANGVIEN', 'SINHVIEN'] 
  },
  
  // Tham chiếu đến khoa/phòng ban
  department: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Department' 
  },
  
  // Thời gian tạo
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Indexes để tối ưu truy vấn
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
userSchema.index({ isActivity: 1 });

// Virtual để lấy tên đầy đủ
userSchema.virtual('fullName').get(function() {
  return `${this.lastName} ${this.firstName}`.trim();
});

// Method để kiểm tra quyền
userSchema.methods.hasRole = function(role) {
  return this.role === role;
};

// Method để kiểm tra có phải tư vấn viên không
userSchema.methods.isConsultant = function() {
  return this.role === 'TUVANVIEN';
};

// Method để kiểm tra có phải trưởng ban không
userSchema.methods.isDepartmentHead = function() {
  return this.role === 'TRUONGBANTUVAN';
};

module.exports = mongoose.model('User', userSchema);