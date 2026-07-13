const express = require('express');
const router = express.Router();
const { getPayments, addPayment, deletePayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getPayments)
    .post(addPayment);

router.route('/:id')
    .delete(deletePayment);

module.exports = router;
