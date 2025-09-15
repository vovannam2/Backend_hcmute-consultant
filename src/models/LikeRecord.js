const mongoose = require('mongoose');

const likeRecordSchema = new mongoose.Schema({
  // ID của đối tượng được like
  targetId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  
  // Người like
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Loại đối tượng được like
  type: { 
    type: String, 
    enum: ['QUESTION', 'ANSWER', 'POST', 'COMMENT'], 
    required: true 
  },
  
  // Thời gian like
  likedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Indexes
likeRecordSchema.index({ targetId: 1, type: 1 });
likeRecordSchema.index({ userId: 1 });
likeRecordSchema.index({ likedAt: -1 });

// Compound index để tránh like trùng
likeRecordSchema.index({ 
  targetId: 1, 
  userId: 1, 
  type: 1 
}, { unique: true });

module.exports = mongoose.model('LikeRecord', likeRecordSchema);
