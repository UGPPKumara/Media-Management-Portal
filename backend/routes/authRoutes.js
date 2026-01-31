const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Basic Auth
router.post('/register', authController.register);
router.post('/login', authController.login);

// Password Recovery
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
