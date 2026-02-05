// Seed script to create default admin user
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const CompanySettings = require('./models/CompanySettings');

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ username: 'admin' });
        
        if (existingAdmin) {
            console.log('Admin user already exists!');
        } else {
            // Create admin user
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);

            await User.create({
                username: 'admin',
                email: 'admin@nuvoora.com',
                password_hash: hashedPassword,
                role: 'ADMIN',
                is_active: true,
                full_name: 'System Administrator'
            });
            console.log('✅ Admin user created successfully!');
        }

        // Check/Create Manager
        const existingManager = await User.findOne({ username: 'manager' });
        if (!existingManager) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('manager123', salt);
            await User.create({
                username: 'manager',
                email: 'manager@nuvoora.com',
                password_hash: hashedPassword,
                role: 'MANAGER',
                is_active: true,
                full_name: 'Demo Manager'
            });
            console.log('✅ Manager user created successfully!');
        }

        // Check/Create Creator
        const existingCreator = await User.findOne({ username: 'creator' });
        if (!existingCreator) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('creator123', salt);
            await User.create({
                username: 'creator',
                email: 'creator@nuvoora.com',
                password_hash: hashedPassword,
                role: 'CREATOR',
                is_active: true,
                full_name: 'Demo Creator'
            });
            console.log('✅ Creator user created successfully!');
        }

        // Create default company settings if not exists
        const existingSettings = await CompanySettings.findOne();
        if (!existingSettings) {
            await CompanySettings.create({
                company_name: 'MediaPortal',
                logo_url: null
            });
            console.log('✅ Default company settings created!');
        } else {
            console.log('Company settings already exist!');
        }

        console.log('\n🎉 Database seeding complete!');
        process.exit(0);

    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedDatabase();
