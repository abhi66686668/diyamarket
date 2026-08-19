const express = require('express');
const router = express.Router();
const { getPayments, addPayment, deletePayment, sendPaymentReceipt } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getPayments)
    .post(addPayment);

router.route('/:id')
    .delete(deletePayment);

router.route('/:id/send-receipt')
    .post(sendPaymentReceipt);

module.exports = router;
