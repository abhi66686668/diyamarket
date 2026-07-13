const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for migration...");

        const db = mongoose.connection.db;
        const customersCol = db.collection('customers');
        const contractsCol = db.collection('contracts');
        const paymentsCol = db.collection('payments');

        const allCustomers = await customersCol.find({}).toArray();
        console.log(`Found ${allCustomers.length} customer records to process.`);

        const groupedCustomers = {}; // Group by mobile number

        for (const record of allCustomers) {
            // Skip if this record doesn't have product details (already migrated)
            if (!record.productName) continue;

            const mobile = record.mobileNumber;
            if (!groupedCustomers[mobile]) {
                groupedCustomers[mobile] = {
                    primaryCustomer: record, // The first one we find becomes the main customer
                    contractsToCreate: []
                };
            }

            // Create a contract for this record
            const contract = {
                _id: new mongoose.Types.ObjectId(),
                customer: groupedCustomers[mobile].primaryCustomer._id, // Will link to the primary customer
                productName: record.productName,
                productCategory: record.productCategory,
                productPhoto: record.productPhoto,
                productSerialNumber: record.productSerialNumber,
                totalProductAmount: record.totalProductAmount,
                advanceAmount: record.advanceAmount,
                financedAmount: record.financedAmount,
                interestRate: record.interestRate,
                interestAmount: record.interestAmount,
                totalRepaymentAmount: record.totalRepaymentAmount,
                paymentFrequency: record.paymentFrequency,
                financeStartDate: record.financeStartDate,
                numberOfInstallments: record.numberOfInstallments,
                monthlyInstallment: record.monthlyInstallment,
                dueDate: record.dueDate,
                remainingBalance: record.remainingBalance,
                paymentStatus: record.paymentStatus,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
                __v: record.__v
            };

            groupedCustomers[mobile].contractsToCreate.push({
                contract: contract,
                originalCustomerId: record._id // Keep track to update payments
            });
        }

        console.log(`Grouped into ${Object.keys(groupedCustomers).length} unique customers.`);

        for (const mobile in groupedCustomers) {
            const group = groupedCustomers[mobile];
            const mainCustomerId = group.primaryCustomer._id;

            // 1. Clean up the primary customer document in the DB
            await customersCol.updateOne(
                { _id: mainCustomerId },
                {
                    $unset: {
                        productName: "",
                        productCategory: "",
                        productPhoto: "",
                        productSerialNumber: "",
                        totalProductAmount: "",
                        advanceAmount: "",
                        financedAmount: "",
                        interestRate: "",
                        interestAmount: "",
                        totalRepaymentAmount: "",
                        paymentFrequency: "",
                        financeStartDate: "",
                        numberOfInstallments: "",
                        monthlyInstallment: "",
                        dueDate: "",
                        remainingBalance: "",
                        paymentStatus: ""
                    }
                }
            );

            for (const item of group.contractsToCreate) {
                // 2. Insert the contract
                await contractsCol.insertOne(item.contract);

                // 3. Update all payments that pointed to the original customer ID
                // Now they must point to mainCustomerId AND the new contract._id
                await paymentsCol.updateMany(
                    { customer: item.originalCustomerId },
                    { 
                        $set: { 
                            customer: mainCustomerId, 
                            contract: item.contract._id 
                        } 
                    }
                );

                // 4. If this item's originalCustomerId is different from mainCustomerId, delete the duplicate customer
                if (item.originalCustomerId.toString() !== mainCustomerId.toString()) {
                    await customersCol.deleteOne({ _id: item.originalCustomerId });
                }
            }
        }

        console.log("Migration completed successfully!");
        process.exit(0);

    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrate();
