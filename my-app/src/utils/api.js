/**
 * API Configuration
 * Handles dynamic base URL configuration for different environments
 */

const getApiBaseUrl = () => {
    // For Vite, VITE_API_URL will be injected from .env files
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // In production (built app), use Railway backend URL or fall back to relative path
    if (import.meta.env.PROD) {
        // In Vercel production, this should be set via environment variable
        // If not set, it will use relative path (which may not work for OAuth)
        const railwayUrl = import.meta.env.VITE_RAILWAY_API_URL;
        if (railwayUrl) {
            return railwayUrl;
        }
        return '/api';
    }

    // In development, use localhost with Vite proxy
    return 'http://localhost:5001/api';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Make authenticated fetch request
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

    return fetch(url, {
        ...options,
        headers,
    });
};

export default API_BASE_URL;
