const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    // For support chats, creator is the one who started the conversation
    creator_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        default: 'Support Request'
    },
    last_message: {
        type: String,
        default: ''
    },
    last_message_at: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['OPEN', 'CLOSED'],
        default: 'OPEN'
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Indexes for faster lookups
ConversationSchema.index({ creator_id: 1 });
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ last_message_at: -1 });

// Virtual for id
ConversationSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

ConversationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
