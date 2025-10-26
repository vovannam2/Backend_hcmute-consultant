const mongoose = require('mongoose');

const commonQuestionSchema = new mongoose.Schema({
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
  
  // Thông tin câu trả lời
  answerTitle: { 
    type: String, 
    maxlength: 900 
  },
  answerContent: { 
    type: String, 
    required: true, 
    maxlength: 900 
  },
  
  // File đính kèm
  file: { 
    type: String, 
    maxlength: 255 
  },
  fileAnswer: { 
    type: String, 
    maxlength: 255 
  },
  
  // Trạng thái
  status: { 
    type: Boolean, 
    default: true 
  },
  
  // Phân loại
  department: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Department', 
    required: true 
  },
  
  // Người tạo
  createdBy: { 
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
commonQuestionSchema.index({ department: 1 });
commonQuestionSchema.index({ status: 1 });
commonQuestionSchema.index({ createdAt: -1 });

// Transform _id thành id để đồng bộ với frontend
commonQuestionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    const { _id, ...rest } = ret;
    return { id: _id, ...rest };
  }
});

module.exports = mongoose.model('CommonQuestion', commonQuestionSchema);
