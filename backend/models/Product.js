const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    stock: {
        type: Number,
        default: 0
    },
    photo: {
        type: String, // Cloudinary URL
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
