const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        res.status(200).json({
            message: 'Image uploaded successfully',
            imageUrl: req.file.path // Cloudinary URL is returned in req.file.path
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error during image upload', error: error.message });
    }
});

module.exports = router;
