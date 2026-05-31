/**
 * API Configuration
 * Handles dynamic base URL configuration for different environments
 */

const getApiBaseUrl = () => {
    // For Vite, VITE_API_URL will be injected from .env files
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // In production (built app), use Railway backend URL
    if (import.meta.env.PROD) {
        // Production must use full URL for cross-origin requests
        // Default to Railway production backend
        return 'https://e-commerce-production-1f1f.up.railway.app/api';
    }

    // In development, use localhost with Vite proxy
    return 'http://localhost:5001/api';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Make authenticated fetch request with proper CORS credentials
 * @param {string} endpoint - API endpoint (e.g., '/cart/add')
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
export const apiFetch = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('authToken');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // IMPORTANT: credentials must be 'include' for cross-origin requests with Authorization header
    return fetch(url, {
        ...options,
        credentials: 'include',  // ✅ Allow cookies and credentials
        headers,
    });
};

export default API_BASE_URL;
