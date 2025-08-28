const express = require("express");
const {
  registerRequest,
  registerVerify,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

// Register (OTP)
router.post("/register/request", registerRequest);
router.post("/register/verify", registerVerify);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

// Forgot Password (OTP)
//router.post("/forgot/request", forgotPasswordRequest);
// router.post("/forgot/verify", forgotPasswordVerify);

module.exports = router;