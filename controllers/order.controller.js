const Order = require("../models/order.model");
const Product = require("../models/product.model");
const Inventory = require("../models/inventory.model");
const { sendTelegramMessage } = require("../utils/sendTelegramMessage");
const { getFormattedDate } = require("../utils/getFormattedDate");
const { successResponse, errorResponse } = require("../utils/responseHelpers");
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "user",
        select: "name",
      })
      .populate({
        path: "products.product",
        select: "name price barcode stock_quantity image",
      })
      .exec();
    successResponse(res, orders, "Data retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: "user",
        select: "name",
      })
      .populate({
        path: "products.product",
        select: "name price barcode stock_quantity image",
      })
      .exec();
    successResponse(res, order, "Data retrieved successfully");
  } catch (err) {
    next(err);
  }
};

const createOrder = async (req, res, next) => {
  const order = new Order({
    user: req.user.id,
    products: req.body.products,
    total_price: req.body.total_price,
    payment_method: req.body.payment_method,
    transaction_date: req.body.transaction_date,
    status: req.body.status,
    discount: req.body.discount,
  });

  console.log(req.body.products);

  // reduce the quantity of the products in the order from the stock
  order.products.forEach(async (product) => {
    try {
      const productInDb = await Product.findById(product.product);
      if (productInDb.stock_quantity < product.quantity) {
        return errorResponse(
          res,

          `Product ${productInDb.name} has insufficient stock`,
          400
        );
      }
      productInDb.stock_quantity -= product.quantity;
      await productInDb.save();
    } catch (err) {
      next(err);
    }
  });

  // create new inventory record
  try {
    const inventories = order.products.map((product) => {
      return new Inventory({
        product: product.product,
        quantity_adjusted: -Number(product.quantity),
        adjusted_by: req.user.id,
        adjustment_date: req.body.transaction_date,
        adjustment_type: "SALE",
        reason: "Sale",
      });
    });

    await Inventory.insertMany(inventories);

    // save the order
    const result = await order.save();

    const products = await Product.find({
      _id: { $in: order.products.map((p) => p.product) },
    });

    // Send the telegram group
    await sendTelegramMessage(
      `New Order Created 🛒
      \n🆔 Order ID: ${result._id}
      \n👤 Cashier: ${req.user.name}
      \n📦 Products: ${req.body.products
        .map(
          (p) =>
            `\n - ${
              products.find((product) => product._id == p.product).name
            } (x${p.quantity})`
        )
        .join("")}
      \n💰 Total Price: $${req.body.total_price}
      \n💵 Payment Method: ${req.body.payment_method}
      \n📅 Date: ${getFormattedDate(req.body.transaction_date)}
      \n🔖 Status: ${req.body.status}
      \n🏷️ Discount: $${req.body.discount || "0.00"}`,
      process.env.TELEGRAM_CHAT_ID,
      process.env.TELEGRAM_TOPIC_NEW_ORDER_ID
    );

    successResponse(res, order, "Order created successfully");
  } catch (err) {
    next(err);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    let previousStatus = order.status;
    // Update the order status
    order.status = req.body.status;

    if (req.body.status === "cancelled" && previousStatus !== "cancelled") {
      // increase the quantity of the products in the order back to the stock
      order.products.forEach(async (product) => {
        try {
          const productInDb = await Product.findById(product.product);
          productInDb.stock_quantity += product.quantity;
          await productInDb.save();
        } catch (err) {
          next(err);
        }
      });

      // create new inventory record
      const inventories = order.products.map((product) => {
        return new Inventory({
          product: product.product,
          quantity_adjusted: Number(product.quantity),
          adjusted_by: req.user.id,
          adjustment_date: new Date(),
          adjustment_type: "RETURN_IN",
          reason: "Order cancelled",
        });
      });

      await Inventory.insertMany(inventories);

      // Send the telegram group
      await sendTelegramMessage(
        `Order Cancelled⛔
      \n🆔 Order ID: ${order._id}
      \n👤 Cashier: ${req.user.name}
      \n💰 Total Price: $${req.body.total_price}
      \n🕒 Order Date: ${getFormattedDate(req.body.transaction_date)}
      \n🕒 Cancelled Date: ${getFormattedDate(new Date())}
      `,
        process.env.TELEGRAM_CHAT_ID,
        process.env.TELEGRAM_TOPIC_NEW_ORDER_ID
      );
    }

    await order.save();

    successResponse(res, order, "Order updated successfully");
  } catch (err) {
    next(err);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    // increase the quantity of the products in the order back to the stock

    const order = await Order.findById(req.params.id);

    if (order.status !== "cancelled") {
      order.products.forEach(async (product) => {
        try {
          const productInDb = await Product.findById(product.product);
          productInDb.stock_quantity += product.quantity;
          await productInDb.save();
        } catch (err) {
          next(err);
        }
      });

      // create new inventory record
      const inventories = order.products.map((product) => {
        return new Inventory({
          product: product.product,
          quantity_adjusted: Number(product.quantity),
          adjusted_by: req.user.id,
          adjustment_date: new Date(),
          adjustment_type: "RETURN_IN",
          reason: "Order cancelled (deleted)",
        });
      });

      await Inventory.insertMany(inventories);
    }

    // delete
    await Order.findByIdAndDelete(req.params.id);
    successResponse(res, null, "Order deleted successfully");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
