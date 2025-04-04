const mongoose = require("mongoose");

const payeeSchema = new mongoose.Schema(
    {
        Id: { type: String, required: true },
        type: {
            type: String,
            required: true,
            enum: ["vendor", "customer"]
        },
        DisplayName: { type: String },
        CompanyName: { type: String },
        Active: { type: Boolean },
        MetaData: { type: Object },
        // Other QuickBooks fields will be dynamically included
    },
    {
        timestamps: true,
        strict: false // Allow dynamic fields from QuickBooks API
    }
);

// Only create a compound index on Id and type to ensure uniqueness
payeeSchema.index({ Id: 1, type: 1 }, { unique: true });

// Export model, ensure collection name matches what's in the database
module.exports = mongoose.model("Payee", payeeSchema, "payees");