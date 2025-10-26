const mongoose = require('mongoose');

const roleAuthSchema = new mongoose.Schema({
  // Người dùng
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Token ID
  tokenId: { 
    type: String, 
    required: true 
  },
  
  // Thời gian hết hạn
  expiredTime: { 
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
roleAuthSchema.index({ user: 1 });
roleAuthSchema.index({ tokenId: 1 });
roleAuthSchema.index({ expiredTime: 1 });

// Transform _id thành id để đồng bộ với frontend
roleAuthSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    const { _id, ...rest } = ret;
    return { id: _id, ...rest };
  }
});

module.exports = mongoose.model('RoleAuth', roleAuthSchema);
