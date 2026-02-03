const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public or Protected? User didn't specify, but assume protected
router.use(verifyToken);

router.post('/', upload.single('media'), postController.createPost);
router.get('/', postController.getPosts);

// Manager only routes
router.put('/:id/status', verifyRole(['MANAGER', 'ADMIN']), postController.updatePostStatus);
router.delete('/:id', verifyRole(['MANAGER', 'ADMIN', 'CREATOR']), postController.deletePost); // Creator checked in controller

// Admin Stats
router.get('/stats', verifyRole(['ADMIN', 'MANAGER']), postController.getSystemStats);
// Publish to Socials (FB)
router.post('/:id/publish', verifyToken, postController.publishToSocials);

// Stats & Activity
router.get('/activity', verifyRole(['ADMIN', 'MANAGER']), postController.getDashboardActivity);
router.get('/storage', verifyRole(['ADMIN', 'MANAGER']), postController.getStorageStats);

// User Stats
router.get('/user-stats', verifyToken, postController.getUserStats);
router.get('/user-stats/:id', verifyToken, postController.getUserStatsById);

// Single Post Operations
router.get('/:id', verifyToken, postController.getPostById);
router.put('/:id', verifyToken, upload.single('media'), postController.updatePost);
router.put('/:id/resubmit', verifyToken, postController.resubmitPost);

module.exports = router;
