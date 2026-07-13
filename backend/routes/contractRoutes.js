const express = require('express');
const router = express.Router();
const { addContractToCustomer, updateContract, deleteContract } = require('../controllers/contractController');
const { protect } = require('../middleware/authMiddleware');

router.route('/customers/:customerId')
    .post(protect, addContractToCustomer);

router.route('/:id')
    .put(protect, updateContract)
    .delete(protect, deleteContract);

module.exports = router;
