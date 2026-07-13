const express = require('express');
const router = express.Router();
const {
    getCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    uploadImage
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// All routes are protected
router.use(protect);

router.route('/')
    .get(getCustomers)
    .post(createCustomer);

router.post('/upload', upload.single('image'), uploadImage);

router.route('/:id')
    .get(getCustomerById)
    .put(updateCustomer)
    .delete(deleteCustomer);

module.exports = router;
