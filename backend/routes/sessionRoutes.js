const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.use(verifyToken);

// Get user sessions
router.get('/user/:id', sessionController.getUserSessions);

// Terminate a specific session
router.delete('/:sessionId', sessionController.terminateSession);

// Terminate all sessions for a user
router.delete('/user/:id/all', sessionController.terminateAllSessions);

module.exports = router;
