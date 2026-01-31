const db = require('../config/database');

// Get Company Settings
exports.getSettings = async (req, res) => {
    try {
        const [settings] = await db.query('SELECT * FROM company_settings WHERE id = 1');
        if (settings.length === 0) {
            return res.json({ company_name: 'MediaPortal', logo_url: null });
        }
        res.json(settings[0]);
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

        // Build query dynamically based on whether a new logo was uploaded
        if (logo_url) {
            await db.query(
                'UPDATE company_settings SET company_name = ?, logo_url = ? WHERE id = 1',
                [company_name, logo_url]
            );
        } else {
            await db.query(
                'UPDATE company_settings SET company_name = ? WHERE id = 1',
                [company_name]
            );
        }

        // Fetch updated settings
        const [updated] = await db.query('SELECT * FROM company_settings WHERE id = 1');
        res.json({ message: 'Settings updated successfully', settings: updated[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
