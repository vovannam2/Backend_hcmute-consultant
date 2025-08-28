const User = require("../models/User");
const OtpToken = require("../models/OtpToken");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt");

// Gửi OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email không tồn tại" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OtpToken.deleteMany({ email });
    const otpToken = new OtpToken({ email, otp });
    await otpToken.save();

    await sendEmail(email, "Mã OTP đặt lại mật khẩu", `Mã OTP của bạn là: ${otp}`);

    res.json({ message: "OTP đã được gửi đến email" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Xác minh OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await OtpToken.findOne({ email, otp });
    if (!record) return res.status(400).json({ message: "OTP không hợp lệ hoặc đã hết hạn" });

    res.json({ message: "OTP hợp lệ" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const record = await OtpToken.findOne({ email, otp });
    if (!record) return res.status(400).json({ message: "OTP không hợp lệ hoặc đã hết hạn" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { password: newPassword }); //thay newPasswrd thàng hashedPassword để mã hóa mk

    await OtpToken.deleteMany({ email });

    res.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
