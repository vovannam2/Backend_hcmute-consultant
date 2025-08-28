const express = require("express");
const {
  registerRequest,
  registerVerify,
  login,
} = require("../controllers/authController");

const router = express.Router();

// Register (OTP)
router.post("/register/request", registerRequest);
router.post("/register/verify", registerVerify);
router.post("/login", login);
// Forgot Password (OTP)
//router.post("/forgot/request", forgotPasswordRequest);
// router.post("/forgot/verify", forgotPasswordVerify);

module.exports = router;