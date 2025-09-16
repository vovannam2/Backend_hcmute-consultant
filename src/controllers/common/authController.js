const UserService = require("../../service/common/UserService");

const forgotPassword = async (req, res) => {
  try {
    const result = await UserService.forgotPassword(req.body);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const result = await UserService.verifyOtp(req.body);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const result = await UserService.resetPassword(req.body);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const registerRequest = async (req, res) => {
  try {
    const result = await UserService.registerRequest(req.body);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const registerVerify = async (req, res) => {
  try {
    const result = await UserService.registerVerify(req.body);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const result = await UserService.login(req.body);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    const result = await UserService.refreshToken(token);
    return res.json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
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
