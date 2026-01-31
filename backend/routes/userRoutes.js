const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.get('/', verifyRole(['ADMIN', 'MANAGER']), userController.getAllUsers);
router.post('/', verifyRole(['ADMIN']), userController.createUser);
router.put('/:id/role', verifyRole(['ADMIN']), userController.updateUserRole);
router.delete('/:id', verifyRole(['ADMIN']), userController.deleteUser);
router.put('/:id/status', verifyRole(['ADMIN']), userController.toggleUserStatus);

// Self-management routes (Controller handles ownership checks)
router.put('/:id', userController.updateUser);
router.get('/:id', userController.getUserById);
router.get('/:id/posts', userController.getUserPosts);

module.exports = router;
