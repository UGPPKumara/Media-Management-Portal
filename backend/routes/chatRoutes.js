const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// Get all conversations
router.get('/conversations', chatController.getConversations);

// Get unread count
router.get('/unread', chatController.getUnreadCount);

// Start new conversation
router.post('/start', chatController.startConversation);

// Get messages in a conversation
router.get('/conversations/:id/messages', chatController.getMessages);

// Send message to conversation
router.post('/conversations/:id/messages', chatController.sendMessage);

// Close conversation (Manager/Admin only)
router.put('/conversations/:id/close', chatController.closeConversation);

// Delete conversation
router.delete('/conversations/:id', chatController.deleteConversation);

module.exports = router;
