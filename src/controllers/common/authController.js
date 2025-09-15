const bcrypt = require("bcrypt");
const User = require("../../models/User");
const OtpToken = require("../../models/OtpToken");
const { generateOtp } = require("../../utils/otp");
const { sendOtpMail } = require("../../utils/sendEmail");
const jwt = require("jsonwebtoken");

// ===== FORGOT PASSWORD =====

// Gửi OTP
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email không tồn tại" });

    const code = generateOtp(6);

    await OtpToken.deleteMany({ email, purpose: "reset" });
    const ttlMin = Number(process.env.OTP_EXPIRES_MIN || 5);
    const expiresAt = new Date(Date.now() + ttlMin * 60 * 1000);

    const otpToken = new OtpToken({ email, code, purpose: "reset", expiresAt });
    await otpToken.save();

    await sendOtpMail({ email, code, purpose: "reset" });

    res.json({ message: "OTP đã được gửi đến email", ttlMinutes: ttlMin });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Xác minh OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    const record = await OtpToken.findOne({ email, code, purpose: "reset" });
    if (!record) return res.status(400).json({ message: "OTP không hợp lệ hoặc đã hết hạn" });

    if (record.expiresAt < new Date()) {
      await record.deleteOne();
      return res.status(400).json({ message: "OTP đã hết hạn" });
    }

    res.json({ message: "OTP hợp lệ" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Đặt lại mật khẩu
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const record = await OtpToken.findOne({ email, code, purpose: "reset" });
    if (!record) return res.status(400).json({ message: "OTP không hợp lệ hoặc đã hết hạn" });

    if (record.expiresAt < new Date()) {
      await record.deleteOne();
      return res.status(400).json({ message: "OTP đã hết hạn" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { password: hashedPassword });

    await OtpToken.deleteMany({ email, purpose: "reset" });

    res.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// ===== REGISTER WITH OTP =====

// B1: Nhận info -> tạo OTP (chưa tạo user)
const registerRequest = async (req, res) => {
  try {
    let { fullName, email, password } = req.body;
    if (!fullName || !email || !password)
      return res.status(400).json({ error: "Missing fields" });

    email = String(email).trim().toLowerCase();

    const exists = await User.findOne({ email });
    if (exists && exists.isVerified)
      return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);

    // clear OTP cũ cho mục đích register
    await OtpToken.deleteMany({ email, purpose: "register" });

    const code = generateOtp(6);
    const ttlMin = Number(process.env.OTP_EXPIRES_MIN || 5);
    const expiresAt = new Date(Date.now() + ttlMin * 60 * 1000);

    await OtpToken.create({
      email,
      code,
      purpose: "register",
      fullName,
      password: passwordHash,
      expiresAt,
      attempts: 0,
    });

    await sendOtpMail({ email, code, purpose: "register" });
    return res.json({ message: "OTP sent. Please verify.", ttlMinutes: ttlMin });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// B2: xác thực OTP -> tạo/cập nhật user
const registerVerify = async (req, res) => {
  try {
    let { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: "Missing fields" });

    email = String(email).trim().toLowerCase();

    const otpDoc = await OtpToken.findOne({ email, purpose: "register" });
    if (!otpDoc) return res.status(400).json({ error: "OTP not found, request again" });

    if (otpDoc.expiresAt < new Date()) {
      await otpDoc.deleteOne();
      return res.status(400).json({ error: "OTP expired, request again" });
    }

    if (otpDoc.attempts >= 5) {
      await otpDoc.deleteOne();
      return res.status(429).json({ error: "Too many attempts, request OTP again" });
    }

    if (otpDoc.code !== code) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (!otpDoc.password) {
      return res.status(500).json({ error: "OTP record invalid (missing password hash)" });
    }

    // OTP đúng
    let user = await User.findOne({ email });
    if (user) {
      user.fullName = otpDoc.fullName || user.fullName;
      user.password = otpDoc.password || user.password;
      user.isVerified = true;
      await user.save();
    } else {
      user = await User.create({
        fullName: otpDoc.fullName,
        email,
        password: otpDoc.password,
        isVerified: true,
      });
    }

    await otpDoc.deleteOne();
    return res.status(201).json({ message: "Register success", userId: user._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ===== LOGIN =====
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== EXPORTS =====
module.exports = {
  forgotPassword,
  verifyOtp,
  resetPassword,
  registerRequest,
  registerVerify,
  login,
};
