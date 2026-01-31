const express = require('express');
const router = express.Router();
const cleanupController = require('../controllers/cleanupController');

// This route should be secured or only accessible via localhost/cron key
// For simplicity, we assume the cPanel cron can hit it. 
// Adding a simple query param security check is good practice.

const checkCronKey = (req, res, next) => {
    const key = req.query.key;
    // In production, use env var. 
    // IF process.env.CRON_KEY is set, check it.
    if (process.env.CRON_KEY && key !== process.env.CRON_KEY) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    next();
};

router.get('/cleanup', checkCronKey, cleanupController.runCleanup);

module.exports = router;
