const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    // Product Details
    productName: {
        type: String,
        required: true
    },
    productCategory: {
        type: String,
        required: true
    },
    productPhoto: {
        type: String, // Cloudinary URL
        default: null
    },
    productSerialNumber: {
        type: String
    },

    // Finance Details
    totalProductAmount: {
        type: Number,
        required: true
    },
    advanceAmount: {
        type: Number,
        required: true
    },
    financedAmount: {
        type: Number,
        required: true // Automatically Calculated
    },
    interestRate: {
        type: Number,
        required: true // % entered manually
    },
    interestAmount: {
        type: Number,
        required: true // Automatically Calculated
    },
    totalRepaymentAmount: {
        type: Number,
        required: true // Automatically Calculated
    },
    paymentFrequency: {
        type: String,
        enum: ['Daily', 'Weekly', 'Monthly'],
        default: 'Monthly'
    },
    financeStartDate: {
        type: Date,
        required: true
    },
    numberOfInstallments: {
        type: Number
    },
    monthlyInstallment: {
        type: Number
    },
    dueDate: { // Current or next due date
        type: Date,
        required: true
    },
    remainingBalance: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Active', 'Completed', 'Overdue'],
        default: 'Active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Contract', contractSchema);
