const UserService = require("../../service/common/UserService");
const { DataResponse, ExceptionResponse } = require("../../utils/response");

const forgotPassword = async (req, res) => {
  try {
    const result = await UserService.forgotPassword(req.body);
    return res.json(new DataResponse(result, "Gửi OTP thành công", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

const verifyOtp = async (req, res) => {
  try {
    const result = await UserService.verifyOtp(req.body);
    return res.json(new DataResponse(result, "Xác thực OTP thành công", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

const resetPassword = async (req, res) => {
  try {
    const result = await UserService.resetPassword(req.body);
    return res.json(new DataResponse(result, "Đặt lại mật khẩu thành công", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

const registerRequest = async (req, res) => {
  try {
    const result = await UserService.registerRequest(req.body);
    return res.json(new DataResponse(result, "Đăng ký - gửi OTP thành công", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

const registerVerify = async (req, res) => {
  try {
    const result = await UserService.registerVerify(req.body);
    return res.json(new DataResponse(result, "Đăng ký thành công", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

const login = async (req, res) => {
  try {
    const result = await UserService.login(req.body);
    const expiresIn = 15 * 60; // seconds
    return res.json(new DataResponse({ ...result, expiresIn }, "Login successful", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await UserService.refreshToken(refreshToken);
    return res.json(new DataResponse(result, "Refresh successful", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};

module.exports = {
  forgotPassword,
  verifyOtp,
  resetPassword,
  registerRequest,
  registerVerify,
  login,
  refreshToken
};
