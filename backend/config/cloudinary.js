const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folderName = 'diya_market_customers';
        if (req.originalUrl && req.originalUrl.includes('/api/upload') && !req.originalUrl.includes('/customers')) {
            folderName = 'diya_market_products';
        }

        return {
            folder: folderName,
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            timestamp: Math.round((Date.now() + 37623000) / 1000)
        };
    }
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
