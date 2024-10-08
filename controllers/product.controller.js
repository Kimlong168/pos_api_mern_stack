const Product = require("../models/product.model");
const Inventory = require("../models/inventory.model");
const { successResponse, errorResponse } = require("../utils/responseHelpers");
const {
  uploadImage,
  replaceImage,
  deleteImage,
} = require("../utils/uploadImage");

const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate({
        path: "category",
        select: "name",
      })
      .populate({
        path: "supplier",
        select: "name",
      })
      .exec();
    successResponse(res, products, "Data retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        path: "category",
        select: "name",
      })
      .populate({
        path: "supplier",
        select: "name",
      })
      .exec();
    successResponse(res, product, "Data retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  let image = { secure_url: null };
  try {
    if (req.file) {
      image = await uploadImage(req.file.path);
    }

    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      image: image.secure_url,
      price: req.body.price,
      barcode: req.body.barcode,
      category: req.body.category,
      supplier: req.body.supplier,
      stock_quantity: req.body.stock_quantity,
      minimum_stock: req.body.minimum_stock,
    });

    // create inventory record
    const inventory = new Inventory({
      product: product._id,
      adjusted_by: req.user.id,
      adjustment_type: "PURCHASE",
      quantity_adjusted: product.stock_quantity,
      adjustment_date: new Date(),
      reason: "Initial stock",
    });

    await inventory.save();

    await product.save();
    successResponse(res, product, "Product created successfully");
  } catch (err) {
    await deleteImage(image.secure_url);
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return errorResponse(res, 404, "Product not found");
    }

    if (req.file) {
      const image = await replaceImage(product.image, req.file.path);
      product.image = image.secure_url;
    }
    let previouStockQuantity = product.stock_quantity;
    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.category = req.body.category || product.category;
    product.supplier = req.body.supplier || product.supplier;
    product.barcode = req.body.barcode || product.barcode;
    product.stock_quantity = req.body.stock_quantity || product.stock_quantity;
    product.minimum_stock = req.body.minimum_stock || product.minimum_stock;

    if (req.body.stock_quantity != previouStockQuantity) {
      // create inventory record
      const inventory = new Inventory({
        product: product._id,
        adjusted_by: req.user.id,
        adjustment_type:
          req.body.stock_quantity > previouStockQuantity
            ? "CORRECTION_IN"
            : "CORRECTION_OUT",
        quantity_adjusted: req.body.stock_quantity - previouStockQuantity,
        adjustment_date: new Date(),
        reason: "Stock Adjustment",
      });

      await inventory.save();
    }

    await product.save();
    successResponse(res, product, "Product updated successfully");
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    await deleteImage(product.image);
    successResponse(res, null, "Product deleted successfully");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
