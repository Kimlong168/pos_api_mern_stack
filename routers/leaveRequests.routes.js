const express = require("express");

const router = express.Router();

const leaveRequestController = require("../controllers/leaveRequest.controller");

const { authenticateToken } = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/verifyRoleMiddleware");

const {
  validateLeaveRequestBody,
  validateStatusLeaveRequestBody,
  validationMiddleware,
} = require("../utils/validationHelpers");

router.get("/", authenticateToken, leaveRequestController.getAllLeaveRequests);

router.get(
  "/:id",
  authenticateToken,
  leaveRequestController.getLeaveRequestById
);

router.get(
  "/employee/:id",
  authenticateToken,
  leaveRequestController.getLeaveRequestsByEmployeeId
);

router.post(
  "/",
  authenticateToken,
  verifyRole(["cashier", "inventoryStaff"]),
  validateLeaveRequestBody(),
  validationMiddleware,
  leaveRequestController.createLeaveRequest
);

router.put(
  "/:id",
  authenticateToken,
  verifyRole(["cashier", "inventoryStaff"]),
  validateLeaveRequestBody(),
  validationMiddleware,
  leaveRequestController.updateLeaveRequest
);

router.delete(
  "/clear-all",
  authenticateToken,
  verifyRole(["admin", "manager"]),
  leaveRequestController.clearAllLeaveRequests
);

router.delete(
  "/:id",
  authenticateToken,
  verifyRole(["cashier", "inventoryStaff"]),
  leaveRequestController.deleteLeaveRequest
);

router.put(
  "/approve/:id",
  authenticateToken,
  verifyRole(["admin", "manager"]),
  validateStatusLeaveRequestBody(),
  validationMiddleware,
  leaveRequestController.approveOrRejectLeave
);

module.exports = router;
