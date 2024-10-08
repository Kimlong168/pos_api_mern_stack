const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time_in: {
    type: Date,
    required: true,
  },
  time_out: {
    type: Date,
  },
  qr_code: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QRCode",
    required: true,
  },
  check_in_status: {
    type: String,
    enum: ["On Time", "Late", "Absent", "On Leave"],
  },
  check_out_status: {
    type: String,
    enum: [
      "Checked Out",
      "Early Check-out",
      "Missed Check-out",
    ],
  },
  checkInLateDuration: {
    type: String,
    default: "0",
  },
  checkOutEarlyDuration: {
    type: String,
    default: "0",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
