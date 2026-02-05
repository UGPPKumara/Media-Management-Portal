const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('Fetching profile for user:', userId);
        
        const user = await User.findById(userId)
            .select('id username email role full_name phone_number nic address profile_picture');

        if (!user) {
            console.log('User not found in DB:', userId);
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
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

        await User.findByIdAndUpdate(userId, {
            full_name,
            phone_number,
            nic,
            address
        });

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

        const user = await User.findById(userId).select('password_hash');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.findByIdAndUpdate(userId, { password_hash: hashedPassword });

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
        
        const profilePicturePath = req.file.path; // Cloudinary URL

        await User.findByIdAndUpdate(userId, { profile_picture: profilePicturePath });

        res.json({ 
            message: 'Profile picture uploaded successfully', 
            profile_picture: profilePicturePath 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
