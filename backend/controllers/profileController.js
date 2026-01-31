const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('Fetching profile for user:', userId);
        
        const [users] = await db.query(
            'SELECT id, username, email, role, full_name, phone_number, nic, address, profile_picture FROM users WHERE id = ?', 
            [userId]
        );

        if (users.length === 0) {
            console.log('User not found in DB:', userId);
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(users[0]);
    } catch (err) {
        console.error('getProfile Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Update profile details
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, phone_number, nic, address } = req.body;

        // Note: Email and Username typically shouldn't be changed here without verification, 
        // adhering to user request "email eka witarak change kranna ba" (email cannot be changed).
        // Allowing other fields update.

        await db.query(
            'UPDATE users SET full_name = ?, phone_number = ?, nic = ?, address = ? WHERE id = ?',
            [full_name, phone_number, nic, address, userId]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide both current and new passwords' });
        }

        const [users] = await db.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        const uniqueHashedPassword = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [uniqueHashedPassword, userId]);

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Upload Profile Picture
exports.uploadProfilePicture = async (req, res) => {
    try {
        console.log('Upload Request Received');
        console.log('File:', req.file);
        
        if (!req.file) {
            console.log('No file in request');
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const userId = req.user.id;
        console.log('User ID:', userId);
        // Construct public URL. Assuming 'uploads' is served statically.
        // req.file.filename gives the saved filename.
        // URL format: /uploads/profiles/<filename>
        const profilePicturePath = `/uploads/profiles/${req.file.filename}`;

        await db.query('UPDATE users SET profile_picture = ? WHERE id = ?', [profilePicturePath, userId]);

        res.json({ 
            message: 'Profile picture uploaded successfully', 
            profile_picture: profilePicturePath 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
