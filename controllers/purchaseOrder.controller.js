const PurchaseOrder = require("../models/purchaseOrder.model");
const Product = require("../models/product.model");
const Inventory = require("../models/inventory.model");
const { successResponse } = require("../utils/responseHelpers");
const { sendTelegramMessage } = require("../utils/sendTelegramMessage");
const { getFormattedDate } = require("../utils/getFormattedDate");
const getAllPurchaseOrders = async (req, res, next) => {
  try {
    const purchaseOrders = await PurchaseOrder.find()
      .populate("supplier")
      .populate({
        path: "products.product",
        select: "name price barcode stock_quantity image",
      })
      .exec();
    successResponse(res, purchaseOrders, "Data retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

const getPurchaseOrderById = async (req, res, next) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate("supplier")
      .populate({
        path: "products.product",
        select: "name price barcode stock_quantity image",
      })
      .exec();
    successResponse(res, purchaseOrder, "Data retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

const createPurchaseOrder = async (req, res, next) => {
  if (req.body.status === "cancelled") {
    return errorResponse(res, null, "Cannot create a cancelled purchase order");
  }

  const purchaseOrder = new PurchaseOrder({
    supplier: req.body.supplier,
    products: req.body.products,
    total_price: req.body.total_price,
    status: req.body.status,
    order_date: req.body.order_date,
    recieve_date: req.body.recieve_date,
    remarks: req.body.remarks,
  });
  try {
    if (req.body.status === "completed") {
      purchaseOrder.recieve_date = new Date();

      // update the stock quantity of the product
      purchaseOrder.products.forEach(async (product) => {
        try {
          const productInDb = await Product.findById(product.product);
          productInDb.stock_quantity += product.quantity;
          await productInDb.save();

          // create inventory record
          const inventory = new Inventory({
            product: productInDb._id,
            adjusted_by: req.user.id,
            adjustment_type: "PURCHASE",
            quantity_adjusted: product.quantity,
            adjustment_date: new Date(),
            reason: "Purchase Order",
          });

          await inventory.save();
        } catch (err) {
          next(err);
        }
      });
    }

    const result = await purchaseOrder.save();

    const products = await Product.find({
      _id: { $in: purchaseOrder.products.map((p) => p.product) },
    });

    // Send the telegram group
    await sendTelegramMessage(
      `New Purchase Order Created 📝
      \n🆔 Order ID: ${req.body.id}
      \n🏢 Supplier: ${req.body.supplier}
      \n📦 Products: ${req.body.products
        .map(
          (p) =>
            `\n - ${
              products.find((product) => product._id == p.product).name
            } (x${p.quantity})`
        )
        .join("")}
      \n💰 Total Price: $${req.body.total_price}
      \n📅 Order Date: ${getFormattedDate(req.body.order_date)}
      \n📅 Receive Date: ${getFormattedDate(req.body.recieve_date)}
      \n🔖 Status: ${req.body.status}
      \n📝 Remarks: ${req.body.remarks || "No remarks"}`,
      process.env.TELEGRAM_CHAT_ID,
      process.env.TELEGRAM_TOPIC_NEW_PURCHASE_ORDER_ID
    );

    successResponse(res, purchaseOrder, "Purchase Order created successfully");
  } catch (err) {
    next(err);
  }
};

const updatePurchaseOrder = async (req, res, next) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);

    let previousStatus = purchaseOrder.status;
    let previousProducts = purchaseOrder.products;
    purchaseOrder.supplier = req.body.supplier;
    purchaseOrder.products = req.body.products;
    purchaseOrder.total_price = req.body.total_price;
    purchaseOrder.status = req.body.status;
    purchaseOrder.order_date = req.body.order_date;
    purchaseOrder.recieve_date = req.body.recieve_date;
    purchaseOrder.remarks = req.body.remarks;

    if (req.body.status === "completed" && previousStatus !== "completed") {
      purchaseOrder.recieve_date = new Date();

      // update the stock quantity of the product
      purchaseOrder.products.forEach(async (product) => {
        try {
          const productInDb = await Product.findById(product.product);
          productInDb.stock_quantity += product.quantity;
          await productInDb.save();

          // create inventory record
          const inventory = new Inventory({
            product: productInDb._id,
            adjusted_by: req.user.id,
            adjustment_type: "PURCHASE",
            quantity_adjusted: product.quantity,
            adjustment_date: new Date(),
            reason: "Purchase Order",
          });

          await inventory.save();
        } catch (err) {
          next(err);
        }
      });
    }

    // if the status is changed from completed to cancelled
    if (
      previousStatus === "completed" &&
      (req.body.status === "cancelled" || req.body.status === "pending")
    ) {
      // update the stock quantity of the product
      previousProducts.forEach(async (product) => {
        try {
          const productInDb = await Product.findById(product.product);
          productInDb.stock_quantity -= product.quantity;
          await productInDb.save();

          // create inventory record
          const inventory = new Inventory({
            product: productInDb._id,
            adjusted_by: req.user.id,
            adjustment_type: "RETURN_OUT",
            quantity_adjusted: -product.quantity,
            adjustment_date: new Date(),
            reason: "Purchase Order cancelled",
          });

          await inventory.save();
        } catch (err) {
          next(err);
        }
      });
    }

    await purchaseOrder.save();

    const products = await Product.find({
      _id: { $in: purchaseOrder.products.map((p) => p.product) },
    });
    // Send the telegram group
    await sendTelegramMessage(
      `Purchase Order Updated 📝
          \n🆔 Order ID: ${req.body.id}
          \n🏢 Supplier: ${req.body.supplier}
          \n📦 Products: ${req.body.products
            .map(
              (p) =>
                `\n - ${
                  products.find((product) => product._id == p.product).name
                } (x${p.quantity})`
            )
            .join("")}
          \n💰 Total Price: $${req.body.total_price}
          \n📅 Order Date: ${getFormattedDate(req.body.order_date)}
          \n📅 Receive Date: ${getFormattedDate(req.body.recieve_date)}
          \n🔖 Status: ${req.body.status}
          \n📝 Remarks: ${req.body.remarks || "No remarks"}`,
      process.env.TELEGRAM_CHAT_ID,
      process.env.TELEGRAM_TOPIC_NEW_PURCHASE_ORDER_ID
    );
    successResponse(res, purchaseOrder, "Purchase Order updated successfully");
  } catch (err) {
    next(err);
  }
};

const deletePurchaseOrder = async (req, res, next) => {
  // update the stock quantity of the product

  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);

    if (purchaseOrder.status === "completed") {
      purchaseOrder.products.forEach(async (product) => {
        try {
          const productInDb = await Product.findById(product.product);

          productInDb.stock_quantity -= product.quantity;
          await productInDb.save();

          // create inventory record
          const inventory = new Inventory({
            product: productInDb._id,
            adjusted_by: req.user.id,
            adjustment_type: "RETURN_OUT",
            quantity_adjusted: -product.quantity,
            adjustment_date: new Date(),
            reason: "Purchase Order cancelled (deleted)",
          });

          await inventory.save();
        } catch (err) {
          next(err);
        }
      });
    }

    await PurchaseOrder.findByIdAndDelete(req.params.id);
    successResponse(res, null, "Purchase Order deleted successfully");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
};
