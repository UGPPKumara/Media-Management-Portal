const CompanySettings = require('../models/CompanySettings');

// Get Company Settings
exports.getSettings = async (req, res) => {
    try {
        let settings = await CompanySettings.findOne();
        
        if (!settings) {
            // Create default settings if none exist
            settings = await CompanySettings.create({ 
                company_name: 'MediaPortal', 
                logo_url: null 
            });
        }
        
        res.json(settings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Company Settings
exports.updateSettings = async (req, res) => {
    try {
        const { company_name } = req.body;
        let logo_url = null;

        if (req.file) {
            logo_url = `/uploads/company/${req.file.filename}`;
        }

        let settings = await CompanySettings.findOne();
        
        if (!settings) {
            // Create if doesn't exist
            settings = await CompanySettings.create({
                company_name,
                logo_url: logo_url || null
            });
        } else {
            // Update existing
            settings.company_name = company_name;
            if (logo_url) {
                settings.logo_url = logo_url;
            }
            await settings.save();
        }

        res.json({ message: 'Settings updated successfully', settings });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
