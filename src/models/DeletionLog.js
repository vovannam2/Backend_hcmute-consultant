const mongoose = require('mongoose');

const deletionLogSchema = new mongoose.Schema({
  // Câu hỏi bị xóa
  question: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question', 
    required: true 
  },
  
  // Lý do xóa
  reason: { 
    type: String, 
    required: true 
  },
  
  // Người xóa
  deletedBy: { 
    type: String, 
    required: true 
  },
  
  // Thời gian xóa
  deletedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Indexes
deletionLogSchema.index({ question: 1 });
deletionLogSchema.index({ deletedBy: 1 });
deletionLogSchema.index({ deletedAt: -1 });

// Transform _id thành id để đồng bộ với frontend
deletionLogSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    const { _id, ...rest } = ret;
    return { id: _id, ...rest };
  }
});

module.exports = mongoose.model('DeletionLog', deletionLogSchema);
