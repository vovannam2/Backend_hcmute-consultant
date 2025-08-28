const mongoose = require("mongoose");

<<<<<<< HEAD
const otpTokenSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // OTP hết hạn sau 5 phút
});

module.exports = mongoose.model("OtpToken", otpTokenSchema);
=======
const OtpTokenSchema = new mongoose.Schema(
  {
    email:   { type: String, required: true, index: true },
    code:    { type: String, required: true }, // '123456'
    purpose: { type: String, enum: ["register", "forgot"], required: true },

    // (Đăng ký) kèm dữ liệu tạm
    fullName:     { type: String },
    password: { type: String },

    // TTL
    expiresAt: { type: Date, required: true },
    attempts:  { type: Number, default: 0 }
  },
  { timestamps: true }
);

// TTL index: tự xóa khi hết hạn
OtpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OtpToken", OtpTokenSchema);
>>>>>>> main
