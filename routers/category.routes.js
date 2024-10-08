const express = require("express");

const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/verifyRoleMiddleware");

const {
  validateCategoryBody,
  validationMiddleware,
} = require("../utils/validationHelpers");
const categoryController = require("../controllers/category.controller");

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.post(
  "/",
  authenticateToken,
  verifyRole(["admin", "manager"]),
  validateCategoryBody(),
  validationMiddleware,
  categoryController.createCategory
);
router.put(
  "/:id",
  authenticateToken,
  verifyRole(["admin", "manager"]),
  validateCategoryBody(),
  validationMiddleware,
  categoryController.updateCategory
);
router.delete(
  "/:id",
  authenticateToken,
  verifyRole(["admin", "manager"]),
  categoryController.deleteCategory
);

module.exports = router;
