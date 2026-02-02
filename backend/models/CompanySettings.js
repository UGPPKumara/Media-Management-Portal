const mongoose = require('mongoose');

const companySettingsSchema = new mongoose.Schema({
    company_name: {
        type: String,
        default: 'MediaPortal'
    },
    logo_url: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CompanySettings', companySettingsSchema);
