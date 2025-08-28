const express = require("express");
const {
  registerRequest,
  registerVerify,
  forgotPasswordRequest,
  forgotPasswordVerify,
} = require("../controllers/authController");

const router = express.Router();

// Register (OTP)
router.post("/register/request", registerRequest);
router.post("/register/verify", registerVerify);

// Forgot Password (OTP)
//router.post("/forgot/request", forgotPasswordRequest);
// router.post("/forgot/verify", forgotPasswordVerify);

module.exports = router;