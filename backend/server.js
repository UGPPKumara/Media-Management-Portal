require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/database');

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

// Health Check Route
app.get('/api/health', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState === 1) {
            res.json({ 
                status: 'OK', 
                database: 'Connected',
                message: 'MongoDB is working!'
            });
        } else {
            res.status(500).json({ 
                status: 'ERROR', 
                database: 'Disconnected'
            });
        }
    } catch (error) {
        res.status(500).json({ 
            status: 'ERROR', 
            error: error.message 
        });
    }
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const cleanupRoutes = require('./routes/cleanupRoutes');
const profileRoutes = require('./routes/profileRoutes');

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

// Connect to MongoDB and Start Server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
});
