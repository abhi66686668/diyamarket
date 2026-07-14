import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../utils/api';
import { Link } from 'react-router-dom';
import { MdSearch, MdEdit, MdDelete, MdInventory } from 'react-icons/md';
import { toast } from 'react-toastify';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchProducts();
    }, [search]);

    const fetchProducts = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                params: { search }
            };
            const { data } = await axios.get(`${API_BASE_URL}/api/products`, config);
            setProducts(data);
        } catch (error) {
            toast.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                };
                await axios.delete(`${API_BASE_URL}/api/products/${id}`, config);
                toast.success('Product deleted');
                fetchProducts();
            } catch (error) {
                toast.error('Failed to delete product');
            }
        }
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                <Link to="/products/new" className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-primary/30 text-sm flex items-center">
                    + Add New Product
                </Link>
            </div>

            <div className="glass-card p-4">
                <div className="relative">
                    <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                    <input 
                        type="text" 
                        placeholder="Search by product name or category..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-200">
                                <th className="py-4 px-6 font-semibold text-sm text-gray-600">Product</th>
                                <th className="py-4 px-6 font-semibold text-sm text-gray-600">Category</th>
                                <th className="py-4 px-6 font-semibold text-sm text-gray-600">Price</th>
                                <th className="py-4 px-6 font-semibold text-sm text-gray-600">Stock</th>
                                <th className="py-4 px-6 font-semibold text-sm text-gray-600 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-10 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-10 text-center">
                                        <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                                            <MdInventory className="text-4xl text-gray-300 mb-2" />
                                            <p>No products found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center">
                                                {product.photo ? (
                                                    <img src={product.photo} alt={product.name} className="w-10 h-10 rounded-lg object-cover mr-3 border border-gray-200" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center mr-3">
                                                        <MdInventory className="text-xl" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-gray-800">{product.name}</p>
                                                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-sm font-bold text-gray-800">{formatCurrency(product.price)}</td>
                                        <td className="py-4 px-6">
                                            <span className={`text-sm font-medium ${product.stock <= 5 ? 'text-red-500' : 'text-gray-800'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-center gap-3">
                                                <Link to={`/products/edit/${product._id}`} className="text-gray-400 hover:text-secondary transition-colors" title="Edit">
                                                    <MdEdit className="text-xl" />
                                                </Link>
                                                <button onClick={() => handleDelete(product._id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Delete">
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

export default ProductList;
