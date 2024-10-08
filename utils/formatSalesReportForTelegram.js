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
  
  🗓 Report Date: ${new Date(report_date).toLocaleDateString()}
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

module.exports = { formatSalesReportForTelegram };
