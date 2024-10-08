const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const {
  validateProductBody,
  validationMiddleware,
} = require("../utils/validationHelpers");
const fileUploadValidation = require("../middlewares/fileUploadMiddleware");
const { authenticateToken } = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/verifyRoleMiddleware");
const { upload } = require("../data/multer");

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

router.post(
  "/",
  authenticateToken,
  verifyRole(["admin", "manager"]),
  upload.single("image"),
  fileUploadValidation,
  validateProductBody(),
  validationMiddleware,
  productController.createProduct
);

router.put(
  "/:id",
  authenticateToken,
  verifyRole(["admin", "manager"]),
  upload.single("image"),
  validateProductBody(),
  validationMiddleware,
  productController.updateProduct
);
router.delete(
  "/:id",
  authenticateToken,
  verifyRole(["admin", "manager"]),
  productController.deleteProduct
);

module.exports = router;
