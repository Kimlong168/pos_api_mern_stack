const mongoose = require("mongoose");
const { Schema } = mongoose;

const reportSchema = new Schema({
  report_type: {
    type: String,
    enum: ["sales", "inventory", "financial"],
    required: true,
  },
  data: {
    type: Schema.Types.Mixed, // Allows for various structures
    required: true,
  },
  generated_by: {
    type: Schema.Types.ObjectId,
    ref: "User", // Assuming you have a User model
    required: true,
  },
  generated_at: {
    type: Date,
    default: Date.now,
  },
});

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
