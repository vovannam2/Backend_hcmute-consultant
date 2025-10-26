const mongoose = require('mongoose');

const provinceSchema = new mongoose.Schema({
  // Mã tỉnh/thành phố
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    maxlength: 20 
  },
  
  // Tên tỉnh/thành phố
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
  }
}, {
  timestamps: true
});

// Indexes
provinceSchema.index({ code: 1 });
provinceSchema.index({ name: 1 });

// Transform _id thành id để đồng bộ với frontend
provinceSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    const { _id, ...rest } = ret;
    return { id: _id, ...rest };
  }
});

module.exports = mongoose.model('Province', provinceSchema);
