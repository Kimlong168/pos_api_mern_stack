const express = require("express");

const router = express.Router();

const orderController = require("../controllers/order.controller");

const { authenticateToken } = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/verifyRoleMiddleware");

const {
  validateOrderBody,
  validationMiddleware,
} = require("../utils/validationHelpers");

router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);
router.post(
  "/",
  authenticateToken,
  validateOrderBody(),
  validationMiddleware,
  orderController.createOrder
);
router.put(
  "/:id",
  authenticateToken,
  verifyRole(["admin", "manager", "cashier"]),
  validateOrderBody(),
  validationMiddleware,
  orderController.updateOrder
);
router.delete(
  "/:id",
  authenticateToken,
  verifyRole(["admin", "manager"]),
  orderController.deleteOrder
);

module.exports = router;
