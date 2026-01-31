const db = require('../config/database');

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, username, email, role, is_active, created_at, full_name, phone_number, nic, address, profile_picture FROM users ORDER BY created_at DESC');
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

        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.json({ message: `User role updated to ${role}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role, full_name, phone_number, nic, address } = req.body;

        if (!username || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const [existing] = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User or Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query('INSERT INTO users (username, email, password_hash, role, full_name, phone_number, nic, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
            [username, email, hashedPassword, role, full_name, phone_number, nic, address]);

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if target is admin
        const [target] = await db.query('SELECT username FROM users WHERE id = ?', [id]);
        if (target.length > 0 && target[0].username === 'admin') {
            return res.status(403).json({ message: 'Cannot delete the default admin account' });
        }

        await db.query('DELETE FROM users WHERE id = ?', [id]);
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

        // Check if target is admin
        const [target] = await db.query('SELECT username FROM users WHERE id = ?', [id]);
        if (target.length > 0 && target[0].username === 'admin') {
            return res.status(403).json({ message: 'Cannot block the default admin account' });
        }

        await db.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active, id]);
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
        if (req.user.role !== 'ADMIN' && req.user.id != id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { username, email, role, full_name, phone_number, nic, address } = req.body;

        // Check if username/email already exists for OTHER users
        const [existing] = await db.query('SELECT * FROM users WHERE (username = ? OR email = ?) AND id != ?', [username, email, id]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Username or Email already in use' });
        }

        await db.query(
            'UPDATE users SET username = ?, email = ?, role = ?, full_name = ?, phone_number = ?, nic = ?, address = ? WHERE id = ?',
            [username, email, role, full_name, phone_number, nic, address, id]
        );

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
        if (req.user.role !== 'ADMIN' && req.user.id != id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [users] = await db.query(
            'SELECT id, username, email, role, full_name, phone_number, nic, address, profile_picture, is_active, created_at FROM users WHERE id = ?', 
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(users[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserPosts = async (req, res) => {
    try {
        const { id } = req.params;

        // Permission check
        if (req.user.role !== 'ADMIN' && req.user.id != id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [posts] = await db.query(
            `SELECT p.*, u.username, u.profile_picture 
             FROM posts p 
             JOIN users u ON p.user_id = u.id 
             WHERE p.user_id = ? 
             ORDER BY p.created_at DESC`, 
            [id]
        );
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
