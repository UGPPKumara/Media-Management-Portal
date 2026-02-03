const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

// Log an activity
exports.logActivity = async (userId, action, description, req = null, metadata = {}) => {
    try {
        await ActivityLog.create({
            user_id: userId,
            action,
            description,
            ip_address: req ? (req.headers['x-forwarded-for'] || req.connection.remoteAddress) : null,
            user_agent: req ? req.headers['user-agent'] : null,
            metadata
        });
    } catch (err) {
        console.error('Failed to log activity:', err);
    }
};

// Get all activity logs (Admin only)
exports.getAllLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50, action, user_id } = req.query;
        
        const query = {};
        if (action) query.action = action;
        if (user_id) query.user_id = user_id;

        const logs = await ActivityLog.find(query)
            .populate('user_id', 'username email profile_picture')
            .sort({ created_at: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await ActivityLog.countDocuments(query);

        res.json({
            logs,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user activity logs
exports.getUserLogs = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 20 } = req.query;

        const logs = await ActivityLog.find({ user_id: id })
            .sort({ created_at: -1 })
            .limit(parseInt(limit));

        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get recent activity for dashboard
exports.getRecentActivity = async (req, res) => {
    try {
        const logs = await ActivityLog.find()
            .populate('user_id', 'username profile_picture')
            .sort({ created_at: -1 })
            .limit(10);

        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Clear old logs (older than 30 days)
exports.clearOldLogs = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await ActivityLog.deleteMany({ created_at: { $lt: thirtyDaysAgo } });
        
        res.json({ message: `Deleted ${result.deletedCount} old log entries` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
