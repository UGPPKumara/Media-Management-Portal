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
        const { 
            company_name,
            company_email,
            company_phone,
            company_address,
            website_url,
            facebook_url,
            instagram_url,
            twitter_url,
            youtube_url,
            timezone
        } = req.body;

        let logo_url = null;
        if (req.file) {
            logo_url = `/uploads/company/${req.file.filename}`;
        }

        let settings = await CompanySettings.findOne();
        
        if (!settings) {
            // Create if doesn't exist
            settings = await CompanySettings.create({
                company_name,
                logo_url: logo_url || null,
                company_email: company_email || '',
                company_phone: company_phone || '',
                company_address: company_address || '',
                website_url: website_url || '',
                facebook_url: facebook_url || '',
                instagram_url: instagram_url || '',
                twitter_url: twitter_url || '',
                youtube_url: youtube_url || '',
                timezone: timezone || 'Asia/Colombo'
            });
        } else {
            // Update existing
            settings.company_name = company_name || settings.company_name;
            if (logo_url) {
                settings.logo_url = logo_url;
            }
            // Update new fields
            if (company_email !== undefined) settings.company_email = company_email;
            if (company_phone !== undefined) settings.company_phone = company_phone;
            if (company_address !== undefined) settings.company_address = company_address;
            if (website_url !== undefined) settings.website_url = website_url;
            if (facebook_url !== undefined) settings.facebook_url = facebook_url;
            if (instagram_url !== undefined) settings.instagram_url = instagram_url;
            if (twitter_url !== undefined) settings.twitter_url = twitter_url;
            if (youtube_url !== undefined) settings.youtube_url = youtube_url;
            if (timezone !== undefined) settings.timezone = timezone;
            
            await settings.save();
        }

        res.json({ message: 'Settings updated successfully', settings });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
