const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.use(verifyToken);

// Get all logs (Admin only)
router.get('/', verifyRole(['ADMIN']), activityController.getAllLogs);

// Get recent activity (for dashboard)
router.get('/recent', verifyRole(['ADMIN', 'MANAGER']), activityController.getRecentActivity);

// Get user-specific logs
router.get('/user/:id', verifyRole(['ADMIN']), activityController.getUserLogs);

// Clear old logs
router.delete('/clear', verifyRole(['ADMIN']), activityController.clearOldLogs);

module.exports = router;
