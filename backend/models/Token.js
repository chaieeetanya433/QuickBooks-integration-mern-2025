const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    token: {
        access_token: { type: String, required: true },
        refresh_token: { type: String, required: true },
        token_type: { type: String, default: 'bearer' },
        expires_in: { type: Number, required: true },
        expires_at: { 
            type: Date, 
            required: true,
            default: function() {
                // Default calculation if expires_at isn't provided but expires_in is
                if (this.token && this.token.expires_in) {
                    return new Date(Date.now() + (this.token.expires_in * 1000));
                }
                return undefined; // Will still trigger required validation if no expires_in
            }
        },
        x_refresh_token_expires_in: { type: Number },
        id_token: { type: String }
    },
    realmId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '90d' } // Auto-expire after 90 days
}, { 
    timestamps: true 
});

// Index for faster queries
tokenSchema.index({ createdAt: -1 });
tokenSchema.index({ realmId: 1 });

module.exports = mongoose.model('Token', tokenSchema);