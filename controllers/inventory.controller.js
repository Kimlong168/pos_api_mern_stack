const Inventory = require("../models/inventory.model");
const Product = require("../models/product.model");
const { successResponse } = require("../utils/responseHelpers");

const getAllInventories = async (req, res, next) => {
  try {
    const inventories = await Inventory.find()
      .populate({
        path: "product",
        select: "name barcode stock_quantity image",
      })
      .populate({
        path: "adjusted_by",
        select: "name role email",
      })
      .exec();
    successResponse(res, inventories, "Data retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

const getInventoryById = async (req, res, next) => {
  try {
    const inventory = await Inventory.findById(req.params.id)
      .populate({
        path: "product",
        select: "name barcode stock_quantity image",
      })
      .populate({
        path: "adjusted_by",
        select: "name role email",
      })
      .exec();
    successResponse(res, inventory, "Data retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

const getInventoryByProdcutId = async (req, res, next) => {
  try {
    const inventories = await Inventory.find({ product: req.params.productId })
      .populate({
        path: "product",
        select: "name barcode stock_quantity image",
      })
      .populate({
        path: "adjusted_by",
        select: "name role email",
      })
      .exec();
    successResponse(res, inventories, "Data retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

const createInventory = async (req, res, next) => {
  const inventory = new Inventory({
    product: req.body.product,
    adjusted_by: req.user.id,
    adjustment_type: req.body.adjustment_type,
    quantity_adjusted: req.body.quantity_adjusted,
    adjustment_date: req.body.adjustment_date,
    reason: req.body.reason,
  });
  try {
    // update the stock quantity of the product
    const product = await Product.findById(req.body.product);
    if (
      req.body.adjustment_type === "PURCHASE" ||
      req.body.adjustment_type === "RETURN_IN" ||
      req.body.adjustment_type === "CORRECTION_IN"
    ) {
      product.stock_quantity += req.body.quantity_adjusted;
    } else {
      product.stock_quantity -= req.body.quantity_adjusted;
    }

    await product.save();

    await inventory.save();
    successResponse(res, inventory, "Inventory created successfully");
  } catch (err) {
    next(err);
  }
};

const updateInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.findById(req.params.id);

    let previousAdjustmentType = inventory.adjustment_type;
    let previousQuantity = inventory.quantity_adjusted;
    // inventory.product = req.body.product;
    inventory.adjusted_by = req.user.id;
    inventory.adjustment_type = req.body.adjustment_type;
    inventory.adjustment_date = req.body.adjustment_date;
    inventory.reason = req.body.reason;
    inventory.quantity_adjusted = req.body.quantity_adjusted;

    // update the stock quantity of the product
    const product = await Product.findById(inventory.product);
    if (
      previousAdjustmentType === "PURCHASE" ||
      previousAdjustmentType === "RETURN_IN" ||
      previousAdjustmentType === "CORRECTION_IN"
    ) {
      product.stock_quantity -= Math.abs(previousQuantity);
    } else {
      product.stock_quantity += Math.abs(previousQuantity);
    }

    if (
      req.body.adjustment_type === "PURCHASE" ||
      req.body.adjustment_type === "RETURN_IN" ||
      req.body.adjustment_type === "CORRECTION_IN"
    ) {
      product.stock_quantity += req.body.quantity_adjusted;
    } else {
      product.stock_quantity -= req.body.quantity_adjusted;
    }

    await product.save();
    await inventory.save();

    successResponse(res, inventory, "Inventory updated successfully");
  } catch (err) {
    next(err);
  }
};

const deleteInventory = async (req, res, next) => {
  try {
    // update the stock quantity of the product
    const inventory = await Inventory.findById(req.params.id);
    const product = await Product.findById(inventory.product);

    if (
      inventory.adjustment_type === "PURCHASE" ||
      inventory.adjustment_type === "RETURN_IN" ||
      inventory.adjustment_type === "CORRECTION_IN"
    ) {
      product.stock_quantity -= Math.abs(inventory.quantity_adjusted);
    } else {
      product.stock_quantity += Math.abs(inventory.quantity_adjusted);
    }

    await product.save();

    await Inventory.findByIdAndDelete(req.params.id);
    successResponse(res, null, "Inventory deleted successfully");
  } catch (err) {
    next(err);
  }
};

const clearAllInventories = async (req, res, next) => {
  try {
    await Inventory.deleteMany();
    successResponse(res, null, "All inventories deleted successfully");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllInventories,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  getInventoryByProdcutId,
  clearAllInventories,
};
