const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    contract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract',
        required: true
    },
    paymentDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    amountPaid: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'UPI', 'Bank Transfer'],
        required: true
    },
    notes: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
