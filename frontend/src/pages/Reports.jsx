import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { MdPictureAsPdf, MdTableChart, MdAttachMoney } from 'react-icons/md';
import { toast } from 'react-toastify';

const Reports = () => {
    const [contracts, setContracts] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReportType, setSelectedReportType] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            
            const [customersRes, paymentsRes] = await Promise.all([
                axios.get('import.meta.env.VITE_API_URL/api/customers', config),
                axios.get('import.meta.env.VITE_API_URL/api/payments', config)
            ]);
            
            // Flatten customers into a list of contracts
            const allContracts = [];
            customersRes.data.forEach(customer => {
                if (customer.contracts) {
                    customer.contracts.forEach(contract => {
                        allContracts.push({
                            ...contract,
                            customerName: customer.fullName,
                            mobileNumber: customer.mobileNumber,
                            address: customer.address
                        });
                    });
                }
            });
            setContracts(allContracts);
            setPayments(paymentsRes.data);
        } catch (error) {
            toast.error('Failed to fetch data for reports');
        } finally {
            setLoading(false);
        }
    };

    // Helper for Monthly Transactions
    const getMonthlyTransactions = () => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return payments.filter(p => {
            const d = new Date(p.paymentDate);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const dateStr = new Date().toLocaleDateString();
        
        let title = '';
        let tableColumn = [];
        let tableRows = [];

        if (selectedReportType === 'transactions') {
            title = 'Monthly Transactions Report';
            tableColumn = ["Date", "Customer", "Product", "Method", "Amount Paid"];
            const monthlyTx = getMonthlyTransactions();
            monthlyTx.forEach(p => {
                tableRows.push([
                    new Date(p.paymentDate).toLocaleDateString(),
                    p.customer?.fullName || 'N/A',
                    p.contract?.productName || 'N/A',
                    p.paymentMethod,
                    p.amountPaid.toString()
                ]);
            });
            
            const totalCollected = monthlyTx.reduce((sum, t) => sum + Number(t.amountPaid || 0), 0);
            tableRows.push(['', '', '', 'GRAND TOTAL', totalCollected.toString()]);
        } else {
            if (selectedReportType === 'outstanding') title = 'Outstanding Balance Report';
            else if (selectedReportType === 'overdue') title = 'Overdue Accounts Report';
            else title = 'All Contracts Report';

            tableColumn = ["Name", "Mobile", "Product", "Total Amt", "Remaining", "Due Date", "Status"];
            const filterData = selectedReportType === 'outstanding' 
                ? contracts.filter(c => c.paymentStatus !== 'Completed')
                : selectedReportType === 'overdue'
                ? contracts.filter(c => c.paymentStatus === 'Overdue')
                : contracts;

            filterData.forEach(contract => {
                tableRows.push([
                    contract.customerName || 'N/A',
                    contract.mobileNumber || 'N/A',
                    contract.productName || 'N/A',
                    (contract.totalRepaymentAmount || 0).toString(),
                    (contract.remainingBalance || 0).toString(),
                    contract.dueDate ? new Date(contract.dueDate).toLocaleDateString() : 'N/A',
                    contract.paymentStatus || 'N/A'
                ]);
            });

            const totalFinanced = filterData.reduce((sum, c) => sum + Number(c.totalRepaymentAmount || 0), 0);
            const totalRemaining = filterData.reduce((sum, c) => sum + Number(c.remainingBalance || 0), 0);
            tableRows.push(['', '', 'GRAND TOTAL', totalFinanced.toString(), totalRemaining.toString(), '', '']);
        }

        doc.setFontSize(18);
        doc.text(`Diya Market Finance Manager - ${title}`, 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated on: ${dateStr}`, 14, 30);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: selectedReportType === 'transactions' ? [46, 204, 113] : [0, 123, 255] }
        });

        doc.save(`${title.replace(/ /g, '_')}_${dateStr}.pdf`);
        toast.success(`${title} PDF generated`);
    };

    const generateExcel = () => {
        const dateStr = new Date().toLocaleDateString().replace(/\//g, '-');
        let exportData = [];
        let sheetName = "Report";
        let fileName = "";

        if (selectedReportType === 'transactions') {
            exportData = getMonthlyTransactions().map(p => ({
                "Payment Date": new Date(p.paymentDate).toLocaleDateString(),
                "Customer Name": p.customer?.fullName || 'N/A',
                "Mobile Number": p.customer?.mobileNumber || 'N/A',
                "Product": p.contract?.productName || 'N/A',
                "Payment Method": p.paymentMethod,
                "Amount Paid": p.amountPaid,
                "Notes": p.notes || ''
            }));
            sheetName = "Transactions";
            fileName = `DiyaMarket_Monthly_Transactions_${dateStr}.xlsx`;
        } else {
            const filterData = selectedReportType === 'outstanding' 
                ? contracts.filter(c => c.paymentStatus !== 'Completed')
                : selectedReportType === 'overdue'
                ? contracts.filter(c => c.paymentStatus === 'Overdue')
                : contracts;

            exportData = filterData.map(c => ({
                "Customer Name": c.customerName,
                "Mobile Number": c.mobileNumber,
                "Address": c.address || 'N/A',
                "Product": c.productName,
                "Category": c.productCategory,
                "Total Financed": c.totalRepaymentAmount,
                "Advance Paid": c.advanceAmount,
                "Remaining Balance": c.remainingBalance,
                "Monthly EMI": c.monthlyInstallment,
                "Installments": c.numberOfInstallments,
                "Next Due Date": c.dueDate ? new Date(c.dueDate).toLocaleDateString() : 'N/A',
                "Status": c.paymentStatus
            }));
            sheetName = "Contracts";
            fileName = `DiyaMarket_Contract_Report_${dateStr}.xlsx`;
        }

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(wb, fileName);
        toast.success("Excel Report generated");
    };

    let title = '';
    let filterData = [];
    if (selectedReportType === 'outstanding') {
        title = 'Outstanding Balance Report';
        filterData = contracts.filter(c => c.paymentStatus !== 'Completed');
    } else if (selectedReportType === 'overdue') {
        title = 'Overdue Accounts Report';
        filterData = contracts.filter(c => c.paymentStatus === 'Overdue');
    } else if (selectedReportType === 'transactions') {
        title = 'Monthly Transactions (Current Month)';
        filterData = getMonthlyTransactions();
    } else {
        title = 'All Contracts Report';
        filterData = contracts;
    }

    if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    return (
        <div className="space-y-6 pb-12">
            <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
            
            {/* Report Selectors */}
            <div className="flex flex-wrap gap-4 mb-6">
                <button onClick={() => setSelectedReportType('all')} className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedReportType === 'all' ? 'bg-primary text-white shadow-md transform scale-[1.02]' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>All Contracts</button>
                <button onClick={() => setSelectedReportType('outstanding')} className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedReportType === 'outstanding' ? 'bg-red-500 text-white shadow-md transform scale-[1.02]' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Outstanding Balance</button>
                <button onClick={() => setSelectedReportType('overdue')} className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedReportType === 'overdue' ? 'bg-orange-500 text-white shadow-md transform scale-[1.02]' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Overdue Accounts</button>
                <button onClick={() => setSelectedReportType('transactions')} className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedReportType === 'transactions' ? 'bg-green-500 text-white shadow-md transform scale-[1.02] flex items-center' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center'}`}>
                    <MdAttachMoney className="mr-1 text-lg" /> Monthly Transactions
                </button>
            </div>

            {/* Data Preview */}
            <div className="glass-card p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                    <h3 className="text-xl font-bold text-gray-800">
                        {title} Preview <span className="text-sm font-normal text-gray-500 ml-2">({filterData.length} records)</span>
                        {selectedReportType === 'transactions' ? (
                            <span className="text-sm font-bold text-green-600 ml-4 bg-green-50 px-3 py-1 rounded-md border border-green-100">
                                Total Collected: ₹{filterData.reduce((sum, t) => sum + Number(t.amountPaid || 0), 0).toLocaleString()}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-4 ml-4">
                                <span className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-1 rounded-md border border-gray-200">
                                    Total Financed: ₹{filterData.reduce((sum, c) => sum + Number(c.totalRepaymentAmount || 0), 0).toLocaleString()}
                                </span>
                                <span className="text-sm font-bold text-primary bg-primary/5 px-3 py-1 rounded-md border border-primary/20">
                                    Total Remaining: ₹{filterData.reduce((sum, c) => sum + Number(c.remainingBalance || 0), 0).toLocaleString()}
                                </span>
                            </span>
                        )}
                    </h3>
                    <div className="flex gap-3">
                        <button onClick={generatePDF} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-semibold flex items-center transition-colors shadow-sm">
                            <MdPictureAsPdf className="mr-2" /> Download PDF
                        </button>
                        <button onClick={generateExcel} className="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-semibold flex items-center transition-colors shadow-sm">
                            <MdTableChart className="mr-2" /> Download Excel
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            {selectedReportType === 'transactions' ? (
                                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                                    <th className="p-4 font-semibold whitespace-nowrap">Date</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Customer</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Product</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Method</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Amount Paid</th>
                                </tr>
                            ) : (
                                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                                    <th className="p-4 font-semibold whitespace-nowrap">Name</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Mobile</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Product</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Total Financed</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Remaining</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                                </tr>
                            )}
                        </thead>
                        <tbody className="text-sm">
                            {filterData.length === 0 ? (
                                <tr><td colSpan="6" className="p-12 text-center text-gray-500">No records found for this report</td></tr>
                            ) : selectedReportType === 'transactions' ? (
                                filterData.map(payment => (
                                    <tr key={payment._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 font-medium text-gray-800 whitespace-nowrap">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                        <td className="p-4 text-gray-600 whitespace-nowrap">{payment.customer?.fullName || 'Deleted'}</td>
                                        <td className="p-4 text-gray-600 whitespace-nowrap">{payment.contract?.productName || 'Deleted'}</td>
                                        <td className="p-4 text-gray-600 whitespace-nowrap">{payment.paymentMethod}</td>
                                        <td className="p-4 font-semibold text-green-600 whitespace-nowrap">₹{payment.amountPaid.toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                filterData.map(contract => (
                                    <tr key={contract._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 font-medium text-gray-800 whitespace-nowrap">{contract.customerName}</td>
                                        <td className="p-4 text-gray-600 whitespace-nowrap">{contract.mobileNumber}</td>
                                        <td className="p-4 text-gray-600 whitespace-nowrap">{contract.productName}</td>
                                        <td className="p-4 text-gray-600 whitespace-nowrap">₹{(contract.totalRepaymentAmount || 0).toLocaleString()}</td>
                                        <td className="p-4 font-semibold text-primary whitespace-nowrap">₹{(contract.remainingBalance || 0).toLocaleString()}</td>
                                        <td className="p-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${contract.paymentStatus === 'Completed' ? 'bg-green-100 text-green-700' : contract.paymentStatus === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {contract.paymentStatus}
                                            </span>
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

export default Reports;
