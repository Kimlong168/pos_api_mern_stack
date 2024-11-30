const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
  },

  lat: {
    type: Number,
    required: true,
  },

  lng: {
    type: Number,
    required: true,
  },

  radius: {
    type: Number, // Radius in meters within which the scan is valid
    default: 20, // Example default radius of 50 meters
  },

  // allowedNetworkRanges: {
  //   type: [String],
  //   required: true,
  // },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

const QRCode = mongoose.model("QRCode", qrCodeSchema);

module.exports = QRCode;
