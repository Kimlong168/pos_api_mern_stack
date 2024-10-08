const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true, // Allows this field to be optional while still enforcing uniqueness
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0.0,
  },
  stock_quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  minimum_stock: {
    type: Number,
    required: true,
    default: 0,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
