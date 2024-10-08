const express = require("express");

const router = express.Router();

const userController = require("../controllers/user.controller");
const { upload } = require("../data/multer");
const { authenticateToken } = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/verifyRoleMiddleware");
const {
  validateUserBody,
  validationMiddleware,
} = require("../utils/validationHelpers");

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);

router.put("/reset-password", userController.resetPassword);

router.put(
  "/:id/password",
  authenticateToken,
  verifyRole(["admin", "manager"]),
  userController.updatePassword
);

router.put(
  "/:id",
  authenticateToken,
  verifyRole(["admin"]),
  upload.single("image"),
  validateUserBody(),
  validationMiddleware,
  userController.updateUser
);

router.delete(
  "/:id",
  authenticateToken,
  verifyRole(["admin"]),
  userController.deleteUser
);

module.exports = router;
