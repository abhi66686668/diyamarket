import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { 
    MdPeopleAlt, 
    MdAccountBalanceWallet, 
    MdCheckCircle, 
    MdWarning, 
    MdTrendingUp,
    MdAttachMoney,
    MdShowChart
} from 'react-icons/md';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, color }) => (
    <div className="glass-card p-6 flex items-center justify-between">
        <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color} shadow-lg`}>
            {icon}
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [charts, setCharts] = useState(null);
    const [alerts, setAlerts] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                };
                
                const [statsRes, chartsRes, alertsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/dashboard/stats`, config),
                    axios.get(`${API_BASE_URL}/api/dashboard/charts`, config),
                    axios.get(`${API_BASE_URL}/api/dashboard/alerts`, config)
                ]);

                setStats(statsRes.data);
                setCharts(chartsRes.data);
                setAlerts(alertsRes.data);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

    const pieData = [
        { name: 'Active', value: stats?.activeAccounts || 0 },
        { name: 'Completed', value: stats?.completedAccounts || 0 },
        { name: 'Overdue', value: stats?.overdueAccounts || 0 },
    ];
    const COLORS = ['#007bff', '#10b981', '#ef4444'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
                <Link to="/customers/new" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md shadow-primary/30">
                    + New Customer
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Customers" 
                    value={stats?.totalCustomers} 
                    icon={<MdPeopleAlt className="text-2xl" />} 
                    color="bg-primary"
                />
                <StatCard 
                    title="Total Amount (Financed)" 
                    value={formatCurrency(stats?.totalAmount || 0)} 
                    icon={<MdAttachMoney className="text-2xl" />} 
                    color="bg-indigo-500"
                />
                <StatCard 
                    title="Total Profit (Interest)" 
                    value={formatCurrency(stats?.totalProfit || 0)} 
                    icon={<MdShowChart className="text-2xl" />} 
                    color="bg-purple-500"
                />
                <StatCard 
                    title="Outstanding Balance" 
                    value={formatCurrency(stats?.totalOutstandingBalance || 0)} 
                    icon={<MdAccountBalanceWallet className="text-2xl" />} 
                    color="bg-secondary"
                />
                <StatCard 
                    title="Monthly Collection" 
                    value={formatCurrency(stats?.monthlyCollection || 0)} 
                    icon={<MdTrendingUp className="text-2xl" />} 
                    color="bg-green-500"
                />
                <StatCard 
                    title="Monthly Profit" 
                    value={formatCurrency(stats?.monthlyProfit || 0)} 
                    icon={<MdShowChart className="text-2xl" />} 
                    color="bg-teal-500"
                />
                <StatCard 
                    title="Overdue Accounts" 
                    value={stats?.overdueAccounts} 
                    icon={<MdWarning className="text-2xl" />} 
                    color="bg-red-500"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Collection Trend (Last 6 Months)</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts?.monthlyTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} tickFormatter={(value) => `₹${value/1000}k`} />
                                <RechartsTooltip 
                                    formatter={(value) => formatCurrency(value)}
                                    cursor={{fill: '#f3f4f6'}}
                                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                                />
                                <Bar dataKey="collection" fill="#007bff" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Account Status</h3>
                    <div className="h-72 flex flex-col items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex gap-4 mt-4 w-full justify-center">
                            {pieData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center text-sm">
                                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></span>
                                    <span className="text-gray-600">{entry.name} ({entry.value})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Alerts & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <MdWarning className="text-orange-500 mr-2 text-xl" /> Action Required (Overdue & Upcoming)
                    </h3>
                    <div className="space-y-4">
                        {(alerts?.overdueDues?.length ?? 0) === 0 && (alerts?.upcomingDues?.length ?? 0) === 0 ? (
                            <p className="text-gray-500 text-center py-4">No pending actions required.</p>
                        ) : (
                            <>
                                {alerts?.overdueDues?.map(c => (
                                    <div key={c._id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                                        <div>
                                            <p className="font-semibold text-gray-800">{c.customer?.fullName}</p>
                                            <p className="text-xs text-gray-600 mb-1">{c.productName}</p>
                                            <p className="text-xs font-semibold text-red-600">Overdue: {formatCurrency(c.remainingBalance)}</p>
                                        </div>
                                        <Link to={`/customers/${c.customer?._id}`} className="text-sm text-primary font-medium hover:underline flex-shrink-0 ml-2">View</Link>
                                    </div>
                                ))}
                                {alerts?.upcomingDues?.map(c => (
                                    <div key={c._id} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                                        <div>
                                            <p className="font-semibold text-gray-800">{c.customer?.fullName}</p>
                                            <p className="text-xs text-gray-600 mb-1">{c.productName}</p>
                                            <p className="text-xs font-semibold text-orange-600">Due {new Date(c.dueDate).toLocaleDateString()}: {formatCurrency(c.monthlyInstallment)}</p>
                                        </div>
                                        <Link to={`/customers/${c.customer?._id}`} className="text-sm text-primary font-medium hover:underline flex-shrink-0 ml-2">View</Link>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>

                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <MdCheckCircle className="text-green-500 mr-2 text-xl" /> Recent Payments
                    </h3>
                    <div className="space-y-4">
                        {alerts?.recentPayments.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No recent payments.</p>
                        ) : (
                            alerts?.recentPayments.map(p => (
                                <div key={p._id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0">
                                    <div>
                                        <p className="font-semibold text-gray-800">{p.customer?.fullName}</p>
                                        <p className="text-xs text-gray-500">{new Date(p.paymentDate).toLocaleDateString()} • {p.paymentMethod}</p>
                                    </div>
                                    <div className="font-bold text-green-600">
                                        +{formatCurrency(p.amountPaid)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
