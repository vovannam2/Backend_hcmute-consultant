const express = require("express");
const router = express.Router();
const exportController = require("../controllers/common/ExportController");
const authMiddleware = require("../middleware/authMiddleware");

// Export dữ liệu
router.post("/", authMiddleware(["ADMIN", "TRUONGBANTUVAN", "TUVANVIEN"]), exportController.exportData);

module.exports = router;
