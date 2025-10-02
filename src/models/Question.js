const mongoose = require('mongoose');
const questionSchema = new mongoose.Schema({
  // Thông tin câu hỏi
  title: { 
    type: String, 
    required: true, 
    maxlength: 255 
  },
  content: { 
    type: String, 
    required: true, 
    maxlength: 900 
  },
  fileUrl: { 
    type: String, 
    maxlength: 500
  },
  
  // Thông tin người hỏi
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Phân loại câu hỏi
  department: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department', 
    required: true 
  },
  field: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Field', 
    required: true 
  },
  roleAsk: { 
    type: String, 
    enum: ['SINHVIEN', 'GIANGVIEN', 'NHANVIEN', 'USER'], 
    required: true 
  },
  
  // Câu hỏi cha (cho câu hỏi phụ)
  parentQuestion: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question' 
  },
  
  // Thống kê
  views: { 
    type: Number, 
    default: 0 
  },
  
  // Trạng thái
  statusApproval: { 
    type: Boolean, 
    default: false 
  },
  statusAnswer: { 
    type: Boolean, 
    default: false 
  },
  statusPublic: { 
    type: Boolean, 
    default: true 
  },
  statusDelete: { 
    type: Boolean, 
    default: false 
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
questionSchema.index({ user: 1 });
questionSchema.index({ department: 1 });
questionSchema.index({ field: 1 });
questionSchema.index({ statusApproval: 1 });
questionSchema.index({ statusPublic: 1 });
questionSchema.index({ statusDelete: 1 });
questionSchema.index({ createdAt: -1 });

// Virtual để lấy câu hỏi con
questionSchema.virtual('subQuestions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'parentQuestion'
});

// Virtual để lấy câu trả lời
questionSchema.virtual('answers', {
  ref: 'Answer',
  localField: '_id',
  foreignField: 'question'
});

module.exports = mongoose.model('Question', questionSchema);
