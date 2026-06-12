/**
 * API Configuration
 * Handles dynamic base URL configuration for different environments
 */

const normalizeApiBaseUrl = (value) => {
    if (!value) return null;

    const trimmed = value.trim();
    if (!trimmed) return null;

    const withoutTrailingSlash = trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;

    if (withoutTrailingSlash.startsWith('/')) {
        return withoutTrailingSlash;
    }

    return withoutTrailingSlash.endsWith('/api')
        ? withoutTrailingSlash
        : `${withoutTrailingSlash}/api`;
};

const getStoredToken = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        return sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    } catch {
        return null;
    }
};

const getApiBaseUrl = () => {
    const configuredUrl = normalizeApiBaseUrl(
        import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE
    );

    if (configuredUrl) {
        return configuredUrl;
    }

    if (typeof window !== 'undefined') {
        const { host, protocol } = window.location;

        if (host.includes('localhost') || host.includes('127.0.0.1')) {
            return 'http://localhost:5001/api';
        }

        if (host.includes('mahasu.co.in')) {
            return '/api';
        }

        return `${protocol}//${host}/api`;
    }

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
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${normalizedEndpoint}`;
    const token = getStoredToken();

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
        credentials: 'include',
        headers,
    });
};

export default API_BASE_URL;
