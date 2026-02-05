const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(verifyToken);

router.get('/', settingsController.getSettings);
router.put('/', verifyRole(['ADMIN']), upload.single('logo'), settingsController.updateSettings);

module.exports = router;
