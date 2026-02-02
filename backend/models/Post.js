const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        default: ''
    },
    media_type: {
        type: String,
        enum: ['IMAGE', 'VIDEO'],
        required: true
    },
    media_path: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED'],
        default: 'DRAFT'
    },
    rejection_reason: {
        type: String,
        default: null
    },
    media_deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Virtual for 'id' to match MySQL behavior
postSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);
