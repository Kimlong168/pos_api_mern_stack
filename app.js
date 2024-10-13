require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const session = require("express-session");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

const db = require("./data/database");
const { blacklistedTokens } = require("./middlewares/authMiddleware");
const enableCors = require("./middlewares/cors");
const { errorResponse } = require("./utils/responseHelpers");
const {
  sendSalesReport,
  sendAttendanceReport,
} = require("./controllers/report.controller");
const {
  recordAttendanceAbsentOrOnLeave,
  recordAttendanceMissCheckout,
} = require("./controllers/attendance.controller");

const {
  rejectLeaveRequestAfterEndDate,
} = require("./controllers/leaveRequest.controller");

const authRoutes = require("./routers/auth.routes");
const userRoutes = require("./routers/user.routes");
const categoryRoutes = require("./routers/category.routes");
const productRoutes = require("./routers/product.routes");
const supplierRoutes = require("./routers/supplier.routes");
const inventoryRoutes = require("./routers/inventory.routes");
const orderRoutes = require("./routers/order.routes");
const purchaseOrderRoutes = require("./routers/purchaseOrder.routes");
const reportRoutes = require("./routers/report.routes");
const mailSenderRoutes = require("./routers/mailSender.routes");
const abaPaywayRoutes = require("./routers/abaPayway.routes");
const telegramRoutes = require("./routers/telegramSender.routes");
const qrCodeRoutes = require("./routers/qrCode.routes");
const attendanceRoutes = require("./routers/attendance.routes");
const leaveRequestRoutes = require("./routers/leaveRequests.routes");

app.use(enableCors);
app.use(bodyParser.json());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Use true in production with HTTPS
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/inventories", inventoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/mail", mailSenderRoutes);
app.use("/api/aba-payway", abaPaywayRoutes);
app.use("/api/telegram", telegramRoutes);
app.use("/api/qr-code", qrCodeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave-requests", leaveRequestRoutes);

// Schedule a cron job to send a message every day 59 23 * * * 11:59 PM
cron.schedule("59 23 * * *", () => {
  console.log("Running cron job at 11:59 PM to send sale report");
  sendSalesReport("today");
});

// Schedule a cron job to send a message every day 00 1 * * * 1:00 AM
cron.schedule("00 1 * * *", () => {
  console.log(
    "Running cron job at 1 AM to reject leave requests after end date"
  );
  rejectLeaveRequestAfterEndDate();
});

// Schedule a cron job to record attendance every time 00 17 * * * 5:00 PM
cron.schedule("00 17 * * *", () => {
  console.log(
    "Running cron job at 5:00 PM to record attendance absent or on leave"
  );
  recordAttendanceAbsentOrOnLeave();
});

// Schedule a cron job to record attendance every time 00 19 * * * 7:00 PM
cron.schedule("00 19 * * *", () => {
  console.log("Running cron job at 7:00 PM to record attendance miss checkout");
  recordAttendanceMissCheckout();
});

// Schedule a cron job to send a message every day 30 19 * * * 7:30 PM
cron.schedule("30 19 * * *", () => {
  console.log("Running cron job at 11:59 PM to send attendance report");
  sendAttendanceReport(new Date());
});

// error handling middleware
app.use((err, req, res, next) => {
  console.error("err", err.stack);
  errorResponse(res, "Something went wrong!", 500);
});

// Token blacklist cleanup
setInterval(() => {
  blacklistedTokens.clear();
}, process.env.BLACKLIST_CLEANUP_INTERVAL);

// Start the server
db.connect(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
