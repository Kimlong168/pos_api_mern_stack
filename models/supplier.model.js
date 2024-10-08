const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  street: { type: String },
  city: { type: String, required: true },
  country: { type: String, required: true },
});

const contactInfoSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  email: { type: String, required: true },
  chat_id: { type: String },
  address: { type: addressSchema, required: true },
});

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact_info: { type: contactInfoSchema, required: true },
});

const Supplier = mongoose.model("Supplier", supplierSchema);

module.exports = Supplier;
