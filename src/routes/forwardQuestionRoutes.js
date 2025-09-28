const express = require("express");
const router = express.Router();
const ForwardQuestionController = require("../controllers/actor/ForwardQuestionController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/questions/:id/forward",
  authMiddleware(["TUVANVIEN"]),
  ForwardQuestionController.forwardQuestion
);


module.exports = router;
