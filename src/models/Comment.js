const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  // Nội dung bình luận
  comment: { 
    type: String, 
    required: true 
  },
  
  // Bài viết
  post: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Post', 
    required: true 
  },
  
  // Người bình luận
  userComment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Bình luận cha (cho reply)
  parentComment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Comment' 
  },
  
  // Thời gian tạo
  createDate: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Indexes
commentSchema.index({ post: 1 });
commentSchema.index({ userComment: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ createDate: -1 });

// Virtual để lấy bình luận con
commentSchema.virtual('childComments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment'
});

// Transform _id thành id để đồng bộ với frontend
commentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    const { _id, ...rest } = ret;
    return { id: _id, ...rest };
  }
});

module.exports = mongoose.model('Comment', commentSchema);
