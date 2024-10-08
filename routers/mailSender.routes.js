const express = require("express");
const redis = require("redis");
const router = express.Router();

const mailSenderController = require("../controllers/mailSender.controller");
const { authenticateToken } = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/verifyRoleMiddleware");

router.post(
  "/send",
  authenticateToken,
  verifyRole(["admin", "manager"]),
  mailSenderController.sendEmail
);

router.post(
  "/request-otp",
  mailSenderController.requestOtp
);

router.post(
  "/verify-otp",
  mailSenderController.verifyOtp
);

module.exports = router;
