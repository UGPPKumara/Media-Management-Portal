const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['POST_SUBMITTED', 'POST_APPROVED', 'POST_REJECTED', 'POST_PUBLISHED', 'USER_REGISTERED', 'SYSTEM'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    link: {
        type: String,
        default: null
    },
    is_read: {
        type: Boolean,
        default: false,
        index: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound index for efficient queries
notificationSchema.index({ user_id: 1, is_read: 1, created_at: -1 });

// Virtual for 'id'
notificationSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Notification', notificationSchema);
