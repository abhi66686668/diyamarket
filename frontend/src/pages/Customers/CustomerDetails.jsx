import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    MdArrowBack, MdPhone, MdAccountBalanceWallet, 
    MdDateRange, MdPayment, MdAdd, MdDelete
} from 'react-icons/md';
import { toast } from 'react-toastify';

const CustomerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customerData, setCustomerData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null);
    const [paymentForm, setPaymentForm] = useState({
        amountPaid: '',
        paymentMethod: 'Cash',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    useEffect(() => {
        fetchCustomerDetails();
    }, [id]);

    const fetchCustomerDetails = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const { data } = await axios.get(`http://localhost:5000/api/customers/${id}`, config);
            console.log("Customer Details Data:", data);
            setCustomerData(data);
        } catch (error) {
            toast.error('Failed to fetch customer details');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPayment = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.post('http://localhost:5000/api/payments', {
                customerId: id,
                contractId: selectedContract._id,
                ...paymentForm
            }, config);
            
            toast.success('Payment added successfully');
            setShowPaymentModal(false);
            setPaymentForm({
                amountPaid: '', paymentMethod: 'Cash', paymentDate: new Date().toISOString().split('T')[0], notes: ''
            });
            fetchCustomerDetails(); // Refresh data
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add payment');
        }
    };

    const handleDeletePayment = async (paymentId) => {
        if(window.confirm('Are you sure you want to delete this payment? Contract balance will be reverted.')) {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                await axios.delete(`http://localhost:5000/api/payments/${paymentId}`, config);
                toast.success('Payment deleted');
                fetchCustomerDetails();
            } catch (error) {
                toast.error('Failed to delete payment');
            }
        }
    }

    if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!customerData || !customerData.customer) return <div>Customer not found</div>;

    const { customer, contracts = [], payments = [] } = customerData;
    const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active': return <span className="px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">Active</span>;
            case 'Completed': return <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">Completed</span>;
            case 'Overdue': return <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800 border border-red-300">Overdue</span>;
            default: return null;
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/customers" className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-gray-600">
                        <MdArrowBack className="text-xl" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">Customer Profile</h1>
                </div>
                <div className="flex gap-3">
                    <Link to={`/customers/edit/${customer._id}`} className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        Edit Profile
                    </Link>
                    <Link 
                        to={`/customers/${customer._id}/contracts/new`}
                        className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors flex items-center shadow-md shadow-primary/30"
                    >
                        <MdAdd className="mr-1 text-lg" /> Add New Contract
                    </Link>
                </div>
            </div>

            <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    {customer.photo ? (
                        <img src={customer.photo} alt={customer.fullName} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl border-4 border-white shadow-sm">
                            {customer.fullName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-bold text-gray-800">{customer.fullName}</h2>
                        <div className="mt-2 flex items-center justify-center md:justify-start text-gray-600 text-lg">
                            <MdPhone className="text-primary mr-2" />
                            <span>{customer.mobileNumber}</span>
                        </div>
                    </div>
                </div>
                
                {/* Customer Global Financial Summary */}
                <div className="flex gap-4 md:gap-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Total Amount</p>
                        <p className="text-xl font-bold text-gray-800">{formatCurrency(contracts.reduce((sum, c) => sum + c.totalProductAmount, 0))}</p>
                    </div>
                    <div className="w-px bg-gray-200"></div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Total Repayment</p>
                        <p className="text-xl font-bold text-primary">{formatCurrency(contracts.reduce((sum, c) => sum + c.totalRepaymentAmount, 0))}</p>
                    </div>
                    <div className="w-px bg-gray-200"></div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Total Balance</p>
                        <p className="text-xl font-bold text-red-600">{formatCurrency(contracts.reduce((sum, c) => sum + c.remainingBalance, 0))}</p>
                    </div>
                </div>
            </div>

            {/* Contracts List */}
            <div className="space-y-8">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Contracts ({contracts.length})</h3>
                {contracts.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500">No contracts found for this customer.</p>
                    </div>
                ) : (
                    contracts.map((contract, idx) => {
                        const progressPercentage = ((contract.totalRepaymentAmount - contract.remainingBalance) / contract.totalRepaymentAmount) * 100;
                        const contractPayments = payments.filter(p => p.contract && p.contract._id === contract._id);
                        
                        return (
                            <div key={contract._id} className="glass-card p-6 border-t-4 border-t-primary">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 overflow-hidden shrink-0">
                                            {contract.productPhoto ? (
                                                <img src={contract.productPhoto} alt={contract.productName} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-bold text-xl text-gray-400">#{contracts.length - idx}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800">{contract.productName}</h3>
                                            <p className="text-sm text-gray-500">{contract.productCategory}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {getStatusBadge(contract.paymentStatus)}
                                        <button 
                                            onClick={() => {
                                                setSelectedContract(contract);
                                                setShowPaymentModal(true);
                                            }}
                                            disabled={contract.paymentStatus === 'Completed'}
                                            className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center text-sm shadow-sm ${
                                                contract.paymentStatus === 'Completed' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                                            }`}
                                        >
                                            <MdAdd className="mr-1" /> Add Payment
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left: Finance Details & Progress */}
                                    <div>
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                                                <p className="font-semibold text-gray-800">{formatCurrency(contract.totalProductAmount)}</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                <p className="text-xs text-gray-500 mb-1">Advance</p>
                                                <p className="font-semibold text-gray-800">{formatCurrency(contract.advanceAmount)}</p>
                                            </div>
                                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                                <p className="text-xs text-orange-600 mb-1">Interest ({contract.interestRate}%)</p>
                                                <p className="font-semibold text-orange-700">+{formatCurrency(contract.interestAmount)}</p>
                                            </div>
                                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                                                <p className="text-xs text-primary font-medium mb-1">Total Repayment</p>
                                                <p className="font-bold text-primary text-lg">{formatCurrency(contract.totalRepaymentAmount)}</p>
                                            </div>
                                        </div>

                                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                            <div className="flex justify-between items-end mb-2">
                                                <div>
                                                    <p className="text-sm text-gray-500">Remaining Balance</p>
                                                    <p className="text-2xl font-bold text-gray-800">{formatCurrency(contract.remainingBalance)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">{contract.paymentFrequency} EMI</p>
                                                    <p className="text-lg font-bold text-green-600">{formatCurrency(contract.monthlyInstallment)}</p>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div className="bg-green-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
                                            </div>
                                            <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium">
                                                <span>{progressPercentage.toFixed(0)}% Paid</span>
                                                <span>Next Due: <span className="text-red-500">{new Date(contract.dueDate).toLocaleDateString()}</span></span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Right: Payment History for this contract */}
                                    <div>
                                        <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                                            <MdPayment className="text-secondary mr-2" /> Payment History
                                        </h4>
                                        {contractPayments.length === 0 ? (
                                            <p className="text-gray-500 text-sm">No payments recorded yet.</p>
                                        ) : (
                                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                                {contractPayments.map(payment => (
                                                    <div key={payment._id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-bold text-green-600">{formatCurrency(payment.amountPaid)}</span>
                                                                <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-600 font-medium">{payment.paymentMethod}</span>
                                                            </div>
                                                            <div className="text-xs text-gray-500 flex items-center">
                                                                <MdDateRange className="mr-1" />
                                                                {new Date(payment.paymentDate).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleDeletePayment(payment._id)}
                                                            className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                                            title="Delete Payment"
                                                        >
                                                            <MdDelete className="text-lg" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Add Payment Modal */}
            {showPaymentModal && selectedContract && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800">Payment for {selectedContract.productName}</h3>
                            <button onClick={() => setShowPaymentModal(false)} className="text-gray-500 hover:text-gray-800 font-bold text-xl">&times;</button>
                        </div>
                        <form onSubmit={handleAddPayment} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (₹) *</label>
                                <input 
                                    type="number" required 
                                    max={selectedContract.remainingBalance}
                                    value={paymentForm.amountPaid}
                                    onChange={(e) => setPaymentForm({...paymentForm, amountPaid: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:outline-none" 
                                />
                                <p className="text-xs text-gray-500 mt-1">Suggested EMI: {formatCurrency(selectedContract.monthlyInstallment)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                                <select 
                                    required 
                                    value={paymentForm.paymentMethod}
                                    onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
                                <input 
                                    type="date" required 
                                    value={paymentForm.paymentDate}
                                    onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                                <textarea 
                                    rows="2"
                                    value={paymentForm.notes}
                                    onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                ></textarea>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30">Save Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDetails;
