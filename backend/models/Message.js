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

// Virtual for id
MessageSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

MessageSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Message', MessageSchema);
