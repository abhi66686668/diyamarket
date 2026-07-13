const Contract = require('../models/Contract');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');

// @desc    Add a contract to an existing customer
// @route   POST /api/customers/:customerId/contracts
// @access  Private
const addContractToCustomer = async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const customer = await Customer.findById(customerId);
        
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const {
            productName, productCategory, productSerialNumber, productPhoto,
            totalProductAmount, advanceAmount, interestRate,
            financeStartDate, numberOfInstallments, paymentFrequency
        } = req.body;

        // Auto Calculations
        const financedAmount = Number(totalProductAmount) - Number(advanceAmount);
        const interestAmount = (financedAmount * Number(interestRate)) / 100;
        const totalRepaymentAmount = financedAmount + interestAmount;
        const months = Number(numberOfInstallments) || 0;
        const monthlyInstallment = months > 0 ? totalRepaymentAmount / months : 0;
        
        const startDate = new Date(financeStartDate);
        const dueDate = new Date(startDate);
        if (paymentFrequency === 'Daily') {
            dueDate.setDate(dueDate.getDate() + 1);
        } else if (paymentFrequency === 'Weekly') {
            dueDate.setDate(dueDate.getDate() + 7);
        } else {
            dueDate.setMonth(dueDate.getMonth() + 1);
        }
        const remainingBalance = totalRepaymentAmount;

        const contract = new Contract({
            customer: customer._id,
            productName, productCategory, productSerialNumber, productPhoto,
            totalProductAmount, advanceAmount, financedAmount, interestRate,
            interestAmount, totalRepaymentAmount, paymentFrequency, financeStartDate, numberOfInstallments,
            monthlyInstallment, dueDate, remainingBalance,
            paymentStatus: 'Active'
        });

        const savedContract = await contract.save();
        res.status(201).json(savedContract);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a contract
// @route   PUT /api/contracts/:id
// @access  Private
const updateContract = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id);

        if (contract) {
            // Note: If financial details are updated, we'd need to recalculate. 
            // For now, we assume simple updates or rely on frontend to send correct calculated values.
            Object.assign(contract, req.body);
            const updatedContract = await contract.save();
            res.json(updatedContract);
        } else {
            res.status(404).json({ message: 'Contract not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a contract
// @route   DELETE /api/contracts/:id
// @access  Private
const deleteContract = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id);

        if (contract) {
            // Delete payments associated with this specific contract
            await Payment.deleteMany({ contract: contract._id });
            await contract.deleteOne();
            res.json({ message: 'Contract and associated payments removed' });
        } else {
            res.status(404).json({ message: 'Contract not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addContractToCustomer,
    updateContract,
    deleteContract
};
