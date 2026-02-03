const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { logActivity } = require('./activityController');
const { createSession } = require('./sessionController');

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
            return res.status(403).json({ message: 'Your account has been blocked. Contact Admin.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'fallback_dev_secret_key_123',
            { expiresIn: '7d' }
        );

        // Update last login and login count
        user.last_login = new Date();
        user.login_count = (user.login_count || 0) + 1;
        await user.save();

        // Create session
        await createSession(user._id, token, req);

        // Log activity
        await logActivity(user._id, 'LOGIN', `User ${user.username} logged in`, req);

        res.json({ 
            token, 
            user: { 
                id: user._id, 
                username: user.username, 
                email: user.email,
                role: user.role, 
                full_name: user.full_name,
                profile_picture: user.profile_picture,
                last_login: user.last_login,
                tags: user.tags || []
            } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper to send email
const sendEmail = async (to, subject, html) => {
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
        from: `"${process.env.COMPANY_NAME || 'Media Portal'}" <no-reply@mediaportal.com>`,
        to,
        subject,
        html
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
            await sendEmail(email, 'Password Reset Request', `
                <h2>Password Reset</h2>
                <p>Click the link below to reset your password:</p>
                <a href="${resetLink}" style="padding: 10px 20px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px;">Reset Password</a>
                <p>This link expires in 1 hour.</p>
            `);
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

        // Log activity
        await logActivity(user._id, 'PASSWORD_CHANGE', `User ${user.username} reset their password`, null);

        res.json({ message: 'Password has been reset' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Invite user via email
exports.inviteUser = async (req, res) => {
    try {
        const { email, role } = req.body;

        // Check if email already exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Create invite token
        const inviteToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 7 * 24 * 3600000); // 7 days

        // Create placeholder user
        const tempPassword = crypto.randomBytes(8).toString('hex');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        const newUser = await User.create({
            username: email.split('@')[0] + '_' + Date.now().toString(36),
            email,
            password_hash: hashedPassword,
            role: role || 'CREATOR',
            is_active: false,
            invite_token: inviteToken,
            invite_expires: expires,
            invited_by: req.user.id
        });

        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?invite=${inviteToken}`;

        try {
            await sendEmail(email, 'You are invited to join Media Portal!', `
                <h2>Welcome!</h2>
                <p>You have been invited to join Media Portal as a ${role || 'Creator'}.</p>
                <a href="${inviteLink}" style="padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; display: inline-block;">Accept Invitation</a>
                <p>This invitation expires in 7 days.</p>
            `);
        } catch (mailErr) {
            console.error('Mail failed:', mailErr);
            return res.json({ message: 'Email service failed, but here is the link (Dev Mode)', link: inviteLink });
        }

        // Log activity
        await logActivity(req.user.id, 'USER_CREATE', `Invited ${email} as ${role || 'CREATOR'}`, req);

        res.json({ message: 'Invitation sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
