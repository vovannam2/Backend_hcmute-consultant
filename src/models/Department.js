const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true, 
    maxlength: 255 
  },
  description: { 
    type: String, 
    maxlength: 500 
  },
  logo: { 
    type: String, 
    maxlength: 255 
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
departmentSchema.index({ name: 1 });

module.exports = mongoose.model('Department', departmentSchema);
