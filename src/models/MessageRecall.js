const mongoose = require('mongoose');

const messageRecallSchema = new mongoose.Schema({
  // Tin nhắn bị thu hồi
  message: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Message', 
    required: true 
  },
  
  // Người thu hồi
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Thời gian thu hồi
  recalledAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Indexes
messageRecallSchema.index({ message: 1 });
messageRecallSchema.index({ user: 1 });
messageRecallSchema.index({ recalledAt: -1 });

module.exports = mongoose.model('MessageRecall', messageRecallSchema);
