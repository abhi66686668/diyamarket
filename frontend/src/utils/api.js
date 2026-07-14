// Centralized API base URL — reads from Vite env variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://diyamarket.onrender.com';

export default API_BASE_URL;
