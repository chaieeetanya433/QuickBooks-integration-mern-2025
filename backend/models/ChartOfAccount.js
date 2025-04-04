const mongoose = require("mongoose");

const chartOfAccountSchema = new mongoose.Schema(
  {
    Id: { type: String, required: true, unique: true },
    Name: { type: String, required: true },
    AccountType: { type: String },
    AccountSubType: { type: String },
    Classification: { type: String },
    Active: { type: Boolean },
    MetaData: { type: Object },
    // Other QuickBooks fields will be dynamically included
  },
  {
    timestamps: true,
    strict: false // Allow dynamic fields from QuickBooks API
  }
);

// Drop existing index if it exists
// The model will use the Id field which is already unique
// This prevents issues with qboId index
chartOfAccountSchema.index({ Id: 1 }, { unique: true });

module.exports = mongoose.model("ChartOfAccount", chartOfAccountSchema);