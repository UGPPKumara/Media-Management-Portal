const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(verifyToken);

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.post('/password', profileController.changePassword);
router.post('/picture', upload.single('profile_picture'), profileController.uploadProfilePicture);

module.exports = router;
