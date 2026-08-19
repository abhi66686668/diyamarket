require('dotenv').config();
const mongoose = require('mongoose');
const Contract = require('./models/Contract');

const migrateContracts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected successfully');

        const contracts = await Contract.find();
        let migratedCount = 0;

        for (let contract of contracts) {
            // Check if it's an old contract with a single productName
            if (contract._doc.productName && (!contract.products || contract.products.length === 0)) {
                contract.products = [{
                    productName: contract._doc.productName,
                    productCategory: contract._doc.productCategory || 'Other',
                    productPhoto: contract._doc.productPhoto || null,
                    productSerialNumber: contract._doc.productSerialNumber || ''
                }];

                // We can unset the old fields, but mongoose strict mode will ignore them going forward if they are removed from schema.
                // It's safer to unset them manually in the database to keep it clean.
                await Contract.updateOne(
                    { _id: contract._id },
                    { 
                        $set: { products: contract.products },
                        $unset: { 
                            productName: "", 
                            productCategory: "", 
                            productPhoto: "", 
                            productSerialNumber: "" 
                        }
                    }
                );
                migratedCount++;
            }
        }

        console.log(`Successfully migrated ${migratedCount} contracts to the new multiple products schema.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration error:', err);
        process.exit(1);
    }
};

migrateContracts();
