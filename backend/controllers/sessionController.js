const Session = require('../models/Session');
const jwt = require('jsonwebtoken');

// Get all sessions for a user
exports.getUserSessions = async (req, res) => {
    try {
        const { id } = req.params;

        // Permission check
        if (req.user.role !== 'ADMIN' && req.user.id != id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const sessions = await Session.find({ user_id: id, is_active: true })
            .sort({ last_activity: -1 });

        res.json(sessions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Terminate a session
exports.terminateSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Permission check
        if (req.user.role !== 'ADMIN' && req.user.id != session.user_id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        session.is_active = false;
        await session.save();

        res.json({ message: 'Session terminated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Terminate all sessions for a user (except current)
exports.terminateAllSessions = async (req, res) => {
    try {
        const { id } = req.params;
        const currentToken = req.headers.authorization?.split(' ')[1];

        // Permission check
        if (req.user.role !== 'ADMIN' && req.user.id != id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await Session.updateMany(
            { user_id: id, token: { $ne: currentToken } },
            { is_active: false }
        );

        res.json({ message: 'All other sessions terminated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create session on login
exports.createSession = async (userId, token, req) => {
    try {
        const userAgent = req.headers['user-agent'] || '';
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        // Parse user agent for device info
        let browser = 'Unknown';
        let os = 'Unknown';
        let deviceInfo = 'Unknown Device';

        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';

        if (userAgent.includes('Windows')) os = 'Windows';
        else if (userAgent.includes('Mac')) os = 'MacOS';
        else if (userAgent.includes('Linux')) os = 'Linux';
        else if (userAgent.includes('Android')) os = 'Android';
        else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

        deviceInfo = `${browser} on ${os}`;

        // Set expiry (7 days)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await Session.create({
            user_id: userId,
            token,
            device_info: deviceInfo,
            browser,
            os,
            ip_address: ipAddress,
            expires_at: expiresAt
        });
    } catch (err) {
        console.error('Failed to create session:', err);
    }
};

// Update session activity
exports.updateSessionActivity = async (token) => {
    try {
        await Session.findOneAndUpdate(
            { token },
            { last_activity: new Date() }
        );
    } catch (err) {
        console.error('Failed to update session:', err);
    }
};
