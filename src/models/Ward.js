const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema({
  // Mã phường/xã
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    maxlength: 20 
  },
  
  // Tên phường/xã
  name: { 
    type: String, 
    required: true, 
    maxlength: 255 
  },
  nameEn: { 
    type: String, 
    maxlength: 255 
  },
  fullName: { 
    type: String, 
    maxlength: 255 
  },
  fullNameEn: { 
    type: String, 
    maxlength: 255 
  },
  codeName: { 
    type: String, 
    maxlength: 255 
  },
  
  // Quận/huyện
  district: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'District', 
    required: true 
  }
}, {
  timestamps: true
});

// Indexes
wardSchema.index({ code: 1 });
wardSchema.index({ name: 1 });
wardSchema.index({ district: 1 });

// Transform _id thành id để đồng bộ với frontend
wardSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    const { _id, ...rest } = ret;
    return { id: _id, ...rest };
  }
});

module.exports = mongoose.model('Ward', wardSchema);
