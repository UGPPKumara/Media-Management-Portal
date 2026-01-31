const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        
        // Basic validation
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Check if user exists
        const [existing] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        // Default role is CREATOR if not specified or restricted
        const userRole = role && ['MANAGER', 'ADMIN'].includes(role) ? role : 'CREATOR';
        
        await db.query('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', 
            [username, hashedPassword, userRole]);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check user
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        if (!user.is_active) {
            return res.status(403).json({ message: 'your account has been blocked. Contact Admin.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'fallback_dev_secret_key_123',
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.id, username: user.username, role: user.role, profile_picture: user.profile_picture } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Helper to send email (Configure this with real credentials in .env)
const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'localhost',
        port: process.env.SMTP_PORT || 25,
        secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    await transporter.sendMail({
        from: '"Media Portal Support" <no-reply@mediaportal.com>',
        to,
        subject,
        text
    });
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];
        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 Hour

        await db.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?', 
            [token, expires, user.id]);

        const resetLink = `http://localhost:3000/reset-password?token=${token}`;
        
        // Try sending email, log link just in case SMTP fails in dev
        try {
            await sendEmail(email, 'Password Reset Request', `Click here to reset your password: ${resetLink}`);
            console.log(`Reset link sent to ${email}: ${resetLink}`);
        } catch (mailErr) {
            console.error('Mail failed:', mailErr);
            // In dev, we can return the link for testing if mail fails
            return res.json({ message: 'Email service failed, but here is the link (Dev Mode)', link: resetLink });
        }

        res.json({ message: 'Password reset email sent' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        const [users] = await db.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()', [token]);
        
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const user = users[0];
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', 
            [hashedPassword, user.id]);

        res.json({ message: 'Password has been reset' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
