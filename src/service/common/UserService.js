const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const OtpToken = require("../../models/OtpToken");
const { generateOtp } = require("../../utils/otp");
const { sendOtpMail } = require("../../utils/sendEmail");

// ===== FORGOT PASSWORD =====
const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) throw { status: 404, message: "Email không tồn tại" };

  const code = generateOtp(6);
  await OtpToken.deleteMany({ email, purpose: "reset" });

  const ttlMin = Number(process.env.OTP_EXPIRES_MIN || 5);
  const expiresAt = new Date(Date.now() + ttlMin * 60 * 1000);

  await OtpToken.create({ email, code, purpose: "reset", expiresAt });
  await sendOtpMail({ email, code, purpose: "reset" });

  return { message: "OTP đã được gửi đến email", ttlMinutes: ttlMin };
};

const verifyOtp = async ({ email, code }) => {
  const record = await OtpToken.findOne({ email, code, purpose: "reset" });
  if (!record) throw { status: 400, message: "OTP không hợp lệ hoặc đã hết hạn" };

  if (record.expiresAt < new Date()) {
    await record.deleteOne();
    throw { status: 400, message: "OTP đã hết hạn" };
  }

  return { message: "OTP hợp lệ" };
};

const resetPassword = async ({ email, code, newPassword }) => {
  const record = await OtpToken.findOne({ email, code, purpose: "reset" });
  if (!record) throw { status: 400, message: "OTP không hợp lệ hoặc đã hết hạn" };

  if (record.expiresAt < new Date()) {
    await record.deleteOne();
    throw { status: 400, message: "OTP đã hết hạn" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.updateOne({ email }, { password: hashedPassword });
  await OtpToken.deleteMany({ email, purpose: "reset" });

  return { message: "Đặt lại mật khẩu thành công" };
};

// ===== REGISTER WITH OTP =====
const registerRequest = async ({ firstName, lastName, email, password, role, studentCode, phone }) => {
  if (!firstName || !lastName || !email || !password || !role || !studentCode || !phone) {
    throw { status: 400, message: "Missing fields" };
  }

  email = email.trim().toLowerCase();
  studentCode = studentCode.trim();

  const exists = await User.findOne({ $or: [{ email }, { studentCode }, { phone }] });
  if (exists && exists.isVerified) {
    throw { status: 409, message: "Email, StudentCode hoặc Số điện thoại đã được đăng ký" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await OtpToken.deleteMany({ email, purpose: "register" });

  const code = generateOtp(6);
  const ttlMin = Number(process.env.OTP_EXPIRES_MIN || 5);
  const expiresAt = new Date(Date.now() + ttlMin * 60 * 1000);

  await OtpToken.create({
    email,
    code,
    purpose: "register",
    firstName,
    lastName,
    password: passwordHash,
    role,
    studentCode,
    phone,
    expiresAt,
    attempts: 0,
  });

  await sendOtpMail({ email, code, purpose: "register" });

  return { message: "OTP đã được gửi. Vui lòng xác thực.", ttlMinutes: ttlMin };
};

const registerVerify = async ({ email, code }) => {
  if (!email || !code) throw { status: 400, message: "Thiếu email hoặc mã OTP" };

  email = email.trim().toLowerCase();

  const otpDoc = await OtpToken.findOne({ email, purpose: "register" });
  if (!otpDoc) throw { status: 400, message: "OTP không tồn tại, hãy yêu cầu lại" };

  if (otpDoc.expiresAt < new Date()) {
    await otpDoc.deleteOne();
    throw { status: 400, message: "OTP đã hết hạn, hãy yêu cầu lại" };
  }

  if (otpDoc.attempts >= 5) {
    await otpDoc.deleteOne();
    throw { status: 429, message: "Quá số lần thử, hãy yêu cầu OTP lại" };
  }

  if (otpDoc.code !== code) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    throw { status: 400, message: "OTP không đúng" };
  }

  // OTP chỉ cần kiểm tra email + code, không cần validate các field khác
  // if (!otpDoc.password || !otpDoc.role || !otpDoc.studentCode || !otpDoc.phone) {
  //   throw { status: 500, message: "OTP record invalid (thiếu password hash, role, studentCode hoặc phone)" };
  // }

  let user = await User.findOne({ email });
  if (user) {
    user.firstName = otpDoc.firstName || user.firstName;
    user.lastName = otpDoc.lastName || user.lastName;
    user.password = otpDoc.password || user.password;
    user.role = otpDoc.role || user.role;
    user.studentCode = otpDoc.studentCode || user.studentCode;
    user.phone = otpDoc.phone || user.phone;
    user.isVerified = true;
    await user.save();
  } else {
    user = await User.create({
      firstName: otpDoc.firstName,
      lastName: otpDoc.lastName,
      email,
      username: email,
      password: otpDoc.password,
      role: otpDoc.role,
      studentCode: otpDoc.studentCode,
      phone: otpDoc.phone,
      isVerified: true,
    });
  }

  await otpDoc.deleteOne();

  return {
    message: "Đăng ký thành công",
    userId: user._id,
    email: user.email,
    studentCode: user.studentCode,
  };
};

// ===== LOGIN =====
const login = async ({ email, password }) => {
   const user = await User.findOne({ email });
  if (!user || !user.isVerified) {
    throw { status: 400, message: "Email hoặc mật khẩu không đúng hoặc chưa xác thực" };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw { status: 400, message: "Email hoặc mật khẩu không đúng" };
  }

  // Access token sống ngắn
  const accessToken = jwt.sign(
    {
      sub: String(user._id),
      id: String(user._id),
      role: user.role,
      authorities: [user.role],
      department: user.department,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  // Refresh token sống dài
  const refreshToken = jwt.sign(
    {
      sub: String(user._id),
      id: String(user._id),
      role: user.role,
      authorities: [user.role],
      department: user.department,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  // Lưu refreshToken vào DB
  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: { id: user._id, email: user.email, role: user.role , department: user.department}
  };
};

const refreshToken = async (token) => {
  if (!token) throw { status: 401, message: "Missing refresh token" };

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw { status: 403, message: "Invalid or expired refresh token" };
  }

  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== token) {
    throw { status: 403, message: "Refresh token mismatch" };
  }

  // Cấp lại accessToken mới
  const newAccessToken = jwt.sign(
    {
      sub: String(user._id),
      id: String(user._id),
      role: user.role,
      authorities: [user.role],
      department: user.department,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  return { accessToken: newAccessToken, refreshToken: token };
};

const getProfile = async (userId) => {
  try {
    const user = await User.findById(userId).select(
      "-password -refreshToken -verifyCode -verifyCodeAttemptCount -__v -isVerified -provider"
    );
    return user;
  } catch (error) {
    throw error;
  }
};

// Cập nhật thông tin cá nhân
const updateProfile = async (userId, data) => {
  try {
    const allowedFields = ["username", "firstName", "lastName", "phone", "gender", "address", "avatarUrl"];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password -refreshToken -verifyCode -verifyRegister -verifyCodeAttemptCount -__v");

    return user;
  } catch (error) {
    throw error;
  }
};

const uploadAvatar = async (userId, avatarUrl) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { avatarUrl } },
      { new: true, runValidators: true }
    ).select("-password -refreshToken -verifyCode -verifyRegister -verifyCodeAttemptCount -__v");

    return user;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  forgotPassword,
  verifyOtp,
  resetPassword,
  registerRequest,
  registerVerify,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  uploadAvatar,
};
