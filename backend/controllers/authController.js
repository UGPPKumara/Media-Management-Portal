const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

exports.register = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        
        // Basic validation
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Check if user exists
        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const userRole = role && ['MANAGER', 'ADMIN'].includes(role) ? role : 'CREATOR';
        
        await User.create({
            username,
            password_hash: hashedPassword,
            role: userRole
        });

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
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.is_active) {
            return res.status(403).json({ message: 'your account has been blocked. Contact Admin.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'fallback_dev_secret_key_123',
            { expiresIn: '24h' }
        );

        res.json({ 
            token, 
            user: { 
                id: user._id, 
                username: user.username, 
                role: user.role, 
                profile_picture: user.profile_picture 
            } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper to send email
const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'localhost',
        port: process.env.SMTP_PORT || 25,
        secure: process.env.SMTP_PORT == 465,
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
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 Hour

        user.reset_token = token;
        user.reset_token_expires = expires;
        await user.save();

        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
        
        try {
            await sendEmail(email, 'Password Reset Request', `Click here to reset your password: ${resetLink}`);
            console.log(`Reset link sent to ${email}: ${resetLink}`);
        } catch (mailErr) {
            console.error('Mail failed:', mailErr);
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
        
        const user = await User.findOne({ 
            reset_token: token, 
            reset_token_expires: { $gt: new Date() } 
        });
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password_hash = hashedPassword;
        user.reset_token = null;
        user.reset_token_expires = null;
        await user.save();

        res.json({ message: 'Password has been reset' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
