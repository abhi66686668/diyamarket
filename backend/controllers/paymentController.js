const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const Contract = require('../models/Contract');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('customer', 'fullName mobileNumber')
            .populate('contract', 'productName remainingBalance paymentStatus')
            .sort({ paymentDate: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a payment
// @route   POST /api/payments
// @access  Private
const addPayment = async (req, res) => {
    try {
        const { customerId, contractId, paymentDate, amountPaid, paymentMethod, notes } = req.body;

        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        let remainingPaymentAmount = Number(amountPaid);

        if (contractId === 'auto') {
            const activeContracts = await Contract.find({ 
                customer: customerId, 
                paymentStatus: { $ne: 'Completed' } 
            }).sort({ createdAt: 1 });

            if (activeContracts.length === 0) {
                return res.status(400).json({ message: 'No active contracts found for this customer to pay off.' });
            }

            const savedPayments = [];

            for (let contract of activeContracts) {
                if (remainingPaymentAmount <= 0) break;

                const paymentForThisContract = Math.min(contract.remainingBalance, remainingPaymentAmount);
                
                const payment = new Payment({
                    customer: customerId,
                    contract: contract._id,
                    paymentDate,
                    amountPaid: paymentForThisContract,
                    paymentMethod,
                    notes: notes ? notes + ' (Auto-distributed)' : 'Auto-distributed payment'
                });

                const savedPayment = await payment.save();
                savedPayments.push(savedPayment);

                // Update contract balance and status
                contract.remainingBalance -= paymentForThisContract;
                
                // Update Due Date (+1 period if not completed)
                if (contract.remainingBalance <= 0) {
                    contract.remainingBalance = 0;
                    contract.paymentStatus = 'Completed';
                } else {
                     const currentDue = new Date(contract.dueDate);
                     if (contract.paymentFrequency === 'Daily') {
                         contract.dueDate = new Date(currentDue.setDate(currentDue.getDate() + 1));
                     } else if (contract.paymentFrequency === 'Weekly') {
                         contract.dueDate = new Date(currentDue.setDate(currentDue.getDate() + 7));
                     } else {
                         contract.dueDate = new Date(currentDue.setMonth(currentDue.getMonth() + 1));
                     }
                }

                await contract.save();
                remainingPaymentAmount -= paymentForThisContract;
            }

            return res.status(201).json({ message: 'Payment auto-distributed successfully', payments: savedPayments });
        }

        // --- Original Single Contract Logic ---
        const contract = await Contract.findById(contractId);
        if (!contract) {
            return res.status(404).json({ message: 'Contract not found' });
        }

        const payment = new Payment({
            customer: customerId,
            contract: contractId,
            paymentDate,
            amountPaid,
            paymentMethod,
            notes
        });

        const savedPayment = await payment.save();

        // Update contract balance and status
        contract.remainingBalance -= Number(amountPaid);
        
        // Update Due Date (+1 month if not completed)
        if (contract.remainingBalance <= 0) {
            contract.remainingBalance = 0;
            contract.paymentStatus = 'Completed';
        } else {
             const currentDue = new Date(contract.dueDate);
             if (contract.paymentFrequency === 'Daily') {
                 contract.dueDate = new Date(currentDue.setDate(currentDue.getDate() + 1));
             } else if (contract.paymentFrequency === 'Weekly') {
                 contract.dueDate = new Date(currentDue.setDate(currentDue.getDate() + 7));
             } else {
                 contract.dueDate = new Date(currentDue.setMonth(currentDue.getMonth() + 1));
             }
        }

        await contract.save();

        res.status(201).json(savedPayment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a payment
// @route   DELETE /api/payments/:id
// @access  Private
const deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (payment) {
            const contract = await Contract.findById(payment.contract);
            if(contract) {
                // Revert contract balance
                contract.remainingBalance += payment.amountPaid;
                if(contract.paymentStatus === 'Completed') {
                    contract.paymentStatus = 'Active'; // Simple rollback
                }
                // Rollback due date by 1 month
                const currentDue = new Date(contract.dueDate);
                if (contract.paymentFrequency === 'Daily') {
                    contract.dueDate = new Date(currentDue.setDate(currentDue.getDate() - 1));
                } else if (contract.paymentFrequency === 'Weekly') {
                    contract.dueDate = new Date(currentDue.setDate(currentDue.getDate() - 7));
                } else {
                    contract.dueDate = new Date(currentDue.setMonth(currentDue.getMonth() - 1));
                }

                await contract.save();
            }

            await payment.deleteOne();
            res.json({ message: 'Payment removed' });
        } else {
            res.status(404).json({ message: 'Payment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPayments,
    addPayment,
    deletePayment
};
