const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  // Mã quận/huyện
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    maxlength: 20 
  },
  
  // Tên quận/huyện
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
  
  // Tỉnh/thành phố
  province: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Province', 
    required: true 
  }
}, {
  timestamps: true
});

// Indexes
districtSchema.index({ code: 1 });
districtSchema.index({ name: 1 });
districtSchema.index({ province: 1 });

module.exports = mongoose.model('District', districtSchema);
