const express = require("express");

const router = express.Router();

const purchaseOrder = require("../controllers/purchaseOrder.controller");

const { authenticateToken } = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/verifyRoleMiddleware");

const {
  validatePurchaseOrderBody,
  validationMiddleware,
} = require("../utils/validationHelpers");

router.get("/", purchaseOrder.getAllPurchaseOrders);
router.get("/:id", purchaseOrder.getPurchaseOrderById);
router.post(
  "/",
  authenticateToken,
  validatePurchaseOrderBody(),
  validationMiddleware,
  purchaseOrder.createPurchaseOrder
);
router.put(
  "/:id",
  authenticateToken,
  verifyRole(["admin", "manager"]),
  validatePurchaseOrderBody(),
  validationMiddleware,
  purchaseOrder.updatePurchaseOrder
);
router.delete(
  "/:id",
  authenticateToken,
  verifyRole(["admin", "manager"]),
  purchaseOrder.deletePurchaseOrder
);

module.exports = router;
