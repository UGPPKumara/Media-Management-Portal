const Notification = require('../models/Notification');
const User = require('../models/User');

// Get all notifications for current user
exports.getMyNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ user_id: req.user.id })
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Notification.countDocuments({ user_id: req.user.id });

        res.json({
            notifications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ 
            user_id: req.user.id, 
            is_read: false 
        });
        res.json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark single notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        
        const notification = await Notification.findOneAndUpdate(
            { _id: id, user_id: req.user.id },
            { is_read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user_id: req.user.id, is_read: false },
            { is_read: true }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await Notification.findOneAndDelete({ 
            _id: id, 
            user_id: req.user.id 
        });

        if (!result) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper function to create notifications (used by other controllers)
exports.createNotification = async (userId, type, title, message, link = null, metadata = {}) => {
    try {
        const notification = await Notification.create({
            user_id: userId,
            type,
            title,
            message,
            link,
            metadata
        });
        return notification;
    } catch (err) {
        console.error('Failed to create notification:', err);
        return null;
    }
};

// Helper to notify all users with specific roles
exports.notifyUsersByRole = async (roles, type, title, message, link = null, metadata = {}) => {
    try {
        const users = await User.find({ role: { $in: roles }, is_active: true });
        
        const notifications = users.map(user => ({
            user_id: user._id,
            type,
            title,
            message,
            link,
            metadata
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }
        
        return notifications.length;
    } catch (err) {
        console.error('Failed to notify users by role:', err);
        return 0;
    }
};
