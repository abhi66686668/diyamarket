const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding...');

        const adminExists = await Admin.countDocuments();
        if (adminExists > 0) {
            console.log('Admin user already exists.');
            process.exit(0);
        }

        const admin = await Admin.create({
            username: 'admin',
            password: 'adminpassword123'
        });

        console.log(`Admin created successfully!`);
        console.log(`Username: ${admin.username}`);
        console.log(`Password: adminpassword123`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
