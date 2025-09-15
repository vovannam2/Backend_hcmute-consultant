const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  // Người đánh giá và được đánh giá
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
  
  // Đánh giá tổng quát
  generalSatisfaction: { 
    type: Number, 
    min: 1, 
    max: 5, 
    required: true 
  },
  generalComment: { 
    type: String 
  },
  
  // Đánh giá chuyên môn
  expertiseKnowledge: { 
    type: Number, 
    min: 1, 
    max: 5, 
    required: true 
  },
  expertiseComment: { 
    type: String 
  },
  
  // Đánh giá thái độ
  attitude: { 
    type: Number, 
    min: 1, 
    max: 5, 
    required: true 
  },
  attitudeComment: { 
    type: String 
  },
  
  // Đánh giá tốc độ phản hồi
  responseSpeed: { 
    type: Number, 
    min: 1, 
    max: 5, 
    required: true 
  },
  responseSpeedComment: { 
    type: String 
  },
  
  // Đánh giá sự hiểu biết
  understanding: { 
    type: Number, 
    min: 1, 
    max: 5, 
    required: true 
  },
  understandingComment: { 
    type: String 
  },
  
  // Thời gian gửi đánh giá
  submittedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Indexes
ratingSchema.index({ user: 1 });
ratingSchema.index({ consultant: 1 });
ratingSchema.index({ department: 1 });
ratingSchema.index({ submittedAt: -1 });

// Compound index để tránh đánh giá trùng
ratingSchema.index({ 
  user: 1, 
  consultant: 1 
}, { unique: true });

// Virtual để tính điểm trung bình
ratingSchema.virtual('averageRating').get(function() {
  const total = this.generalSatisfaction + this.expertiseKnowledge + 
                this.attitude + this.responseSpeed + this.understanding;
  return (total / 5).toFixed(2);
});

module.exports = mongoose.model('Rating', ratingSchema);
