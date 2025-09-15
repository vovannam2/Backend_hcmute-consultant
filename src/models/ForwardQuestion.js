const mongoose = require('mongoose');

const forwardQuestionSchema = new mongoose.Schema({
  // Câu hỏi được chuyển tiếp
  question: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question', 
    required: true 
  },
  
  // Khoa/phòng ban gửi và nhận
  fromDepartment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Department', 
    required: true 
  },
  toDepartment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Department', 
    required: true 
  },
  
  // Tiêu đề chuyển tiếp
  title: { 
    type: String, 
    maxlength: 255 
  },
  
  // Trạng thái chuyển tiếp
  statusForward: { 
    type: Boolean, 
    default: false 
  },
  
  // Tư vấn viên xử lý
  consultant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  // Người tạo chuyển tiếp
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
forwardQuestionSchema.index({ question: 1 });
forwardQuestionSchema.index({ fromDepartment: 1 });
forwardQuestionSchema.index({ toDepartment: 1 });
forwardQuestionSchema.index({ statusForward: 1 });
forwardQuestionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ForwardQuestion', forwardQuestionSchema);
