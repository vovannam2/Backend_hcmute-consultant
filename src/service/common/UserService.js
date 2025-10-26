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
const registerRequest = async ({ fullName, email, password, role, studentCode, phone, department }) => {
  if (!fullName || !email || !password || !studentCode || !phone) {
    throw { status: 400, message: "Missing fields" };
  }

  // Mặc định role là USER nếu không có
  if (!role) {
    role = 'USER';
  }

  // Kiểm tra department cho tư vấn viên
  if (role === 'TUVANVIEN' && !department) {
    throw { status: 400, message: "Tư vấn viên cần chọn khoa/phòng ban" };
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
    fullName,
    password: passwordHash,
    role,
    studentCode,
    phone,
    department,
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
    user.fullName = otpDoc.fullName || user.fullName;
    user.password = otpDoc.password || user.password;
    user.role = otpDoc.role || user.role;
    user.studentCode = otpDoc.studentCode || user.studentCode;
    user.phone = otpDoc.phone || user.phone;
    user.department = otpDoc.department || user.department;
    user.isVerified = true;
    await user.save();
  } else {
    user = await User.create({
      fullName: otpDoc.fullName,
      email,
      username: email,
      password: otpDoc.password,
      role: otpDoc.role,
      studentCode: otpDoc.studentCode,
      phone: otpDoc.phone,
      department: otpDoc.department,
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

  // Trả về user đã được làm sạch (không bao gồm các trường nhạy cảm)
  const userSafe = {
    id: String(user._id),
    email: user.email,
    username: user.username,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    department: user.department,
    studentCode: user.studentCode,
    avatarUrl: user.avatarUrl ?? null,
    gender: user.gender,
    address: user.address,
    isOnline: user.isOnline,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return {
    accessToken,
    refreshToken,
    user: userSafe,
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
    const allowedFields = ["username", "fullName", "phone", "gender", "address", "avatarUrl", "studentCode"];
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

// Lấy danh sách tư vấn viên theo khoa
const getConsultantsByDepartment = async (departmentId) => {
  try {
    const consultants = await User.find({
      role: "TUVANVIEN",
      department: departmentId
    }).select("-password -refreshToken -__v -verifyCodeAttemptCount -provider -isActivity -isOnline -isVerified");
    
    return consultants;
  } catch (error) {
    throw error;
  }
};

// Lấy danh sách tư vấn viên đang online
const getOnlineConsultants = async () => {
  try {
    const consultants = await User.find({
      role: "TUVANVIEN",
      isOnline: true
    }).select("-password -refreshToken -__v -verifyCodeAttemptCount -provider -isActivity -isVerified");
    
    return consultants;
  } catch (error) {
    throw error;
  }
};

// Lấy danh sách tất cả tư vấn viên với pagination và filter
const getAllConsultants = async ({ page = 0, size = 10, sortBy = 'firstName', sortDir = 'asc', name, departmentId }) => {
  try {
    const skip = parseInt(page) * parseInt(size);
    const limit = parseInt(size);
    
    // Build filter
    const filter = { role: "TUVANVIEN" };
    
    if (name) {
      filter.$or = [
        { fullName: { $regex: name, $options: 'i' } },
        { username: { $regex: name, $options: 'i' } }
      ];
    }
    
    if (departmentId) {
      filter.department = departmentId;
    }
    
    // Build sort
    const sort = {};
    if (sortBy === 'firstName') sort.fullName = sortDir === 'asc' ? 1 : -1;
    else if (sortBy === 'department') sort['department.name'] = sortDir === 'asc' ? 1 : -1;
    
    // Get consultants
    const consultants = await User.find(filter)
      .select("-password -refreshToken -__v -verifyCodeAttemptCount -provider -isActivity -isVerified")
      .populate('department', 'id name')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Get total count
    const totalElements = await User.countDocuments(filter);
    
    return {
      content: consultants,
      totalElements,
      totalPages: Math.ceil(totalElements / limit),
      page: parseInt(page),
      size: parseInt(size)
    };
  } catch (error) {
    throw error;
  }
};

// Lấy thông tin tư vấn viên theo ID
const getConsultantById = async (id) => {
  try {
    const consultant = await User.findOne({
      _id: id,
      role: "TUVANVIEN"
    })
      .select("-password -refreshToken -__v -verifyCodeAttemptCount -provider")
      .populate('department', 'id name');
    
    if (!consultant) {
      const error = new Error('Không tìm thấy tư vấn viên');
      error.status = 404;
      throw error;
    }
    
    return consultant;
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
  getConsultantsByDepartment,
  getOnlineConsultants,
  getAllConsultants,
  getConsultantById,
};
