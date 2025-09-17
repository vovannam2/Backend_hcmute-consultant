const express = require("express");
const {
  registerRequest,
  registerVerify,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  refreshToken,
} = require("../controllers/common/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =======================
// 🔹 Auth APIs (Public)
// =======================
router.post("/register/request", registerRequest);
router.post("/register/verify", registerVerify);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/refresh-token", refreshToken);

// =======================
// 🔹 Protected APIs (Private - demo role)
// =======================
router.get("/user-only", authMiddleware(["USER"]), (req, res) => {
  res.json({ message: "Hello USER" });
});

router.get(
  "/consultant",
  authMiddleware(["TUVANVIEN", "TRUONGBANTUVAN"]),
  (req, res) => {
    res.json({ message: "Hello Consultant" });
  }
);

router.get("/admin", authMiddleware(["ADMIN"]), (req, res) => {
  res.json({ message: "Hello ADMIN" });
});

module.exports = router;
