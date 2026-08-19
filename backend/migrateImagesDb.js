require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Contract = require('./models/Contract');

async function migrateImages() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const processModel = async (Model, fieldName, nameField) => {
            const docs = await Model.find({ [fieldName]: { $regex: 'localhost:5000' } });
            console.log(`Found ${docs.length} ${Model.modelName}s to migrate.`);
            
            for (const doc of docs) {
                const url = doc[fieldName];
                const filename = url.split('/').pop();
                const newUrl = `/uploads/${filename}`;
                
                console.log(`Migrating ${doc[nameField]}...`);
                doc[fieldName] = newUrl;
                await doc.save();
                console.log(`  -> Migrated to ${newUrl}`);
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
