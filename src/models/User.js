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
    maxlength: 50,
    lowercase: true 
  },
  username: { 
    type: String, 
    required: true,
    maxlength: 50 
  },
  password: { 
    type: String, 
    required: true, 
    maxlength: 255 
  },
  
  isVerified: {                
    type: Boolean,
    default: false             
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
    //unique: true,
    maxlength: 50,
    default: null
  },
  schoolName: { type: String, maxlength: 255 },
  fullName: { type: String, maxlength: 100 },
  phone: { 
    type: String, 
    //unique: true, 
    maxlength: 10,
    default: null
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
  isOnline: { type: Boolean, default: false },
  lastActivity: { type: Date },
  
  // Xác thực email
  verifyCode: { type: String, maxlength: 50 },
  verifyRegister: { type: String, maxlength: 50 },
  verifyCodeExpirationTime: { type: Date },
  verifyCodeAttemptCount: { type: Number, default: 0 },
  
  // Refresh Token (🔹 thêm mới)
  refreshToken: { type: String },                       // Lưu refresh token hiện tại
  refreshTokenExpiresAt: { type: Date },                // Thời gian hết hạn refresh token
  
  // Phân quyền
  role: { 
    type: String, 
    enum: ['USER', 'TUVANVIEN', 'TRUONGBANTUVAN'], 
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

// Indexes để tối ưu truy vấn - với unique constraint
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
userSchema.index({ isActivity: 1 });

userSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: "string" } } }
);

userSchema.index(
  { studentCode: 1 },
  { unique: true, partialFilterExpression: { studentCode: { $type: "string" } } }
);


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

// Transform _id thành id để đồng bộ với frontend
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    const { _id, ...rest } = ret;
    return { id: _id, ...rest };
  }
});

module.exports = mongoose.model('User', userSchema);
