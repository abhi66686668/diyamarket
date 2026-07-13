import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthContext } from './context/AuthContext';
import Layout from './components/Layout/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/Customers/CustomerList';
import CustomerForm from './pages/Customers/CustomerForm';
import CustomerDetails from './pages/Customers/CustomerDetails';
import ContractForm from './pages/Customers/ContractForm';
import ProductList from './pages/Products/ProductList';
import ProductForm from './pages/Products/ProductForm';
import Payments from './pages/Payments/PaymentForm';
import Reports from './pages/Reports';

const ProtectedRoute = ({ children }) => {
    const { admin, loading } = useContext(AuthContext);
    
    if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>;
    
    return admin ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <ToastContainer position="top-right" autoClose={3000} />
            <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/customers" element={<ProtectedRoute><CustomerList /></ProtectedRoute>} />
                <Route path="/customers/new" element={<ProtectedRoute><CustomerForm /></ProtectedRoute>} />
                <Route path="/customers/edit/:id" element={<ProtectedRoute><CustomerForm /></ProtectedRoute>} />
                <Route path="/customers/:id" element={<ProtectedRoute><CustomerDetails /></ProtectedRoute>} />
                <Route path="/customers/:customerId/contracts/new" element={<ProtectedRoute><ContractForm /></ProtectedRoute>} />
                <Route path="/products" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
                <Route path="/products/new" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
                <Route path="/products/edit/:id" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
                <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
