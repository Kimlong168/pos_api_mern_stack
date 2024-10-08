const Attendance = require("../models/attendance.model");
const User = require("../models/user.model");
const QRCode = require("../models/qrCode.model");
const { successResponse, errorResponse } = require("../utils/responseHelpers");
const { calculateDistance } = require("../utils/calculateDistance");
const { sendTelegramMessage } = require("../utils/sendTelegramMessage");
const {
  getFormattedTimeWithAMPM,
  getFormattedDate,
} = require("../utils/getFormattedDate");

const getAllAttendance = async (req, res, next) => {
  try {
    const attendanceRecords = await Attendance.find()
      .populate({
        path: "employee",
        select: "name email",
      })
      .populate({
        path: "qr_code",
        select: "location",
      })
      .exec();
    successResponse(res, attendanceRecords, "Data retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

const getAttendanceById = async (req, res, next) => {
  try {
    const attendanceRecord = await Attendance.findById(req.params.id)
      .populate({
        path: "employee",
        select: "name email",
      })
      .populate({
        path: "qr_code",
        select: "location",
      })
      .exec();
    successResponse(res, attendanceRecord, "Data retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

const checkInAttendance = async (req, res, next) => {
  try {
    const {
      qr_code,
      check_in_status,
      checkInLateDuration,
      employee,
      time_in,
      latitude,
      longitude,
    } = req.body;

    // check if the employee has already checked in for the day
    const existingAttendance = await Attendance.findOne({
      employee: employee,
      date: new Date().toDateString(),
    });

    if (existingAttendance) {
      return errorResponse(res, "You have already checked in for the day", 403);
    }

    // Verify the QR code location matches
    const qrCode = await QRCode.findById(qr_code);
    if (!qrCode) {
      return errorResponse(res, "QR Code not found", 404);
    }

    // Validate that the employee's current location is within a valid range of the QR code location
    const distance = calculateDistance(
      qrCode.lat,
      qrCode.lng,
      latitude,
      longitude
    );
    const maxDistance = qrCode.radius; // Define a max distance threshold (e.g., 50 meters)

    if (distance > maxDistance) {
      return errorResponse(
        res,
        "You are not at the valid location to scan this QR code",
        403
      );
    }

    const attendance = new Attendance({
      employee: employee,
      date: new Date().toDateString(), // Records the date in string format (only date, no time)
      time_in: new Date(time_in),
      qr_code: qr_code,
      check_in_status: check_in_status,
    });

    if (check_in_status === "Late") {
      attendance.checkInLateDuration = checkInLateDuration;
    }

    const result = await attendance.save();

    const employeeData = await User.findById(employee);

    await sendTelegramMessage(
      `Attendance Check In 🟢
      \n🆔 ID: ${result._id}
      \n👤 Employee: ${employeeData.name} (${employeeData.role})
      \n💰 Time In: ${getFormattedTimeWithAMPM(time_in)}
      \n📅 Date: ${getFormattedDate(new Date())}
      \n🔖 Status: ${check_in_status}` +
        (checkInLateDuration ? `\n\n⏲️ Late: ${checkInLateDuration}` : ""),
      process.env.TELEGRAM_CHAT_ID,
      process.env.TELEGRAM_TOPIC_ATTENDANCE_ID
    );

    successResponse(res, attendance, "Attendance recorded successfully.");
  } catch (err) {
    next(err);
  }
};

const checkOutAttendance = async (req, res, next) => {
  const {
    qr_code,
    employee,
    check_out_status,
    checkOutEarlyDuration,
    time_out,
    latitude,
    longitude,
  } = req.body;
  try {
    // const attendance = await Attendance.findById(req.params.id);
    // find by employee and date
    const attendance = await Attendance.findOne({
      employee: employee,
      date: new Date().toDateString(),
    });

    if (!attendance) {
      return errorResponse(res, "Attendance record not found", 404);
    }

    //  check if the employee has already checked out for the day
    if (attendance.time_out) {
      return errorResponse(
        res,
        "You have already checked out for the day",
        403
      );
    }

    // Verify the QR code location matches
    const qrCode = await QRCode.findById(qr_code);
    if (!qrCode) {
      return errorResponse(res, "QR Code not found", 404);
    }

    // Validate that the employee's current location is within a valid range of the QR code location
    const distance = calculateDistance(
      qrCode.lat,
      qrCode.lng,
      latitude,
      longitude
    );
    const maxDistance = qrCode.radius; // Define a max distance threshold (e.g., 50 meters)

    if (distance > maxDistance) {
      return errorResponse(
        res,
        "You are not at the valid location to scan this QR code",
        403
      );
    }

    attendance.time_out = time_out ? new Date(time_out) : attendance.time_out;
    attendance.check_out_status =
      check_out_status || attendance.check_out_status;

    if (check_out_status === "Early Check-out") {
      attendance.checkOutEarlyDuration = checkOutEarlyDuration;
    }

    await attendance.save();

    const employeeData = await User.findById(employee);

    await sendTelegramMessage(
      `Attendance Check Out 🔴
      \n🆔 ID: ${req.params.id}
      \n👤 Employee: ${employeeData.name} (${employeeData.role})
      \n💰 Time Out: ${getFormattedTimeWithAMPM(time_out)}
      \n📅 Date: ${getFormattedDate(new Date())}
      \n🔖 Status: ${check_out_status}` +
        (checkOutEarlyDuration ? `\n\n⏲️ Early: ${checkOutEarlyDuration}` : ""),
      process.env.TELEGRAM_CHAT_ID,
      process.env.TELEGRAM_TOPIC_ATTENDANCE_ID
    );

    successResponse(res, attendance, "Attendance updated successfully.");
  } catch (err) {
    next(err);
  }
};

const deleteAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    successResponse(res, null, "Attendance record deleted successfully.");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllAttendance,
  getAttendanceById,
  checkInAttendance,
  checkOutAttendance,
  deleteAttendance,
};