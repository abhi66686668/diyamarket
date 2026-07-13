const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    // Personal Details
    photo: {
        type: String, // Cloudinary URL
        default: null
    },
    fullName: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: String,
        required: true
    },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
