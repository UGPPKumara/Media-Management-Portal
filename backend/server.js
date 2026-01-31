require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded media)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test Route
app.get('/', (req, res) => {
    res.send('Media Management Portal API Running');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const cleanupRoutes = require('./routes/cleanupRoutes');
const profileRoutes = require('./routes/profileRoutes');
// const initCronJobs = require('./services/cronService');

// Use Routes
try {
    const initCronJobs = require('./services/cronService');
    initCronJobs();
} catch (error) {
    console.warn('Cron jobs could not be initialized (node-cron missing?):', error.message);
}
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/cleanup', cleanupRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/settings', require('./routes/settingsRoutes'));

// Static Uploads
app.use('/uploads', express.static('uploads'));

// Start Server
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await db.query('SELECT 1');
        console.log('Database connected successfully');
    } catch (err) {
        console.error('Database connection failed:', err);
    }
});
