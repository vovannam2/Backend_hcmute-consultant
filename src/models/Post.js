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

  // Trạng thái duyệt
  approved: {
    type: Boolean,
    default: false
  },

  // Số lượt xem
  views: {
    type: Number,
    default: 0
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

// Transform _id thành id để đồng bộ với frontend
postSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    const { _id, ...rest } = ret;
    return { id: _id, ...rest };
  }
});

module.exports = mongoose.model('Post', postSchema);
