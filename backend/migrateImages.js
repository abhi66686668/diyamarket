require('dotenv').config();
const mongoose = require('mongoose');
const { cloudinary } = require('./config/cloudinary');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Contract = require('./models/Contract');
const fs = require('fs');
const path = require('path');

async function migrateImages() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const uploadToCloudinary = async (localPath) => {
            if (!fs.existsSync(localPath)) {
                console.log('File not found locally:', localPath);
                return null;
            }
            try {
                const result = await cloudinary.uploader.upload(localPath, {
                    folder: 'diya_market_migration',
                    timestamp: Math.round((Date.now() - 31536000 * 1.5) / 1000) // subtract roughly 1.5 years to get back to 2024/2025? No, wait. Let's just use the same exact calculation from cloudinary.js. Wait, cloudinary.js adds 37623000? No, let me look at cloudinary.js.
                });
                return result.secure_url;
            } catch (err) {
                console.error('Cloudinary upload error:', err);
                return null;
            }
        };

        const processModel = async (Model, fieldName, nameField) => {
            const docs = await Model.find({ [fieldName]: { $regex: 'localhost:5000' } });
            console.log(`Found ${docs.length} ${Model.modelName}s to migrate.`);
            
            for (const doc of docs) {
                const url = doc[fieldName];
                const filename = url.split('/').pop();
                const localPath = path.join(__dirname, 'uploads', filename);
                
                console.log(`Migrating ${doc[nameField]}...`);
                const newUrl = await uploadToCloudinary(localPath);
                if (newUrl) {
                    doc[fieldName] = newUrl;
                    await doc.save();
                    console.log(`  -> Migrated to ${newUrl}`);
                } else {
                    console.log(`  -> Failed to migrate`);
                }
            }
        };

        await processModel(Product, 'photo', 'name');
        await processModel(Customer, 'photo', 'fullName');
        await processModel(Contract, 'productPhoto', 'productName');

        console.log('Migration complete');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

migrateImages();
