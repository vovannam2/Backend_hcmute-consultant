const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Người gửi và nhận (ObjectId tham chiếu đến User)
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  receiverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  
  // Nội dung thông báo
  content: { 
    type: String, 
    required: true, 
    maxlength: 255 
  },
  
  // Thời gian
  time: { 
    type: Date, 
    default: Date.now 
  },
  
  // Loại thông báo
  notificationType: { 
    type: String, 
    enum: ['QUESTION', 'ANSWER', 'RATING', 'CONSULTATION', 'MESSAGE', 'SYSTEM', 'LIKE'], 
    required: true 
  },
  
  // Trạng thái thông báo
  status: { 
    type: String, 
    enum: ['UNREAD', 'READ'], 
    default: 'UNREAD' 
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ receiverId: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ time: -1 });
notificationSchema.index({ notificationType: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
