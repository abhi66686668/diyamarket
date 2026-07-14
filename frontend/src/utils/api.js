// Use relative URL in production (same server), localhost in dev
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:5000' : '';

export default API_BASE_URL;
