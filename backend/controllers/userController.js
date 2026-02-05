const User = require('../models/User');
const Post = require('../models/Post');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('id username email role is_active created_at full_name phone_number nic address profile_picture last_login login_count tags admin_notes')
            .sort({ created_at: -1 });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['CREATOR', 'MANAGER', 'ADMIN'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        await User.findByIdAndUpdate(id, { role });
        res.json({ message: `User role updated to ${role}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role, full_name, phone_number, nic, address } = req.body;

        if (!username || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existing = await User.findOne({ $or: [{ username }, { email }] });
        if (existing) {
            return res.status(400).json({ message: 'User or Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            username,
            email,
            password_hash: hashedPassword,
            role,
            full_name,
            phone_number,
            nic,
            address
        });

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const target = await User.findById(id);
        if (target && target.username === 'admin') {
            return res.status(403).json({ message: 'Cannot delete the default admin account' });
        }

        // Delete user's posts first
        await Post.deleteMany({ user_id: id });
        await User.findByIdAndDelete(id);
        
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body; 

        const target = await User.findById(id);
        if (target && target.username === 'admin') {
            return res.status(403).json({ message: 'Cannot block the default admin account' });
        }

        await User.findByIdAndUpdate(id, { is_active });
        res.json({ message: `User status updated to ${is_active ? 'Active' : 'Blocked'}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Permission check
        if (!['ADMIN', 'MANAGER'].includes(req.user.role) && req.user.id != id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { username, email, role, full_name, phone_number, nic, address } = req.body;

        // Check if username/email already exists for OTHER users
        const existing = await User.findOne({
            $or: [{ username }, { email }],
            _id: { $ne: id }
        });
        if (existing) {
            return res.status(400).json({ message: 'Username or Email already in use' });
        }

        await User.findByIdAndUpdate(id, {
            username,
            email,
            role,
            full_name,
            phone_number,
            nic,
            address
        });

        res.json({ message: 'User updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // Permission check
        if (!['ADMIN', 'MANAGER'].includes(req.user.role) && req.user.id != id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const user = await User.findById(id)
            .select('id username email role full_name phone_number nic address profile_picture is_active created_at');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserPosts = async (req, res) => {
    try {
        const { id } = req.params;

        // Permission check
        if (!['ADMIN', 'MANAGER'].includes(req.user.role) && req.user.id != id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const posts = await Post.find({ user_id: id })
            .populate('user_id', 'username profile_picture')
            .sort({ created_at: -1 });

        // Transform to include username at root level
        const transformedPosts = posts.map(post => ({
            ...post.toObject(),
            username: post.user_id?.username,
            profile_picture: post.user_id?.profile_picture
        }));

        res.json(transformedPosts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin Password Reset
exports.resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.findByIdAndUpdate(id, { password_hash: hashedPassword });
        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user tags
exports.updateUserTags = async (req, res) => {
    try {
        const { id } = req.params;
        const { tags } = req.body;

        if (!Array.isArray(tags)) {
            return res.status(400).json({ message: 'Tags must be an array' });
        }

        // Validate tags (max 5, max 20 chars each)
        const cleanTags = tags.slice(0, 5).map(t => t.toString().trim().substring(0, 20));

        await User.findByIdAndUpdate(id, { tags: cleanTags });
        res.json({ message: 'Tags updated', tags: cleanTags });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update admin notes
exports.updateUserNotes = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        await User.findByIdAndUpdate(id, { admin_notes: notes || '' });
        res.json({ message: 'Notes updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user analytics
exports.getUserAnalytics = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('username login_count last_login created_at');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const posts = await Post.find({ user_id: id });
        
        const totalPosts = posts.length;
        const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
        const publishedPosts = posts.filter(p => p.status === 'PUBLISHED').length;
        const pendingPosts = posts.filter(p => p.status === 'PENDING').length;
        const rejectedPosts = posts.filter(p => p.status === 'REJECTED').length;

        res.json({
            username: user.username,
            login_count: user.login_count || 0,
            last_login: user.last_login,
            member_since: user.created_at,
            totalPosts,
            publishedPosts,
            pendingPosts,
            rejectedPosts,
            totalViews
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
