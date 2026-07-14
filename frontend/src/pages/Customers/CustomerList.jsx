import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../utils/api';
import { Link } from 'react-router-dom';
import { MdSearch, MdFilterList, MdEdit, MdVisibility, MdDelete } from 'react-icons/md';
import { toast } from 'react-toastify';

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, [search, statusFilter]);

    const fetchCustomers = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                params: { search, status: statusFilter }
            };
            const { data } = await axios.get(`${API_BASE_URL}/api/customers`, config);
            setCustomers(data);
        } catch (error) {
            toast.error('Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer? All payment records will also be deleted.')) {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                };
                await axios.delete(`${API_BASE_URL}/api/customers/${id}`, config);
                toast.success('Customer deleted');
                fetchCustomers();
            } catch (error) {
                toast.error('Failed to delete customer');
            }
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active': return <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Active</span>;
            case 'Completed': return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>;
            case 'Overdue': return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Overdue</span>;
            default: return null;
        }
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
                <Link to="/customers/new" className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-primary/30 text-sm">
                    + Add New Customer
                </Link>
            </div>

            <div className="glass-card p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                    <input 
                        type="text" 
                        placeholder="Search by name, mobile, or product..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <MdFilterList className="text-gray-500 text-xl" />
                    <select 
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-200">
                                <th className="py-4 px-6 font-semibold text-sm text-gray-600">Customer</th>
                                <th className="py-4 px-6 font-semibold text-sm text-gray-600">Product</th>
                                <th className="py-4 px-6 font-semibold text-sm text-gray-600">Total Amt</th>
                                <th className="py-4 px-6 font-semibold text-sm text-gray-600">Balance</th>
                                <th className="py-4 px-6 font-semibold text-sm text-gray-600">Status</th>
                                <th className="py-4 px-6 font-semibold text-sm text-gray-600 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-10 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </td>
                                </tr>
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-10 text-center text-gray-500">No customers found</td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center">
                                                {customer.photo ? (
                                                    <img src={customer.photo} alt={customer.fullName} className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-200" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mr-3">
                                                        {customer.fullName.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-gray-800">{customer.fullName}</p>
                                                    <p className="text-xs text-gray-500">{customer.mobileNumber}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            {(!customer.contracts || customer.contracts.length === 0) ? (
                                                <p className="text-sm font-medium text-gray-500">No contracts</p>
                                            ) : customer.contracts.length === 1 ? (
                                                <>
                                                    <p className="text-sm font-medium text-gray-800">{customer.contracts[0].productName}</p>
                                                    <p className="text-xs text-gray-500">{customer.contracts[0].productCategory}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-sm font-medium text-primary">{customer.contracts.length} Products</p>
                                                    <p className="text-xs text-gray-500 text-ellipsis overflow-hidden whitespace-nowrap max-w-[150px]">
                                                        {customer.contracts.map(c => c.productName).join(', ')}
                                                    </p>
                                                </>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-sm font-medium text-gray-800">
                                            {formatCurrency((customer.contracts || []).reduce((sum, c) => sum + c.totalRepaymentAmount, 0))}
                                        </td>
                                        <td className="py-4 px-6 text-sm font-bold text-gray-800">
                                            {formatCurrency((customer.contracts || []).reduce((sum, c) => sum + c.remainingBalance, 0))}
                                        </td>
                                        <td className="py-4 px-6">
                                            {(() => {
                                                if (!customer.contracts || customer.contracts.length === 0) return null;
                                                const hasOverdue = customer.contracts.some(c => c.paymentStatus === 'Overdue');
                                                const hasActive = customer.contracts.some(c => c.paymentStatus === 'Active');
                                                if (hasOverdue) return getStatusBadge('Overdue');
                                                if (hasActive) return getStatusBadge('Active');
                                                return getStatusBadge('Completed');
                                            })()}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-center gap-3">
                                                <Link to={`/customers/${customer._id}`} className="text-gray-400 hover:text-primary transition-colors" title="View Details">
                                                    <MdVisibility className="text-xl" />
                                                </Link>
                                                <Link to={`/customers/edit/${customer._id}`} className="text-gray-400 hover:text-secondary transition-colors" title="Edit">
                                                    <MdEdit className="text-xl" />
                                                </Link>
                                                <button onClick={() => handleDelete(customer._id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                                                    <MdDelete className="text-xl" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CustomerList;
