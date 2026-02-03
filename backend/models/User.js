const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true
    },
    password_hash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['CREATOR', 'MANAGER', 'ADMIN'],
        default: 'CREATOR'
    },
    is_active: {
        type: Boolean,
        default: true
    },
    full_name: String,
    phone_number: String,
    nic: String,
    address: String,
    profile_picture: String,
    reset_token: String,
    reset_token_expires: Date,
    
    // New Fields
    last_login: {
        type: Date,
        default: null
    },
    login_count: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    admin_notes: {
        type: String,
        default: ''
    },
    invite_token: String,
    invite_expires: Date,
    invited_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Virtual for 'id' to match MySQL behavior
userSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
