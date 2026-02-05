const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all conversations for the current user
exports.getConversations = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        let query = {};

        if (req.user.role === 'CREATOR') {
            // Creators see only their own conversations
            query = { creator_id: userId };
        } else {
            // Managers and Admins see all conversations (or can filter)
            // They can see any conversation they're a participant in, or all if admin
            if (req.user.role === 'ADMIN') {
                // Admin sees all conversations
                query = {};
            } else {
                // Manager sees conversations where they're a participant or all support chats
                query = {};
            }
        }

        // Filter out conversations deleted by this user
        query.deleted_by = { $ne: userId };

        const conversations = await Conversation.find(query)
            .populate('participants', 'username profile_picture role')
            .populate('creator_id', 'username profile_picture role')
            .sort({ last_message_at: -1 });

        // Get unread count for each conversation
        const conversationsWithUnread = await Promise.all(
            conversations.map(async (conv) => {
                const unreadCount = await Message.countDocuments({
                    conversation_id: conv._id,
                    read_by: { $ne: userId }
                });
                return {
                    ...conv.toJSON(),
                    unread_count: unreadCount
                };
            })
        );

        res.json(conversationsWithUnread);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get messages in a conversation
exports.getMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Check access
        if (req.user.role === 'CREATOR') {
            if (conversation.creator_id.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        const messages = await Message.find({ conversation_id: id })
            .populate('sender_id', 'username profile_picture role')
            .sort({ created_at: 1 });

        // Mark messages as read
        await Message.updateMany(
            { conversation_id: id, read_by: { $ne: userId } },
            { $addToSet: { read_by: userId } }
        );

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = new mongoose.Types.ObjectId(req.user.id);

        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Check access
        if (req.user.role === 'CREATOR') {
            if (conversation.creator_id.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        // Create message
        const message = await Message.create({
            conversation_id: id,
            sender_id: userId,
            content: content.trim(),
            read_by: [userId]
        });

        // Update conversation last message and revive if deleted
        conversation.last_message = content.trim().substring(0, 100);
        conversation.last_message_at = new Date();
        conversation.deleted_by = []; // Un-hide for everyone
        
        // Add sender to participants if not already
        if (!conversation.participants.includes(userId)) {
            conversation.participants.push(userId);
        }
        
        await conversation.save();

        // Populate sender info
        await message.populate('sender_id', 'username profile_picture role');

        res.status(201).json(message);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Start a new conversation (for creators)
exports.startConversation = async (req, res) => {
    try {
        const { subject, message } = req.body;
        const userId = new mongoose.Types.ObjectId(req.user.id);

        if (!message || !message.trim()) {
            return res.status(400).json({ message: 'Message is required' });
        }

        // Create conversation
        const conversation = await Conversation.create({
            participants: [userId],
            creator_id: userId,
            subject: subject || 'Support Request',
            last_message: message.trim().substring(0, 100),
            last_message_at: new Date()
        });

        // Create first message
        await Message.create({
            conversation_id: conversation._id,
            sender_id: userId,
            content: message.trim(),
            read_by: [userId]
        });

        await conversation.populate('creator_id', 'username profile_picture role');

        res.status(201).json(conversation);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        let conversationIds = [];

        if (req.user.role === 'CREATOR') {
            const conversations = await Conversation.find({ creator_id: userId });
            conversationIds = conversations.map(c => c._id);
        } else {
            // Managers and Admins - count all unread
            const conversations = await Conversation.find({});
            conversationIds = conversations.map(c => c._id);
        }

        const unreadCount = await Message.countDocuments({
            conversation_id: { $in: conversationIds },
            sender_id: { $ne: userId },
            read_by: { $ne: userId }
        });

        res.json({ unread: unreadCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Close a conversation (Manager/Admin only)
exports.closeConversation = async (req, res) => {
    try {
        const { id } = req.params;

        if (!['MANAGER', 'ADMIN'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Only managers can close conversations' });
        }

        const conversation = await Conversation.findByIdAndUpdate(
            id,
            { status: 'CLOSED' },
            { new: true }
        );

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        res.json(conversation);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete conversation
exports.deleteConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Check access: Admin, Manager, or the Creator of the conversation
        const isAuthorized = 
            ['ADMIN', 'MANAGER'].includes(req.user.role) || 
            (req.user.role === 'CREATOR' && conversation.creator_id.toString() === req.user.id);

        if (!isAuthorized) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Soft delete: Hide conversation for this user
        await Conversation.findByIdAndUpdate(id, {
            $addToSet: { deleted_by: userId }
        });

        res.json({ message: 'Conversation deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
