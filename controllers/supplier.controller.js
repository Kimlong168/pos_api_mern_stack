const Supplier = require("../models/supplier.model.js");
const { errorResponse, successResponse } = require("../utils/responseHelpers");
// Retrieve all Suppliers from the database.
const getAllSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find();
    successResponse(res, suppliers, "Data retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

// Find a single Supplier with a supplierId
const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    successResponse(res, supplier, "Data retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

// Create and Save a new Supplier
const createSupplier = async (req, res, next) => {
  const supplier = new Supplier({
    name: req.body.name,
    contact_info: {
      address: {
        street: req.body.street,
        city: req.body.city,
        country: req.body.country,
      },
      phone: req.body.phone,
      email: req.body.email,
      chat_id: req.body.chat_id,
    },
  });
  try {
    await supplier.save();
    successResponse(res, supplier, "Supplier created successfully");
  } catch (err) {
    next(err);
  }
};
// Update a Supplier identified by the supplierId in the request

const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    supplier.name = req.body.name;
    supplier.contact_info.address.street = req.body.street;
    supplier.contact_info.address.city = req.body.city;
    supplier.contact_info.address.country = req.body.country;
    supplier.contact_info.phone = req.body.phone;
    supplier.contact_info.email = req.body.email;
    supplier.contact_info.chat_id = req.body.chat_id;

    await supplier.save();
    successResponse(res, supplier, "Supplier updated successfully");
  } catch (err) {
    next(err);
  }
};

// Delete a Supplier with the specified supplierId in the request
const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    successResponse(res, null, "Supplier deleted successfully");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
