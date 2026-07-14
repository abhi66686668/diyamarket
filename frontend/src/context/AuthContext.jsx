import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const config = {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    };
                    const { data } = await axios.get(`${API_BASE_URL}/api/auth/profile`, config);
                    setAdmin({ ...data, token });
                } catch (error) {
                    console.error("Token invalid or expired", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        
        checkLoggedIn();
    }, []);

    const login = async (username, password) => {
        const { data } = await axios.post(`${API_BASE_URL}/api/auth/login`, { username, password });
        localStorage.setItem('token', data.token);
        setAdmin(data);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setAdmin(null);
    };

    return (
        <AuthContext.Provider value={{ admin, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
