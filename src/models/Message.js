const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Tham chiếu đến cuộc trò chuyện
  conversation: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Conversation', 
    required: true 
  },
  
  // Người gửi và nhận
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Nội dung tin nhắn
  message: { 
    type: String 
  },
  imageUrl: { 
    type: String 
  },
  fileUrl: { 
    type: String 
  },
  typeUrl: { 
    type: String 
  },
  
  // Thời gian
  date: { 
    type: Date, 
    default: Date.now 
  },
  
  // Trạng thái tin nhắn
  messageStatus: { 
    type: String, 
    enum: ['SENT', 'DELIVERED', 'READ'], 
    default: 'SENT' 
  },
  
  // Thu hồi tin nhắn
  recalledForEveryone: { 
    type: Boolean, 
    default: false 
  },
  
  // Chỉnh sửa tin nhắn
  edited: { 
    type: Boolean, 
    default: false 
  },
  editedDate: { 
    type: Date 
  }
}, {
  timestamps: true
});

// Indexes
messageSchema.index({ conversation: 1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ receiver: 1 });
messageSchema.index({ date: -1 });
messageSchema.index({ messageStatus: 1 });

module.exports = mongoose.model('Message', messageSchema);
