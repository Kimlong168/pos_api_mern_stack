const express = require("express");
const router = express.Router();

const reportController = require("../controllers/report.controller");

const { authenticateToken } = require("../middlewares/authMiddleware");

const verifyRole = require("../middlewares/verifyRoleMiddleware");

router.get(
  "/sales",
  authenticateToken,
  verifyRole(["admin", "manager"]),
  reportController.getSalesReport
);

router.get(
  "/attendance",
  authenticateToken,
  verifyRole(["admin", "manager"]),
  reportController.getAttendanceReport
);

router.get(
  "/attendance/month",
  authenticateToken,
  verifyRole(["admin", "manager"]),
  reportController.getAttendanceReportMonthly
);

module.exports = router;
