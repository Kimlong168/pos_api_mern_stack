const express = require("express");
const router = express.Router();

const attendanceController = require("../controllers/attendance.controller");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  validateCheckInAttendanceBody,
  validateCheckOutAttendanceBody,
  validationMiddleware,
} = require("../utils/validationHelpers");

router.get("/", attendanceController.getAllAttendance);

router.get("/:id", attendanceController.getAttendanceById);

router.get(
  "/employee/:id",
  authenticateToken,
  attendanceController.getAttendanceByEmployeeId
);

router.post(
  "/check-in",
  authenticateToken,
  validateCheckInAttendanceBody(),
  validationMiddleware,
  attendanceController.checkInAttendance
);

router.put(
  "/check-out",
  authenticateToken,
  validateCheckOutAttendanceBody(),
  validationMiddleware,
  attendanceController.checkOutAttendance
);

router.delete("/:id", authenticateToken, attendanceController.deleteAttendance);

module.exports = router;
