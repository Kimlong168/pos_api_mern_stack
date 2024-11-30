const { body, validationResult } = require("express-validator");

// Middleware to handle validation results
const validationMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      error: {
        code: "VALIDATION_ERROR",
        message: errors
          .array()
          .map((err) => err.msg)
          .join(", "),
      },
    });
  }
  next();
};

// Validation rules for category and product
const validateCategoryBody = () => {
  return [
    body("name").notEmpty().withMessage("Category name is required."),
    body("description").optional().isString(),
  ];
};

// Validation rules for product
const validateProductBody = () => {
  return [
    body("name")
      .notEmpty()
      .withMessage("Product name is required.")
      .isString()
      .withMessage("Product name must be a string."),

    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string."),

    // body("sku")
    //   .notEmpty()
    //   .withMessage("SKU is required.")
    //   .isString()
    //   .withMessage("SKU must be a string."),

    body("barcode")
      .optional()
      .isString()
      .withMessage("Barcode must be a string."),

    body("category")
      .notEmpty()
      .withMessage("Category ID is required.")
      .isMongoId()
      .withMessage("Category ID must be a valid ObjectId."),

    body("supplier")
      .notEmpty()
      .withMessage("Supplier ID is required.")
      .isMongoId()
      .withMessage("Supplier ID must be a valid ObjectId."),

    body("price")
      .notEmpty()
      .withMessage("Price is required.")
      .isDecimal({ decimal_digits: "0,2" })
      .withMessage(
        "Price must be a positive number with up to two decimal places."
      )
      .custom((value) => value > 0)
      .withMessage("Price must be greater than 0."),

    body("stock_quantity")
      .notEmpty()
      .withMessage("Stock quantity is required.")
      .isInt({ min: 0 })
      .withMessage("Stock quantity must be a non-negative integer."),

    body("minimum_stock")
      .notEmpty()
      .withMessage("Minimum stock is required.")
      .isInt({ min: 0 })
      .withMessage("Minimum stock must be a non-negative integer."),
  ];
};

// validation rules for order

const validateOrderBody = () => {
  return [
    body("products").notEmpty().withMessage("Products are required."),
    body("products.*.product")
      .notEmpty()
      .withMessage("Product ID is required.")
      .isMongoId()
      .withMessage("Product ID must be a valid MongoID."),
    body("products.*.quantity")
      .notEmpty()
      .withMessage("Product quantity is required.")
      .isInt({ gt: 0 })
      .withMessage("Product quantity must be a positive number."),
    body("total_price")
      .notEmpty()
      .withMessage("Total price is required.")
      .isFloat({ gt: -1 })
      .withMessage("Total price must be a positive number."),
    body("payment_method")
      .notEmpty()
      .withMessage("Payment method is required."),
    body("transaction_date")
      .notEmpty()
      .withMessage("Transaction date is required.")
      .isISO8601()
      .withMessage("Transaction date must be a valid date."),
    body("status").notEmpty().withMessage("Status is required."),
  ];
};

// validation rules for user

const validateUserBody = () => {
  return [
    body("name").notEmpty().withMessage("Name is required."),
    // body("email")
    //   .notEmpty()
    //   .withMessage("Email is required.")
    //   .isEmail()
    //   .withMessage("Must be a valid email address."),
    // body("password").notEmpty().withMessage("Password is required."),
    body("role").notEmpty().withMessage("Role is required."),
    body("chat_id").optional().isString(),
  ];
};

// validation rules for supplier
const validateSupplierBody = () => {
  return [
    body("name").notEmpty().withMessage("Name is required."),
    body("email")
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Must be a valid email address."),
    body("phone").notEmpty().withMessage("Phone is required."),
    body("street").optional().isString(),
    body("city").notEmpty().withMessage("City is required."),
    body("country").notEmpty().withMessage("Country is required."),
    body("chat_id").optional().isString(),
  ];
};

// validation rules for inventory
const validateInventoryBody = () => {
  return [
    body("product")
      .notEmpty()
      .withMessage("Product ID is required.")
      .isMongoId()
      .withMessage("Product ID must be a valid MongoID."),

    body("adjustment_type")
      .notEmpty()
      .withMessage("Adjustment type is required."),

    body("quantity_adjusted")
      .notEmpty()
      .withMessage("Quantity adjusted is required.")
      .isInt({ gt: 0 })
      .withMessage("Quantity adjusted must be a positive integer."),

    body("reason")
      .notEmpty()
      .withMessage("Reason for adjustment is required.")
      .isString()
      .withMessage("Reason must be a string."),

    body("adjustment_date")
      .optional()
      .isISO8601()
      .withMessage("Adjustment date must be a valid date."),
  ];
};

// validation rules for purchaseOrder
const validatePurchaseOrderBody = () => {
  return [
    body("supplier")
      .notEmpty()
      .withMessage("Supplier ID is required.")
      .isMongoId()
      .withMessage("Supplier ID must be a valid MongoID."),

    body("products")
      .notEmpty()
      .withMessage("Products are required.")
      .isArray()
      .withMessage("Products must be an array."),

    body("products.*.product")
      .notEmpty()
      .withMessage("Product ID is required.")
      .isMongoId()
      .withMessage("Product ID must be a valid MongoID."),

    body("products.*.quantity")
      .notEmpty()
      .withMessage("Product quantity is required.")
      .isInt({ gt: 0 })
      .withMessage("Product quantity must be a positive integer."),

    body("total_price")
      .notEmpty()
      .withMessage("Total price is required.")
      .isFloat({ gt: 0 })
      .withMessage("Total price must be a positive number."),

    body("status").notEmpty().withMessage("Status is required."),

    body("order_date")
      .optional()
      .isISO8601()
      .withMessage("Order date must be a valid date."),

    body("recieve_date")
      .optional()
      .isISO8601()
      .withMessage("Recieve date must be a valid date."),

    body("remarks").optional().isString(),
  ];
};

// validation rules for aba pay
const validateAbaPayBody = () => {
  return [
    body("total_price")
      .notEmpty()
      .withMessage("Total Price is required.")
      .isFloat({ gt: 0 })
      .withMessage("otal Price be a positive number."),

    body("payment_option")
      .notEmpty()
      .withMessage("Payment Option is required.")
      .isString()
      .withMessage("Payment Option must be a string."),

    body("products")
      .optional()
      .isArray()
      .withMessage("Products must be an array."),

    body("currency")
      .optional()
      .isString()
      .withMessage("Currency must be a string."),

    body("shipping")
      .optional()
      .isString()
      .withMessage("Shipping must be a string."),
  ];
};

// validation rules for QR Code
const validateQRCodeBody = () => {
  return [
    body("lat")
      .notEmpty()
      .withMessage("Latitude is required.")
      .isFloat()
      .withMessage("Latitude must be a float."),
    body("lng")
      .notEmpty()
      .withMessage("Longitude is required.")
      .isFloat()
      .withMessage("Longitude must be a float."),
    body("radius").optional().isInt().withMessage("Radius must be an integer."),
    body("location")
      .notEmpty()
      .withMessage("Location is required.")
      .isString()
      .withMessage("Location must be a string."),
    // body("allowedNetworkRanges")
    //   .notEmpty()
    //   .withMessage("Allowed Network Ranges is required.")
    //   .isArray()
    //   .withMessage("Allowed Network Ranges must be an array."),
  ];
};

// validation rules for attendance
const validateCheckInAttendanceBody = () => {
  return [
    body("qr_code")
      .notEmpty()
      .withMessage("QR Code ID is required.")
      .isMongoId()
      .withMessage("QR Code ID must be a valid MongoID."),
    body("employee")
      .notEmpty()
      .withMessage("Employee ID is required.")
      .isMongoId()
      .withMessage("Employee ID must be a valid MongoID."),
    body("time_in")
      .notEmpty()
      .withMessage("Time In is required.")
      .isISO8601()
      .withMessage("Time In must be a valid date."),
    body("latitude")
      .notEmpty()
      .withMessage("Latitude is required.")
      .isFloat()
      .withMessage("Latitude must be a float."),
    body("longitude")
      .notEmpty()
      .withMessage("Longitude is required.")
      .isFloat()
      .withMessage("Longitude must be a float."),
    body("check_in_status")
      .notEmpty()
      .withMessage("Status is required.")
      .isString()
      .withMessage("Status must be a string."),
  ];
};

// validation rules for attendance
const validateCheckOutAttendanceBody = () => {
  return [
    body("qr_code")
      .notEmpty()
      .withMessage("QR Code ID is required.")
      .isMongoId()
      .withMessage("QR Code ID must be a valid MongoID."),
    body("check_out_status")
      .notEmpty()
      .withMessage("Status is required.")
      .isString()
      .withMessage("Status must be a string."),
    body("time_out")
      .optional()
      .isISO8601()
      .withMessage("Time Out must be a valid date."),
    body("latitude")
      .optional()
      .isFloat()
      .withMessage("Latitude must be a float."),
    body("longitude")
      .optional()
      .isFloat()
      .withMessage("Longitude must be a float."),
  ];
};

// validation rules for telegram message
const validateTelegramMessageBody = () => {
  return [body("message").notEmpty().withMessage("Message is required.")];
};

// validation rules for telegram image
const validateTelegramImageBody = () => {
  return [body("caption").optional().isString()];
};

// validation rules for leave request
const validateLeaveRequestBody = () => {
  return [
    body("type")
      .notEmpty()
      .withMessage("Leave type is required.")
      .isString()
      .withMessage("Leave type must be a string."),
    body("start_date")
      .notEmpty()
      .withMessage("Start date is required.")
      .isISO8601()
      .withMessage("Start date must be a valid date."),
    body("end_date")
      .notEmpty()
      .withMessage("End date is required.")
      .isISO8601()
      .withMessage("End date must be a valid date."),
    body("reason")
      .notEmpty()
      .withMessage("Reason is required.")
      .isString()
      .withMessage("Reason must be a string."),
  ];
};

const validateStatusLeaveRequestBody = () => {
  return [
    body("status")
      .notEmpty()
      .withMessage("Status is required.")
      .isString()
      .withMessage("Status must be a string."),
    body("comment")
      .optional()
      .isString()
      .withMessage("Comment must be a string."),
  ];
};

module.exports = {
  validateCategoryBody,
  validateProductBody,
  validationMiddleware,
  validateOrderBody,
  validateUserBody,
  validateSupplierBody,
  validateInventoryBody,
  validatePurchaseOrderBody,
  validateAbaPayBody,
  validateQRCodeBody,
  validateCheckInAttendanceBody,
  validateCheckOutAttendanceBody,
  validateTelegramMessageBody,
  validateTelegramImageBody,
  validateLeaveRequestBody,
  validateStatusLeaveRequestBody,
};
