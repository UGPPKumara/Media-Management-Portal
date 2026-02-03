const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.use(verifyToken);

// Admin routes
router.get('/', verifyRole(['ADMIN', 'MANAGER']), userController.getAllUsers);
router.post('/', verifyRole(['ADMIN']), userController.createUser);
router.put('/:id/role', verifyRole(['ADMIN']), userController.updateUserRole);
router.delete('/:id', verifyRole(['ADMIN']), userController.deleteUser);
router.put('/:id/status', verifyRole(['ADMIN']), userController.toggleUserStatus);
router.put('/:id/password', verifyRole(['ADMIN']), userController.resetUserPassword);

// Tags and Notes (Admin only)
router.put('/:id/tags', verifyRole(['ADMIN']), userController.updateUserTags);
router.put('/:id/notes', verifyRole(['ADMIN']), userController.updateUserNotes);

// User Analytics (Admin only)
router.get('/:id/analytics', verifyRole(['ADMIN']), userController.getUserAnalytics);

// Invite User via Email
router.post('/invite', verifyRole(['ADMIN']), authController.inviteUser);

// Self-management routes (Controller handles ownership checks)
router.put('/:id', userController.updateUser);
router.get('/:id', userController.getUserById);
router.get('/:id/posts', userController.getUserPosts);

module.exports = router;
