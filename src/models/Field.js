const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    maxlength: 255 
  },
  
  // Tham chiếu đến khoa/phòng ban
  department: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Department', 
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
fieldSchema.index({ department: 1 });
fieldSchema.index({ name: 1 });

// Transform _id thành id để đồng bộ với frontend
fieldSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    const { _id, ...rest } = ret;
    return { id: _id, ...rest };
  }
});

module.exports = mongoose.model('Field', fieldSchema);
