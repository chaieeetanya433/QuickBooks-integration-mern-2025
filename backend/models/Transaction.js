const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    Id: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["purchase", "deposit"]
    },
    TxnDate: { type: Date },
    TotalAmt: { type: Number },
    CurrencyRef: { type: Object },
    PaymentType: { type: String },
    MetaData: { type: Object },
    // Other QuickBooks fields will be dynamically included
  },
  {
    timestamps: true,
    strict: false // Allow dynamic fields from QuickBooks API
  }
);

// Only create a compound index on Id and type to ensure uniqueness
transactionSchema.index({ Id: 1, type: 1 }, { unique: true });

// Export model, ensure collection name matches what's in the database
module.exports = mongoose.model("Transaction", transactionSchema, "transactions");
