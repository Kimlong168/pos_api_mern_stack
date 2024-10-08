const {
  getFormattedDate,
  getFormattedTimeWithAMPM,
} = require("./getFormattedDate");
const formatSalesReportForTelegram = (data) => {
  const {
    report_date,
    total_orders,
    total_sales,
    total_revenue,
    total_products_sold,
    total_sales_by_time,
    total_sales_by_day,
    total_sales_by_month,
    total_sales_by_year,
    total_sales_by_payment_method,
    total_sales_by_status,
    total_sales_by_user,
    total_sales_times_by_user,
    total_sales_by_product,
    total_sales_by_category,
    total_sales_by_supplier,
    average_order_value,
  } = data;

  // Formatting the report string
  const reportMessage = `
  📊 Daily Sales Report
  
  🗓 Report Date: ${getFormattedDate(report_date)}
  📦 Total Orders: ${total_orders}
  🛒 Total Sales: ${total_sales}
  💵 Total Revenue: $${total_revenue}
  📦 Total Products Sold: ${total_products_sold}
  📈 Average Order Value: $${average_order_value.toFixed(2)}
  
  👤 Sales by User:
  ${total_sales_by_user
    .map((s) => `  - ${s.user.name}: $${s.amount}`)
    .join("\n")}
  
  🛍️ Sales Times by User:
  ${total_sales_times_by_user
    .map((s) => `  - ${s.user.name}: ${s.amount} times`)
    .join("\n")}
  
  🛒 Sales by Product:
  ${total_sales_by_product
    .map((s) => `  - ${s.product.name}: ${s.amount} sold`)
    .join("\n")}
  
  🏷️ Sales by Category:
  ${total_sales_by_category
    .map((s) => `  - ${s.category.name}: ${s.amount} sold`)
    .join("\n")}

  ⏰ Sales by Time:
  ${total_sales_by_time.map((s) => `  - ${s.time}: $${s.amount}`).join("\n")}
    
  💳 Sales by Payment Method:
  ${total_sales_by_payment_method
    .map((s) => `  - ${s.method}: $${s.amount}`)
    .join("\n")}
  
  ✅ Sales by Status:
  ${total_sales_by_status
    .map((s) => `  - ${s.status}: ${s.amount} orders`)
    .join("\n")}
  
  End of Report
  `;

  return reportMessage;
};

const formatAttendanceReportForTelegram = (data) => {
  const reportMessage = `
📅 Attendance Report: ${getFormattedDate(data.report_date)}

👥 Total Attendance: ${data.total_attendance}

⏰ Late Employees:
${
  data.late_employees
    .map(
      (item) => `- ${item.employee.name} (Late by ${item.checkInLateDuration})`
    )
    .join("\n") || "None"
}

🏃‍♂️ Early Check-out Employees:
${
  data.early_check_out_employees
    .map(
      (item) =>
        `- ${item.employee.name} (Checked out early by ${item.checkOutEarlyDuration})`
    )
    .join("\n") || "None"
}

🚫 Missed Check-out Employees:
${
  data.missed_check_out_employees
    .map((item) => `- ${item.employee.name}`)
    .join("\n") || "None"
}

❌ Absent Employees:
${
  data.absent_employees.map((item) => `- ${item.employee.name}`).join("\n") ||
  "None"
}

🌴 On Leave Employees:
${
  data.on_leave_employees.map((item) => `- ${item.employee.name}`).join("\n") ||
  "None"
}

✅ Normal Checked Out Employees:
${
  data.normal_checked_out_employees
    .map(
      (item) =>
        `- ${item.employee.name} (${getFormattedTimeWithAMPM(item.time_out)})`
    )
    .join("\n") || "None"
}

⏳ On Time Employees:
${
  data.on_time_employees
    .map(
      (item) =>
        `- ${item.employee.name} (${getFormattedTimeWithAMPM(item.time_in)})`
    )
    .join("\n") || "None"
}
  `;

  return reportMessage;
};

module.exports = {
  formatSalesReportForTelegram,
  formatAttendanceReportForTelegram,
};
