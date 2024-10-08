const express = require("express");

const router = express.Router();

const supplierController = require("../controllers/supplier.controller");

const { authenticateToken } = require("../middlewares/authMiddleware");

const verifyRole = require("../middlewares/verifyRoleMiddleware");

const {
  validateSupplierBody,
  validationMiddleware,
} = require("../utils/validationHelpers");

router.get("/", supplierController.getAllSuppliers);
router.get("/:id", supplierController.getSupplierById);

router.post(
  "/",
  authenticateToken,
  verifyRole(["admin", "manager"]),
  validateSupplierBody(),
  validationMiddleware,
  supplierController.createSupplier
);

router.put(
  "/:id",
  authenticateToken,
  verifyRole(["admin", "manager"]),
  validateSupplierBody(),
  validationMiddleware,
  supplierController.updateSupplier
);

router.delete(
  "/:id",
  authenticateToken,
  verifyRole(["admin", "manager"]),
  supplierController.deleteSupplier
);

module.exports = router;
