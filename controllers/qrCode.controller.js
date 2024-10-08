const QRCode = require("../models/qrCode.model");
const { successResponse, errorResponse } = require("../utils/responseHelpers");
const crypto = require("crypto");

// Get all QR codes
const getAllQRCodes = async (req, res, next) => {
  try {
    const qrCodes = await QRCode.find().exec();
    successResponse(res, qrCodes, "QR Codes retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

// Get a single QR code by ID
const getQRCodeById = async (req, res, next) => {
  try {
    const qrCode = await QRCode.findById(req.params.id).exec();

    if (!qrCode) {
      return errorResponse(res, 404, "QR Code not found");
    }

    successResponse(res, qrCode, "QR Code retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

// Create a new QR code
const createQRCode = async (req, res, next) => {
  try {
    const { location, lat, lng, radius } = req.body;

    // if already exists
    const qrCodeExists = await QRCode.findOne({
      lat,
      lng,
      radius,
    }).exec();

    if (qrCodeExists) {
      return errorResponse(res, 400, "QR Code already exists");
    }

    // Create new QR code
    const qrCode = new QRCode({
      location,
      lat,
      lng,
      radius

    });

    await qrCode.save();
    successResponse(res, qrCode, "QR Code created successfully.");
  } catch (err) {
    next(err);
  }
};

// Update an existing QR code
const updateQRCode = async (req, res, next) => {
  const { location, lat, lng, radius } = req.body;
  try {
    // if already exists
    const qrCodeExists = await QRCode.find({
      lat,
      lng,
      radius,
    }).exec();

    if (qrCodeExists.length > 1) {
      return errorResponse(res, 400, "QR Code already exists");
    }

    const qrCode = await QRCode.findById(req.params.id).exec();

    if (!qrCode) {
      return errorResponse(res, 404, "QR Code not found");
    }

    qrCode.location = location || qrCode.location;
    qrCode.lat = lat !== undefined ? lat : qrCode.lat;
    qrCode.lng = lng !== undefined ? lng : qrCode.lng;
    qrCode.radius = radius !== undefined ? radius : qrCode.radius;

    await qrCode.save();
    successResponse(res, qrCode, "QR Code updated successfully.");
  } catch (err) {
    next(err);
  }
};

// Delete a QR code by ID
const deleteQRCode = async (req, res, next) => {
  try {
    const qrCode = await QRCode.findByIdAndDelete(req.params.id);

    if (!qrCode) {
      return errorResponse(res, 404, "QR Code not found");
    }

    successResponse(res, null, "QR Code deleted successfully.");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllQRCodes,
  getQRCodeById,
  createQRCode,
  updateQRCode,
  deleteQRCode,
};
