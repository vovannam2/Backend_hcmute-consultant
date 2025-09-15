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
  fileName: { 
    type: String 
  },
  
  // Trạng thái
  isAnonymous: { 
    type: Boolean, 
    default: false 
  },
  isApproved: { 
    type: Boolean, 
    default: false 
  },
  
  // Thống kê
  views: { 
    type: Number, 
    default: 0 
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
postSchema.index({ isApproved: 1 });
postSchema.index({ createdAt: -1 });

// Virtual để lấy bình luận
postSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post'
});

module.exports = mongoose.model('Post', postSchema);
