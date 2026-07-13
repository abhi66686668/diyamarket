const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const Customer = require('../models/Customer');
const Contract = require('../models/Contract');
const Payment = require('../models/Payment');

const backupDatabase = async () => {
    try {
        console.log('Starting automated database and photos backup...');
        
        // Fetch all data
        const customers = await Customer.find();
        const contracts = await Contract.find();
        const payments = await Payment.find();

        const backupData = {
            timestamp: new Date().toISOString(),
            data: {
                customers,
                contracts,
                payments
            }
        };

        // Create backups directory if it doesn't exist
        const backupsDir = path.join(__dirname, '..', 'backups');
        if (!fs.existsSync(backupsDir)) {
            fs.mkdirSync(backupsDir);
        }

        const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const backupFolder = path.join(backupsDir, `backup-${dateStr}`);
        
        if (!fs.existsSync(backupFolder)) {
            fs.mkdirSync(backupFolder);
        }

        // 1. Save Database JSON
        const jsonFilePath = path.join(backupFolder, 'database.json');
        fs.writeFileSync(jsonFilePath, JSON.stringify(backupData, null, 2));

        // 2. Backup Photos (Uploads folder)
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        if (fs.existsSync(uploadsDir)) {
            const backupUploadsDir = path.join(backupFolder, 'uploads');
            fs.cpSync(uploadsDir, backupUploadsDir, { recursive: true });
        }

        console.log(`Database and photos backup completed successfully. Saved to ${backupFolder}`);

    } catch (error) {
        console.error('Database backup failed:', error);
    }
};

const initAutomatedBackups = () => {
    // Schedule backup to run every day at midnight
    cron.schedule('0 0 * * *', () => {
        backupDatabase();
    });
    console.log('Automated daily backups initialized.');
};

module.exports = {
    backupDatabase,
    initAutomatedBackups
};
