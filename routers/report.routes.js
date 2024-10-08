const express = require("express");
const router = express.Router();
// const cron = require("node-cron");

const { sendTelegramMessage } = require("../utils/sendTelegramMessage");
const reportController = require("../controllers/report.controller");

const { authenticateToken } = require("../middlewares/authMiddleware");

const verifyRole = require("../middlewares/verifyRoleMiddleware");

router.get(
  "/sales",
  authenticateToken,
  verifyRole(["admin", "manager"]),
  reportController.getSalesReport
);

// Schedule a cron job to send a message every day at 11:59 PM
// cron.schedule("5 1 * * *", () => {
//   console.log("Running cron job at 1:03 AM");
//   sendTelegramMessage(
//     "Daily sales report: ...",
//     process.env.TELEGRAM_CHAT_ID

//   );
// });

module.exports = router;
