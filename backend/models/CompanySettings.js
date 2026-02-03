const mongoose = require('mongoose');

const companySettingsSchema = new mongoose.Schema({
    company_name: {
        type: String,
        default: 'MediaPortal'
    },
    logo_url: {
        type: String,
        default: null
    },
    // Contact Information
    company_email: {
        type: String,
        default: ''
    },
    company_phone: {
        type: String,
        default: ''
    },
    company_address: {
        type: String,
        default: ''
    },
    website_url: {
        type: String,
        default: ''
    },
    // Social Media Links
    facebook_url: {
        type: String,
        default: ''
    },
    instagram_url: {
        type: String,
        default: ''
    },
    twitter_url: {
        type: String,
        default: ''
    },
    youtube_url: {
        type: String,
        default: ''
    },
    // System Settings
    timezone: {
        type: String,
        default: 'Asia/Colombo'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CompanySettings', companySettingsSchema);
