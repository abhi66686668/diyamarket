import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../utils/api';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        description: '',
        stock: 0,
        photo: ''
    });

    useEffect(() => {
        if (isEditMode) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };
            const { data } = await axios.get(`${API_BASE_URL}/api/products/${id}`, config);
            setFormData({
                name: data.name,
                category: data.category,
                price: data.price,
                description: data.description || '',
                stock: data.stock || 0,
                photo: data.photo || ''
            });
        } catch (error) {
            toast.error('Failed to fetch product details');
            navigate('/products');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        setUploadingImage(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            };
            const { data } = await axios.post(`${API_BASE_URL}/api/upload`, uploadData, config);
            setFormData({ ...formData, photo: data.imageUrl });
            toast.success('Image uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload image');
            console.error(error);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const config = {
                headers: { 
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            };

            if (isEditMode) {
                await axios.put(`${API_BASE_URL}/api/products/${id}`, formData, config);
                toast.success('Product updated successfully');
            } else {
                await axios.post(`${API_BASE_URL}/api/products`, formData, config);
                toast.success('Product added successfully');
            }
            navigate('/products');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">
                    {isEditMode ? 'Edit Product' : 'Add New Product'}
                </h1>
                <Link to="/products" className="text-gray-500 hover:text-gray-700 transition-colors">
                    Cancel
                </Link>
            </div>

            <div className="glass-card p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Product Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="e.g. iPhone 13 Pro"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="" disabled>Select Category</option>
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
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Price (INR) *</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="e.g. 50000"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Stock Quantity</label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700">Product Photo</label>
                            <div className="flex items-center space-x-4">
                                {formData.photo && (
                                    <img 
                                        src={formData.photo} 
                                        alt="Product preview" 
                                        className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                                    />
                                )}
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploadingImage}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                    />
                                    {uploadingImage && <p className="text-sm text-gray-500 mt-2">Uploading image...</p>}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Product details..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-primary/30 ${
                                submitting ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                        >
                            {submitting ? 'Saving...' : (isEditMode ? 'Update Product' : 'Save Product')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
