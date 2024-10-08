const mongoose = require("mongoose");
const { Schema } = mongoose;

const AdjustmentType = {
  PURCHASE: "PURCHASE", // Stock added from a purchase order
  SALE: "SALE", // Stock removed due to a sale
  RETURN_IN: "RETURN_IN", // Stock added back from a customer return
  RETURN_OUT: "RETURN_OUT", // Stock sent back to a supplier
  DAMAGE: "DAMAGE", // Stock removed due to damage or spoilage
  CORRECTION_IN: "CORRECTION_IN", // Manual stock increase (e.g., found missing items)
  CORRECTION_OUT: "CORRECTION_OUT", // Manual stock decrease (e.g., counting error)
};

const inverntorySchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  adjusted_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  adjustment_type: {
    type: String,
    enum: Object.values(AdjustmentType),
    required: true,
  },
  quantity_adjusted: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  adjustment_date: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const Inventory = mongoose.model("Inventory", inverntorySchema);

module.exports = Inventory;
