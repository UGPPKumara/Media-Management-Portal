const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'PROFILE_UPDATE', 'POST_CREATE', 'POST_UPDATE', 'POST_DELETE', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'ROLE_CHANGE', 'STATUS_CHANGE', 'SETTINGS_UPDATE']
    },
    description: {
        type: String,
        required: true
    },
    ip_address: String,
    user_agent: String,
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Index for efficient querying
activityLogSchema.index({ user_id: 1, created_at: -1 });
activityLogSchema.index({ action: 1 });

// Virtual for 'id'
activityLogSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

activityLogSchema.set('toJSON', { virtuals: true });
activityLogSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
