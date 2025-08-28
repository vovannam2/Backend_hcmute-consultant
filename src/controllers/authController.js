const bcrypt = require('bcrypt');
const User = require("../models/User");
const OtpToken = require("../models/OtpToken");
const { generateOtp } = require("../utils/otp");
const { sendOtpMail } = require("../utils/sendEmail");

// ===== REGISTER WITH OTP =====

// B1: nhận info -> tạo OTP (chưa tạo user)
const registerRequest = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password)
      return res.status(400).json({ error: "Missing fields" });

    const exists = await User.findOne({ email });
    if (exists && exists.isVerified)
      return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);

    // clear OTP cũ
    await OtpToken.deleteMany({ email, purpose: "register" });

    const code = generateOtp(6);
    const ttlMin = Number(process.env.OTP_EXPIRES_MIN || 5);
    const expiresAt = new Date(Date.now() + ttlMin * 60 * 1000);

    await OtpToken.create({
      email,
      code,
      purpose: "register",
      fullName,
      passwordHash,
      expiresAt,
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
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: "Missing fields" });

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

    // OTP đúng
    let user = await User.findOne({ email });
    if (user) {
      user.fullName = otpDoc.fullName || user.fullName;
      user.passwordHash = otpDoc.passwordHash || user.passwordHash;
      user.isVerified = true;
      await user.save();
    } else {
      user = await User.create({
        fullName: otpDoc.fullName,
        email,
        passwordHash: otpDoc.passwordHash,
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
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
  registerRequest,
  registerVerify,
};
