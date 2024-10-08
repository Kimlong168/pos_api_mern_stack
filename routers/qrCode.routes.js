const express = require("express");

const router = express.Router();

const qrCode = require("../controllers/qrCode.controller");

const { authenticateToken } = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/verifyRoleMiddleware");

const {
  validateQRCodeBody,
  validationMiddleware,
} = require("../utils/validationHelpers");

router.get("/", qrCode.getAllQRCodes);

router.get("/:id", qrCode.getQRCodeById);

router.post(
  "/",
  authenticateToken,
  verifyRole(["admin", "manager"]),
  validateQRCodeBody(),
  validationMiddleware,
  qrCode.createQRCode
);

router.put(
  "/:id",
  authenticateToken,
  verifyRole(["admin", "manager"]),
  validateQRCodeBody(),
  validationMiddleware,
  qrCode.updateQRCode
);

router.delete("/:id", authenticateToken, qrCode.deleteQRCode);

module.exports = router;
