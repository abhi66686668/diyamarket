import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdArrowBack } from 'react-icons/md';

const ContractForm = () => {
    const { customerId } = useParams();
    const navigate = useNavigate();

    const getInitialState = () => ({
        productName: '', productCategory: '', productSerialNumber: '',
        totalProductAmount: '', advanceAmount: '', interestRate: '',
        financeStartDate: new Date().toISOString().split('T')[0], numberOfInstallments: '',
        paymentFrequency: 'Monthly',
        productPhoto: null
    });

    const [formData, setFormData] = useState(getInitialState);
    const [customCategory, setCustomCategory] = useState('');
    const [customer, setCustomer] = useState(null);
    const [productsList, setProductsList] = useState([]);
    
    // Auto calculated fields for preview
    const [calculated, setCalculated] = useState({
        financedAmount: 0, interestAmount: 0, totalRepaymentAmount: 0, monthlyInstallment: 0
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                
                // Fetch customer details
                const custRes = await axios.get(`import.meta.env.VITE_API_URL/api/customers/${customerId}`, config);
                setCustomer(custRes.data.customer);

                // Fetch products list
                const prodRes = await axios.get('import.meta.env.VITE_API_URL/api/products', config);
                setProductsList(prodRes.data);
            } catch (error) {
                toast.error('Failed to load initial data');
                navigate('/customers');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [customerId, navigate]);

    // Calculate dynamic fields
    useEffect(() => {
        const totalAmount = Number(formData.totalProductAmount) || 0;
        const advance = Number(formData.advanceAmount) || 0;
        const rate = Number(formData.interestRate) || 0;
        const months = Number(formData.numberOfInstallments) || 0;

        const financed = totalAmount - advance;
        const interest = (financed * rate) / 100;
        const repayment = financed + interest;
        const emi = months > 0 ? repayment / months : 0;

        setCalculated({
            financedAmount: financed > 0 ? financed : 0,
            interestAmount: interest > 0 ? interest : 0,
            totalRepaymentAmount: repayment > 0 ? repayment : 0,
            monthlyInstallment: emi > 0 ? emi : 0
        });
    }, [formData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProductChange = (e) => {
        const val = e.target.value;
        const matchedProduct = productsList.find(p => p.name === val);
        
        if (matchedProduct) {
            const standardCategories = [
                'Furniture', 'Home Decor', 'Kitchen & Dining', 'Bedroom', 'Bathroom', 
                'Lighting', 'Electrical & Power', 'Electronics', 'Home Appliances', 
                'Cleaning & Utility', 'Garden & Outdoor', 'Tools & Hardware', 
                'Storage & Organization', 'Baby & Kids', 'Festive & Seasonal'
            ];
            
            let newCategory = matchedProduct.category;
            let newCustom = '';
            
            if (!standardCategories.includes(newCategory)) {
                newCustom = newCategory;
                newCategory = 'Other';
            }
            
            setFormData(prev => ({
                ...prev,
                productName: matchedProduct.name,
                productCategory: newCategory,
                totalProductAmount: matchedProduct.price ? matchedProduct.price.toString() : prev.totalProductAmount,
                productPhoto: matchedProduct.photo || prev.productPhoto
            }));
            
            setCustomCategory(newCustom);
        } else {
            setFormData(prev => ({ ...prev, productName: val }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            
            const submitData = { ...formData };
            if (submitData.productCategory === 'Other') {
                submitData.productCategory = customCategory;
            }
            
            await axios.post(`import.meta.env.VITE_API_URL/api/contracts/customers/${customerId}`, submitData, config);
            toast.success('Contract added successfully');
            
            navigate(`/customers/${customerId}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !customer) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Link to={`/customers/${customerId}`} className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-gray-600">
                    <MdArrowBack className="text-xl" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Add New Contract</h1>
                    <p className="text-gray-500 text-sm">For Customer: <span className="font-semibold text-primary">{customer.fullName}</span></p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Product Details Section */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Product Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                            <input 
                                required 
                                type="text" 
                                list="productListOptions"
                                name="productName" 
                                value={formData.productName} 
                                onChange={handleProductChange} 
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50" 
                            />
                            <datalist id="productListOptions">
                                {productsList.map(p => (
                                    <option key={p._id} value={p.name} />
                                ))}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                            <select required name="productCategory" value={formData.productCategory} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50">
                                <option value="">Select Category</option>
                                <option value="Furniture">Furniture</option>
                                <option value="Home Decor">Home Decor</option>
                                <option value="Kitchen & Dining">Kitchen & Dining</option>
                                <option value="Bedroom">Bedroom</option>
                                <option value="Bathroom">Bathroom</option>
                                <option value="Lighting">Lighting</option>
                                <option value="Electrical & Power">Electrical & Power</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Home Appliances">Home Appliances</option>
                                <option value="Cleaning & Utility">Cleaning & Utility</option>
                                <option value="Garden & Outdoor">Garden & Outdoor</option>
                                <option value="Tools & Hardware">Tools & Hardware</option>
                                <option value="Storage & Organization">Storage & Organization</option>
                                <option value="Baby & Kids">Baby & Kids</option>
                                <option value="Festive & Seasonal">Festive & Seasonal</option>
                                <option value="Other">Other</option>
                            </select>
                            {formData.productCategory === 'Other' && (
                                <input 
                                    type="text" 
                                    placeholder="Enter custom category" 
                                    required 
                                    value={customCategory} 
                                    onChange={(e) => setCustomCategory(e.target.value)} 
                                    className="w-full mt-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50" 
                                />
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                            <input type="text" name="productSerialNumber" value={formData.productSerialNumber} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Photo</label>
                            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100">
                                {(() => {
                                    const currentProduct = productsList.find(p => p.name === formData.productName);
                                    const displayPhoto = currentProduct?.photo || formData.productPhoto;
                                    return displayPhoto ? (
                                        <img src={displayPhoto} alt="Product" className="w-32 h-32 rounded-lg object-contain bg-gray-50 border border-gray-200 p-2 shadow-sm" />
                                    ) : (
                                        <div className="w-32 h-32 rounded-lg bg-gray-50 border border-gray-200 border-dashed flex items-center justify-center text-gray-400 text-sm text-center p-4">
                                            No photo available
                                        </div>
                                    );
                                })()}
                                <div className="text-sm text-gray-500">
                                    <p>This photo is automatically pulled from the Products inventory.</p>
                                    <p>To change it, update the photo in the Products section.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Finance Details Section */}
                <div className="glass-card p-6 border-l-4 border-l-secondary">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Finance Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (₹) *</label>
                            <input required type="number" name="totalProductAmount" value={formData.totalProductAmount} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Advance Amount (₹) *</label>
                            <input required type="number" name="advanceAmount" value={formData.advanceAmount} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%) *</label>
                            <input required type="number" name="interestRate" step="0.01" value={formData.interestRate} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Installments (Optional)</label>
                            <input type="number" name="numberOfInstallments" value={formData.numberOfInstallments} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Frequency *</label>
                            <select required name="paymentFrequency" value={formData.paymentFrequency} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50">
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Finance Start Date *</label>
                            <input required type="date" name="financeStartDate" value={formData.financeStartDate} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                    </div>

                    {/* Auto Calculations Panel */}
                    <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
                        <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider">Auto Calculated Summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Financed Amount</p>
                                <p className="text-lg font-semibold text-gray-800">{formatCurrency(calculated.financedAmount)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Interest Amount</p>
                                <p className="text-lg font-semibold text-orange-600">{formatCurrency(calculated.interestAmount)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Total Repayment</p>
                                <p className="text-lg font-bold text-primary">{formatCurrency(calculated.totalRepaymentAmount)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Expected Installment</p>
                                <p className="text-lg font-bold text-gray-800">{formatCurrency(calculated.monthlyInstallment)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Link to={`/customers/${customerId}`} className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        Cancel
                    </Link>
                    <button type="submit" disabled={submitting} className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors shadow-lg shadow-primary/30 flex items-center">
                        {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> : null}
                        Save Contract
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContractForm;
