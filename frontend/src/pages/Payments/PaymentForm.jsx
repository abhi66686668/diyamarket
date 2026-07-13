import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { MdPayment, MdCheckCircle, MdSearch, MdClose } from 'react-icons/md';

const PaymentForm = () => {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [selectedContractId, setSelectedContractId] = useState('');
    const [customerContracts, setCustomerContracts] = useState([]);
    const [contractDetails, setContractDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Searchable dropdown state
    const [searchTerm, setSearchTerm] = useState('');

    const [paymentForm, setPaymentForm] = useState({
        amountPaid: '',
        paymentMethod: 'Cash',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    useEffect(() => {
        fetchActiveCustomers();
    }, []);

    const fetchActiveCustomers = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const { data } = await axios.get('http://localhost:5000/api/customers?status=Active', config);
            
            // data contains customers with their contracts array
            // Filter to ensure we only have customers who have at least one active contract
            const validCustomers = data.filter(c => c.contracts && c.contracts.length > 0);
            setCustomers(validCustomers);
        } catch (error) {
            toast.error('Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c => 
        c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.mobileNumber.includes(searchTerm)
    );

    const handleCustomerSelect = (customerId) => {
        setSelectedCustomerId(customerId);
        setSelectedContractId('');
        setContractDetails(null);
        setPaymentForm({ ...paymentForm, amountPaid: '' });
        
        if (customerId) {
            const customer = customers.find(c => c._id === customerId);
            setCustomerContracts(customer.contracts);
            
            // If they only have one contract, auto-select it!
            if (customer.contracts.length === 1) {
                handleContractSelect(customer.contracts[0]._id, customer);
            }
        } else {
            setCustomerContracts([]);
        }
    };

    const handleContractSelect = (contractId, optionalCustomerObj) => {
        setSelectedContractId(contractId);
        
        if (contractId === 'auto') {
            const customer = optionalCustomerObj || customers.find(c => c._id === selectedCustomerId);
            const totalBal = customer.contracts.reduce((sum, c) => sum + c.remainingBalance, 0);
            setContractDetails({
                customerName: customer.fullName,
                customerPhoto: customer.photo,
                isAuto: true,
                remainingBalance: totalBal,
                productName: 'Multiple Products (Auto-distributed)',
                monthlyInstallment: '',
                paymentFrequency: 'Variable'
            });
            setPaymentForm({
                ...paymentForm,
                amountPaid: '' // Let user type total amount
            });
        } else if (contractId) {
            // Find the specific contract
            const customer = optionalCustomerObj || customers.find(c => c._id === selectedCustomerId);
            const contract = customer.contracts.find(c => c._id === contractId);
            
            setContractDetails({
                ...contract,
                customerName: customer.fullName,
                customerPhoto: customer.photo
            });
            
            // Pre-fill amount for a specific contract
            setPaymentForm({
                ...paymentForm,
                amountPaid: contract.monthlyInstallment || ''
            });
        } else {
            setContractDetails(null);
            setPaymentForm({ ...paymentForm, amountPaid: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCustomerId || !selectedContractId) {
            toast.warning('Please select a customer and their product (or Auto-deduct)');
            return;
        }

        setSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const payload = {
                ...paymentForm,
                customerId: selectedCustomerId,
                contractId: selectedContractId
            };
            await axios.post(`http://localhost:5000/api/payments`, payload, config);
            toast.success(selectedContractId === 'auto' ? 'Bulk payment auto-distributed successfully!' : 'Payment recorded successfully!');
            
            // Reset form
            setSelectedCustomerId('');
            setSelectedContractId('');
            setContractDetails(null);
            setCustomerContracts([]);
            setSearchTerm('');
            setPaymentForm({
                amountPaid: '',
                paymentMethod: 'Cash',
                paymentDate: new Date().toISOString().split('T')[0],
                notes: ''
            });
            // Re-fetch to get updated balances
            fetchActiveCustomers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to record payment');
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-12">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Record Payment</h1>
                    <p className="text-gray-500 mt-1">Quickly enter a new payment from a customer</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <MdPayment className="text-2xl" />
                </div>
            </div>

            <div className="glass-card p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer *</label>
                        
                        {/* Search Input */}
                        <div className="relative mb-3">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MdSearch className="text-gray-400 text-xl" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search customer by name or mobile number..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                            />
                            {searchTerm && (
                                <button 
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    <MdClose className="text-lg" />
                                </button>
                            )}
                        </div>

                        {/* Native Select Dropdown for Customer */}
                        <select 
                            required
                            value={selectedCustomerId}
                            onChange={(e) => handleCustomerSelect(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="">-- Choose Customer --</option>
                            {filteredCustomers.map(c => {
                                const totalBal = c.contracts.reduce((sum, contract) => sum + contract.remainingBalance, 0);
                                return (
                                    <option key={c._id} value={c._id}>
                                        {c.fullName} - {c.mobileNumber} {c.contracts.length > 1 ? `(${c.contracts.length} Products)` : ''} (Total Bal: {formatCurrency(totalBal)})
                                    </option>
                                );
                            })}
                        </select>
                        {searchTerm && filteredCustomers.length === 0 && (
                            <p className="text-sm text-red-500 mt-2">No customers match your search.</p>
                        )}
                    </div>

                    {/* Product Selection (Only shown if customer has > 1 product) */}
                    {selectedCustomerId && customerContracts.length > 1 && (
                        <div className="mt-4 p-4 bg-orange-50/50 border border-orange-100 rounded-xl">
                            <label className="block text-sm font-medium text-gray-700 mb-2">This customer has multiple products. Select which product they are paying for: *</label>
                            <select 
                                required
                                value={selectedContractId}
                                onChange={(e) => handleContractSelect(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="">-- Choose Product --</option>
                                <option value="auto" className="font-bold text-green-600 bg-green-50">-- Pay to Overall Balance (Auto-deduct) --</option>
                                {customerContracts.map(contract => (
                                    <option key={contract._id} value={contract._id}>
                                        {contract.productName} - (Bal: {formatCurrency(contract.remainingBalance)})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Customer Quick Summary */}
                    {contractDetails && (
                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex flex-wrap gap-6 items-center">
                            {contractDetails.customerPhoto ? (
                                <img src={contractDetails.customerPhoto} alt={contractDetails.customerName} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-2xl border-2 border-white shadow-sm">
                                    {contractDetails.customerName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            
                            <div className="flex-1 flex flex-wrap gap-4 justify-between items-center">
                                {!contractDetails.isAuto && (
                                    <div>
                                        <p className="text-xs text-gray-500">Expected {contractDetails.paymentFrequency} Installment</p>
                                        <p className="text-lg font-bold text-gray-800">{formatCurrency(contractDetails.monthlyInstallment)}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-gray-500">{contractDetails.isAuto ? 'Total Remaining Balance' : 'Remaining Balance'}</p>
                                    <p className="text-lg font-bold text-primary">{formatCurrency(contractDetails.remainingBalance)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Product</p>
                                    <p className="text-sm font-semibold text-gray-700">{contractDetails.productName}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (₹) *</label>
                            <input 
                                type="number" 
                                required 
                                max={contractDetails?.remainingBalance || ""}
                                value={paymentForm.amountPaid}
                                onChange={(e) => setPaymentForm({...paymentForm, amountPaid: e.target.value})}
                                disabled={!selectedContractId}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
                            <input 
                                type="date" 
                                required 
                                value={paymentForm.paymentDate}
                                onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                                disabled={!selectedContractId}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                            <select 
                                required 
                                value={paymentForm.paymentMethod}
                                onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                                disabled={!selectedContractId}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                            >
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                            <input 
                                type="text"
                                placeholder="Any reference or remark"
                                value={paymentForm.notes}
                                onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                                disabled={!selectedContractId}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={submitting || !selectedContractId}
                            className="btn-primary px-8 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            ) : (
                                <MdCheckCircle className="mr-2 text-xl" />
                            )}
                            Record Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentForm;
