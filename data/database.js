const mongoose = require("mongoose");

let mongoURI = process.env.MONGODB_URI;

const connect = async (callback) => {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");

    // Start the Express server after successful connection
    callback();
  } catch (err) {
    console.error("MongoDB connection error:", err);
    // Optionally exit the process if connection fails
    process.exit(1);
  }
};

module.exports = { connect };
