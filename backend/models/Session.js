const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    device_info: {
        type: String,
        default: 'Unknown Device'
    },
    browser: String,
    os: String,
    ip_address: String,
    location: String,
    is_active: {
        type: Boolean,
        default: true
    },
    last_activity: {
        type: Date,
        default: Date.now
    },
    expires_at: {
        type: Date,
        required: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Index for efficient querying
sessionSchema.index({ user_id: 1 });
sessionSchema.index({ token: 1 });
sessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired sessions

// Virtual for 'id'
sessionSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

sessionSchema.set('toJSON', { virtuals: true });
sessionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Session', sessionSchema);
