const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  // Thông tin bài viết
  title: {
    type: String,
    required: true
  },

  content: {
    type: String,
    required: true
  },

  imageUrl: { 
    type: String 
  },
  
  fileUrl: { 
    type: String 
  },

  // Người tạo
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
postSchema.index({ user: 1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
