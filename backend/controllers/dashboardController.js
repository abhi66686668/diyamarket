const Customer = require('../models/Customer');
const Contract = require('../models/Contract');
const Payment = require('../models/Payment');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const totalCustomersCount = await Customer.countDocuments();
        
        const activeAccountsCount = await Contract.countDocuments({ paymentStatus: 'Active' });
        const completedAccountsCount = await Contract.countDocuments({ paymentStatus: 'Completed' });
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdueAccountsCount = await Contract.countDocuments({ 
            paymentStatus: { $ne: 'Completed' },
            dueDate: { $lt: today }
        });

        // Aggregations from Contracts
        const contracts = await Contract.find();
        
        let totalOutstandingBalance = 0;
        let totalExpectedCollection = 0; // sum of total repayment amounts
        let totalProfit = 0; // sum of interest amounts
        let thisMonthProfit = 0; // sum of interest for this month
        
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        contracts.forEach(c => {
            totalOutstandingBalance += (c.remainingBalance || 0);
            totalExpectedCollection += (c.totalRepaymentAmount || 0);
        });
        
        totalProfit = totalExpectedCollection * 0.30;

        const totalAmountCollected = totalExpectedCollection - totalOutstandingBalance;

        // Current Month Collections
        
        const monthlyPayments = await Payment.aggregate([
            {
                $match: {
                    paymentDate: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amountPaid' }
                }
            }
        ]);
        const monthlyCollection = monthlyPayments.length > 0 ? monthlyPayments[0].total : 0;
        const monthlyProfit = monthlyCollection * 0.30;

        res.json({
            totalCustomers: totalCustomersCount,
            activeAccounts: activeAccountsCount,
            completedAccounts: completedAccountsCount,
            overdueAccounts: overdueAccountsCount,
            totalOutstandingBalance,
            totalAmountCollected,
            totalAmount: totalExpectedCollection,
            totalProfit,
            monthlyCollection,
            monthlyProfit
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard charts data
// @route   GET /api/dashboard/charts
// @access  Private
const getDashboardCharts = async (req, res) => {
    try {
        // Last 6 months collection trend
        const today = new Date();
        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

        const paymentsTrend = await Payment.aggregate([
            {
                $match: {
                    paymentDate: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: { 
                        year: { $year: '$paymentDate' }, 
                        month: { $month: '$paymentDate' } 
                    },
                    total: { $sum: '$amountPaid' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const formattedTrend = paymentsTrend.map(p => {
            const date = new Date(p._id.year, p._id.month - 1, 1);
            const monthName = date.toLocaleString('default', { month: 'short' });
            return {
                name: `${monthName} ${p._id.year.toString().slice(2)}`,
                collection: p.total
            };
        });

        res.json({
            monthlyTrend: formattedTrend
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get upcoming dues and recent payments for dashboard
// @route   GET /api/dashboard/alerts
// @access  Private
const getDashboardAlerts = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        // Upcoming due in next 7 days (now querying Contracts)
        const upcomingDues = await Contract.find({
            paymentStatus: { $ne: 'Completed' },
            dueDate: { $gte: today, $lte: nextWeek }
        }).populate('customer', 'fullName mobileNumber').sort({ dueDate: 1 }).limit(10);

        // Overdue contracts
        const overdueDues = await Contract.find({
            paymentStatus: { $ne: 'Completed' },
            dueDate: { $lt: today }
        }).populate('customer', 'fullName mobileNumber').sort({ dueDate: 1 }).limit(10);

        // Recent 5 payments
        const recentPayments = await Payment.find()
            .populate('customer', 'fullName')
            .sort({ paymentDate: -1 })
            .limit(5);

        res.json({ upcomingDues, overdueDues, recentPayments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getDashboardCharts,
    getDashboardAlerts
};
