const Customer = require('../models/Customer');
const Contract = require('../models/Contract');
const Payment = require('../models/Payment');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res) => {
    try {
        const { search, status } = req.query;
        let customerQuery = {};

        if (search) {
            customerQuery.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { mobileNumber: { $regex: search, $options: 'i' } }
            ];
        }

        // We fetch customers
        const customers = await Customer.find(customerQuery).sort({ createdAt: -1 });

        // For each customer, fetch their contracts
        const customersWithContracts = await Promise.all(customers.map(async (customer) => {
            let contractQuery = { customer: customer._id };
            if (status) {
                contractQuery.paymentStatus = status;
            }
            const contracts = await Contract.find(contractQuery).sort({ createdAt: -1 });
            
            // If filtering by status, and this customer has NO contracts matching the status, we might want to omit them
            if (status && contracts.length === 0) {
                return null; 
            }

            return {
                ...customer.toObject(),
                contracts
            };
        }));

        // Filter out nulls
        const filtered = customersWithContracts.filter(c => c !== null);

        res.json(filtered);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (customer) {
            const contracts = await Contract.find({ customer: customer._id }).sort({ createdAt: -1 });
            // Fetch payments for all contracts belonging to this customer
            const payments = await Payment.find({ customer: customer._id }).sort({ paymentDate: -1 }).populate('contract', 'productName');
            res.json({ customer, contracts, payments });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
const createCustomer = async (req, res) => {
    try {
        const {
            fullName, mobileNumber, photo,
            // Contract details
            productName, productCategory, productSerialNumber, productPhoto,
            totalProductAmount, advanceAmount, interestRate,
            financeStartDate, numberOfInstallments, paymentFrequency
        } = req.body;

        // 1. Create or Find Customer
        let customer = await Customer.findOne({ mobileNumber });
        if (!customer) {
            customer = new Customer({ fullName, mobileNumber, photo });
            await customer.save();
        }

        // 2. Auto Calculations for Contract
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

        // 3. Create Contract
        const contract = new Contract({
            customer: customer._id,
            productName, productCategory, productSerialNumber, productPhoto,
            totalProductAmount, advanceAmount, financedAmount, interestRate,
            interestAmount, totalRepaymentAmount, paymentFrequency, financeStartDate, numberOfInstallments,
            monthlyInstallment, dueDate, remainingBalance,
            paymentStatus: 'Active'
        });

        await contract.save();
        
        const io = req.app.get('io');
        if (io) io.emit('customer_changed', { action: 'create', customer, contract });

        res.status(201).json({ customer, contract });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (customer) {
            Object.assign(customer, req.body); // Will only update fullName, mobile, photo
            const updatedCustomer = await customer.save();
            
            const io = req.app.get('io');
            if (io) io.emit('customer_changed', { action: 'update', customer: updatedCustomer });

            res.json(updatedCustomer);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private
const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (customer) {
            await Contract.deleteMany({ customer: customer._id });
            await Payment.deleteMany({ customer: customer._id });
            await customer.deleteOne();
            
            const io = req.app.get('io');
            if (io) io.emit('customer_changed', { action: 'delete', id: req.params.id });

            res.json({ message: 'Customer, Contracts, and Payments removed' });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload image (generic endpoint for both customer photo and product photo)
// @route   POST /api/customers/upload
// @access  Private
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }
        const imageUrl = req.file.path;
        res.json({ imageUrl: imageUrl });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    getCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    uploadImage
};
