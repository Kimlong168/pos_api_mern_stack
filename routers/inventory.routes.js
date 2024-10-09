const express = require("express");

const router = express.Router();

const inventoryController = require("../controllers/inventory.controller");

const { authenticateToken } = require("../middlewares/authMiddleware");

const verifyRole = require("../middlewares/verifyRoleMiddleware");

const {
  validateInventoryBody,
  validationMiddleware,
} = require("../utils/validationHelpers");

router.get("/", inventoryController.getAllInventories);

router.get("/:id", inventoryController.getInventoryById);

router.get("/product/:productId", inventoryController.getInventoryByProdcutId);

router.post(
  "/",
  authenticateToken,
  verifyRole(["admin", "manager", "inventoryStaff"]),
  validateInventoryBody(),
  validationMiddleware,
  inventoryController.createInventory
);

router.put(
  "/:id",
  authenticateToken,
  verifyRole(["admin", "manager", "inventoryStaff"]),
  validateInventoryBody(),
  validationMiddleware,
  inventoryController.updateInventory
);

router.delete(
  "/clear-all",
  authenticateToken,
  verifyRole(["admin", "manager", "inventoryStaff"]),
  inventoryController.clearAllInventories
);

router.delete(
  "/:id",
  authenticateToken,
  verifyRole(["admin", "manager", "inventoryStaff"]),
  inventoryController.deleteInventory
);

module.exports = router;
