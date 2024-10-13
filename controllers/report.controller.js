const { successResponse, errorResponse } = require("../utils/responseHelpers");
const Order = require("../models/order.model");
const Supplier = require("../models/supplier.model");
const Category = require("../models/category.model");
const Attendance = require("../models/attendance.model");
const User = require("../models/user.model");
const { sendTelegramMessage } = require("../utils/sendTelegramMessage");
const {
  formatSalesReportForTelegram,
  formatAttendanceReportForTelegram,
} = require("../utils/formatReportForTelegram");

const getSalesReport = async (req, res, next) => {
  try {
    let orderData = await Order.find()
      .populate("user")
      .populate("products.product")
      .exec();

    const sales = orderData.filter((item) => {
      const transactionDate = new Date(item.transaction_date);
      const today = new Date();

      // Calculate the start and end dates for various filters
      const startOfWeek = new Date(today);
      startOfWeek.setDate(
        today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1)
      ); // Start from Monday

      const endOfWeek = new Date(today);
      endOfWeek.setDate(endOfWeek.getDate() + (7 - today.getDay())); // End on Sunday

      const startOfLastWeek = new Date(startOfWeek);
      startOfLastWeek.setDate(startOfWeek.getDate() - 7); // Last week starts

      const endOfLastWeek = new Date(startOfWeek); // End of last week is start of this week

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = today; // Current date

      const startOfLastMonth = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of last month

      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = today; // Current date

      // Calculate the start date for last 6 months
      const startOfLast6Months = new Date(today);
      startOfLast6Months.setMonth(today.getMonth() - 6);

      // Filter based on query parameters
      if (req.query.date === "today") {
        return transactionDate.toDateString() === today.toDateString();
      } else if (req.query.date === "yesterday") {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return transactionDate.toDateString() === yesterday.toDateString();
      } else if (req.query.date === "week") {
        return transactionDate >= startOfWeek && transactionDate <= endOfWeek;
      } else if (req.query.date === "last_week") {
        return (
          transactionDate >= startOfLastWeek && transactionDate < startOfWeek
        );
      } else if (req.query.date === "month") {
        return transactionDate >= startOfMonth && transactionDate <= endOfMonth;
      } else if (req.query.date === "last_month") {
        return (
          transactionDate >= startOfLastMonth &&
          transactionDate <= endOfLastMonth
        );
      } else if (req.query.date === "year") {
        return transactionDate >= startOfYear && transactionDate <= endOfYear;
      } else {
        // last 6 months
        return (
          transactionDate >= startOfLast6Months && transactionDate <= today
        );
      }
    });

    const suppliers = await Supplier.find().select("name");
    const categories = await Category.find().select("name");

    // Creating a user map to use it later
    const userMap = {};
    for (const sale of sales) {
      userMap[sale.user?._id] = {
        _id: sale.user?._id,
        name: sale.user?.name,
      };
    }

    const data = {
      report_date: new Date(),
      total_orders: sales.length,
      total_sales: sales.filter((sale) => sale.status === "completed").length,
      total_revenue: sales
        .filter((sale) => sale.status === "completed")
        .reduce((acc, curr) => acc + curr.total_price, 0),

      total_products_sold: sales
        .filter((sale) => sale.status === "completed")
        .reduce(
          (acc, curr) =>
            acc + curr.products.reduce((acc, curr) => acc + curr.quantity, 0),
          0
        ),

      //   total sales by time (morning, afternoon, evening, night)
      total_sales_by_time: Object.entries(
        sales.reduce((acc, curr) => {
          const hour = new Date(curr.transaction_date).getHours();
          let time = "";
          if (hour >= 0 && hour < 12) {
            time = "morning";
          } else if (hour >= 12 && hour < 16) {
            time = "afternoon";
          } else if (hour >= 16 && hour < 20) {
            time = "evening";
          } else {
            time = "night";
          }
          if (!acc[time]) {
            acc[time] = curr.total_price;
          } else {
            acc[time] += curr.total_price;
          }
          return acc;
        }, {})
      ).map(([time, amount]) => ({ time, amount })),

      total_sales_by_day: Object.entries(
        sales.reduce((acc, curr) => {
          const date = new Date(curr.transaction_date).toDateString();
          if (!acc[date]) {
            acc[date] = curr.total_price;
          } else {
            acc[date] += curr.total_price;
          }
          return acc;
        }, {})
      ).map(([date, amount]) => ({ date, amount })),

      total_sales_by_month: Object.entries(
        sales.reduce((acc, curr) => {
          const date = new Date(curr.transaction_date).toLocaleString(
            "default",
            {
              month: "long",
            }
          );
          if (!acc[date]) {
            acc[date] = curr.total_price;
          } else {
            acc[date] += curr.total_price;
          }
          return acc;
        }, {})
      ).map(([date, amount]) => ({ date, amount })),

      total_sales_by_year: Object.entries(
        sales.reduce((acc, curr) => {
          const date = new Date(curr.transaction_date).getFullYear();
          if (!acc[date]) {
            acc[date] = curr.total_price;
          } else {
            acc[date] += curr.total_price;
          }
          return acc;
        }, {})
      ).map(([date, amount]) => ({ date, amount })),

      total_sales_by_payment_method: Object.entries(
        sales.reduce((acc, curr) => {
          if (!acc[curr.payment_method]) {
            acc[curr.payment_method] = curr.total_price;
          } else {
            acc[curr.payment_method] += curr.total_price;
          }
          return acc;
        }, {})
      ).map(([method, amount]) => ({ method, amount })),

      total_sales_by_status: Object.entries(
        sales.reduce((acc, curr) => {
          if (!acc[curr.status]) {
            acc[curr.status] = 1;
          } else {
            acc[curr.status] += 1;
          }
          return acc;
        }, {})
      ).map(([status, amount]) => ({ status, amount })),

      //   total money
      total_sales_by_user: Object.entries(
        sales.reduce((acc, curr) => {
          const user = curr.user?._id;
          if (!acc[user]) {
            acc[user] = curr.total_price;
          } else {
            acc[user] += curr.total_price;
          }
          return acc;
        }, {})
      )
        .sort((a, b) => b[1] - a[1])
        .map(([userId, amount]) => ({
          user: userMap[userId],
          amount,
        })),

      // total time of sales by user
      total_sales_times_by_user: Object.entries(
        sales.reduce((acc, curr) => {
          if (!acc[curr.user?._id]) {
            acc[curr.user?._id] = 1;
          } else {
            acc[curr.user?._id] += 1;
          }
          return acc;
        }, {})
      )
        .sort((a, b) => b[1] - a[1])
        .map(([userId, amount]) => ({
          user: userMap[userId],
          amount,
        })),

      total_sales_by_product: Object.entries(
        sales.reduce((acc, curr) => {
          curr.products.forEach((product) => {
            if (!acc[product.product._id]) {
              acc[product.product._id] = product.quantity;
            } else {
              acc[product.product._id] += product.quantity;
            }
          });
          return acc;
        }, {})
      )
        .sort((a, b) => b[1] - a[1])
        .map(([productId, amount]) => {
          const product = sales
            .flatMap((s) => s.products)
            .find((p) => p.product._id.toString() === productId).product;
          return {
            product: {
              _id: product._id,
              name: product.name,
            },
            amount,
          };
        }),

      total_sales_by_category: Object.entries(
        sales.reduce((acc, curr) => {
          curr.products.forEach((product) => {
            if (!acc[product.product.category]) {
              acc[product.product.category] = product.quantity;
            } else {
              acc[product.product.category] += product.quantity;
            }
          });
          return acc;
        }, {})
      ).map(([categoryId, amount]) => {
        const category = categories.find(
          (c) => c._id.toString() === categoryId
        );
        return {
          category,
          amount,
        };
      }),

      total_sales_by_supplier: Object.entries(
        sales.reduce((acc, curr) => {
          curr.products.forEach((product) => {
            if (!acc[product.product.supplier]) {
              acc[product.product.supplier] = product.quantity;
            } else {
              acc[product.product.supplier] += product.quantity;
            }
          });
          return acc;
        }, {})
      ).map(([supplierId, amount]) => {
        const supplierName = suppliers.find(
          (s) => s._id.toString() === supplierId
        );

        return {
          supplier: supplierName,
          amount,
        };
      }),

      //   average order value
      average_order_value:
        Math.round(
          sales.reduce((acc, curr) => acc + curr.total_price, 0) / sales.length
        ) || 0,
    };

    // Handle API call
    if (req && res) {
      return successResponse(res, data, "Data retrieved successfully.");
    }

    // Return sales for cron job
    return data;
  } catch (error) {
    // next(err);
    // Handle errors for API call
    if (req && res) {
      return errorResponse(res, error.message, 500);
    }

    // Use next if it's a valid function
    if (typeof next === "function") {
      return next(error);
    }

    throw error; // Throw for cron job
  }
};

const sendSalesReport = async (dateQuery) => {
  try {
    // Fetch the sales data based on the date query
    const req = { query: { date: dateQuery } };
    const reportData = await getSalesReport(req);

    // Format the sales data for the Telegram message
    const reportMessage = formatSalesReportForTelegram(reportData);

    // Send the sales report to Telegram
    await sendTelegramMessage(
      reportMessage,
      process.env.TELEGRAM_CHAT_ID,
      process.env.TELEGRAM_TOPIC_SALE_REPORT_ID
    );
    console.log("Sales report sent to Telegram");
  } catch (error) {
    console.error("Error sending sales report:", error);
  }
};

const getAttendanceReport = async (req, res, next) => {
  try {
    let attendance = await Attendance.find()
      .populate({
        path: "employee",
        select: "name email",
      })
      .exec();

    // Filter based on query parameters
    if (req.query.date) {
      attendance = attendance.filter(
        (item) =>
          new Date(item.date).toDateString() ===
          new Date(req.query.date).toDateString()
      );
    }

    const data = {
      report_date: req.query.date,
      total_attendance: attendance.length,
      // all late employees
      late_employees: attendance.filter(
        (item) => item.check_in_status === "Late"
      ),

      // all early check out employees
      early_check_out_employees: attendance.filter(
        (item) => item.check_out_status === "Early Check-out"
      ),

      // all missed check out employees
      missed_check_out_employees: attendance.filter(
        (item) => item.check_out_status === "Missed Check-out"
      ),

      // all absent employees
      absent_employees: attendance.filter(
        (item) => item.check_in_status === "Absent"
      ),

      // all on leave employees
      on_leave_employees: attendance.filter(
        (item) => item.check_in_status === "On Leave"
      ),

      // all normal checked out employees
      normal_checked_out_employees: attendance.filter(
        (item) => item.check_out_status === "Checked Out"
      ),

      //on time employees
      on_time_employees: attendance.filter(
        (item) => item.check_in_status === "On Time"
      ),
    };

    // Handle API call
    if (req && res) {
      return successResponse(res, data, "Data retrieved successfully.");
    }

    // Return attendance for cron job
    return data;
  } catch (error) {
    // next(err);
    // Handle errors for API call
    if (req && res) {
      return errorResponse(res, error.message, 500);
    }

    // Use next if it's a valid function
    if (typeof next === "function") {
      return next(error);
    }

    throw error; // Throw for cron job
  }
};

const sendAttendanceReport = async (dateQuery) => {
  try {
    // Fetch the attendance data based on the date query
    const req = { query: { date: dateQuery } };
    const reportData = await getAttendanceReport(req);

    // Format the attendance data for the Telegram message
    const reportMessage = formatAttendanceReportForTelegram(reportData);

    // Send the attendance report to Telegram
    await sendTelegramMessage(
      reportMessage,
      process.env.TELEGRAM_CHAT_ID,
      process.env.TELEGRAM_TOPIC_ATTENDANCE_ID
    );
    console.log("Attendance report sent to Telegram");
  } catch (error) {
    console.error("Error sending attendance report:", error);
  }
};

const getAttendanceReportMonthly = async (req, res, next) => {
  try {
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ); // Start of current month
    const endOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    ); // End of current month

    let attendance = await Attendance.find({
      date: {
        $gte: startOfMonth, // Greater than or equal to start of the month
        $lte: endOfMonth, // Less than or equal to end of the month
      },
    }).populate({
      path: "employee",
      select: "name role",
    });

    const employees = await User.find({
      role: { $in: ["cashier", "inventoryStaff"] },
    }).select("name role email");

    const data = employees.map((employee) => {
      let attendanceData = {
        employee: employee,
        late: 0,
        earlyCheckOut: 0,
        missedCheckOut: 0,
        absent: 0,
        onLeave: 0,
        onTime: 0,
        normalCheckOut: 0,
      };

      attendance.forEach((item) => {
        if (item.employee._id.toString() === employee._id.toString()) {
          if (item.check_in_status === "Late") {
            attendanceData.late++;
          } else if (item.check_out_status === "Early Check-out") {
            attendanceData.earlyCheckOut++;
          } else if (item.check_out_status === "Missed Check-out") {
            attendanceData.missedCheckOut++;
          } else if (item.check_in_status === "Absent") {
            attendanceData.absent++;
          } else if (item.check_in_status === "On Leave") {
            attendanceData.onLeave++;
          } else if (item.check_in_status === "On Time") {
            attendanceData.onTime++;
          } else if (item.check_out_status === "Checked Out") {
            attendanceData.normalCheckOut++;
          }
        }
      });

      return attendanceData;
    });

    return successResponse(res, data, "Data retrieved successfully.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSalesReport,
  sendSalesReport,
  getAttendanceReport,
  sendAttendanceReport,
  getAttendanceReportMonthly,
};
