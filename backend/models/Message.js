const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversation_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    read_by: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Indexes for faster queries
MessageSchema.index({ conversation_id: 1, created_at: 1 });
MessageSchema.index({ read_by: 1 });

// Virtual for id
MessageSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

MessageSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Message', MessageSchema);
