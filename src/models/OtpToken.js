// const mongoose = require("mongoose");

// const OtpTokenSchema = new mongoose.Schema(
//   {
//     email:   { type: String, required: true, index: true },
//     code:    { type: String, required: true }, // '123456'
//     purpose: { type: String, enum: ["register", "forgot", "reset"], required: true },

//     // (Đăng ký) kèm dữ liệu tạm
//     fullName:     { type: String },
//     password: { type: String },

//     // TTL
//     expiresAt: { type: Date, required: true },
//     attempts:  { type: Number, default: 0 }
//   },
//   { timestamps: true }
// );

// // TTL index: tự xóa khi hết hạn
// OtpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// module.exports = mongoose.model("OtpToken", OtpTokenSchema);

const mongoose = require("mongoose");

const OtpTokenSchema = new mongoose.Schema(
  {
    email:   { type: String, required: true, index: true },
    code:    { type: String, required: true },
    purpose: { type: String, enum: ["register", "forgot", "reset"], required: true },

    // Đăng ký tạm
    fullName: { type: String },       // thêm
    password:  { type: String },      // thêm
    role:      { type: String },      // thêm  <<=== QUAN TRỌNG
    studentCode: { type: String },
    phone:     { type: String },      // thêm
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, // thêm cho tư vấn viên
    
    expiresAt: { type: Date, required: true },
    attempts:  { type: Number, default: 0 }
  },
  { timestamps: true }
);

// TTL index để tự xoá khi hết hạn
OtpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Transform _id thành id để đồng bộ với frontend
OtpTokenSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    const { _id, ...rest } = ret;
    return { id: _id, ...rest };
  }
});

module.exports = mongoose.model("OtpToken", OtpTokenSchema);
