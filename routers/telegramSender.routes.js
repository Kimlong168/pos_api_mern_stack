const express = require("express");
const router = express.Router();

const telegramSenderController = require("../controllers/telegramSender.controller");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  validateTelegramMessageBody,
  validateTelegramImageBody,
  validationMiddleware,
} = require("../utils/validationHelpers");
const fileUploadValidation = require("../middlewares/fileUploadMiddleware");
const { upload } = require("../data/multer");

router.post(
  "/send-message",
  authenticateToken,
  validateTelegramMessageBody(),
  validationMiddleware,
  telegramSenderController.sendMessage
);

router.post(
  "/send-image",
  authenticateToken,
  upload.single("image"),
  fileUploadValidation,
  validateTelegramImageBody(),
  validationMiddleware,
  telegramSenderController.sendImage
);

router.post(
  "/send-image-url",
  authenticateToken,
  validateTelegramImageBody(),
  validationMiddleware,
  telegramSenderController.sendImage
);

module.exports = router;
