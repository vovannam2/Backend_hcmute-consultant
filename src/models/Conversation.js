const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  // Thông tin cuộc trò chuyện
  name: { 
    type: String, 
    maxlength: 255 
  },
  avatarUrl: { 
    type: String 
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
  
  // Trạng thái
  statusActive: { 
    type: Boolean, 
    default: true 
  },
  isGroup: { 
    type: Boolean, 
    default: false 
  },
  
  // Danh sách thành viên (cho nhóm)
  members: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    joinedAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  
  // Danh sách thành viên đã xóa cuộc trò chuyện
  deletedBy: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    deletedAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  
  // Thời gian tạo
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Indexes
conversationSchema.index({ user: 1 });
conversationSchema.index({ consultant: 1 });
conversationSchema.index({ department: 1 });
conversationSchema.index({ statusActive: 1 });
conversationSchema.index({ createdAt: -1 });

// Virtual để lấy tin nhắn
conversationSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'conversation'
});

module.exports = mongoose.model('Conversation', conversationSchema);
