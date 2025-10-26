const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  // Thông tin câu trả lời
  title: { 
    type: String, 
    maxlength: 255 
  },
  content: { 
    type: String, 
    required: true, 
    maxlength: 255 
  },
  file: { 
    type: String, 
    maxlength: 255 
  },
  
  // Tham chiếu đến câu hỏi
  question: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question', 
    required: true 
  },
  
  // Thông tin người trả lời
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  roleConsultant: { 
    type: String, 
    enum: ['USER', 'TUVANVIEN', 'TRUONGBANTUVAN', 'GIANGVIEN', 'SINHVIEN'], 
    required: true 
  },
  
  // Trạng thái
  statusApproval: { 
    type: Boolean, 
    default: false 
  },
  statusAnswer: { 
    type: Boolean, 
    default: true 
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
answerSchema.index({ question: 1 });
answerSchema.index({ user: 1 });
answerSchema.index({ statusApproval: 1 });
answerSchema.index({ createdAt: -1 });

// Transform _id thành id để đồng bộ với frontend
answerSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    const { _id, ...rest } = ret;
    return { id: _id, ...rest };
  }
});

module.exports = mongoose.model('Answer', answerSchema);
