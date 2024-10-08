const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "manager", "cashier", "inventoryStaff"],
    required: true,
  },
  profile_picture: {
    type: String,
  },

  chat_id: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
