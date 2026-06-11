import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext();

const readStoredValue = (key) => {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        return sessionStorage.getItem(key) ?? localStorage.getItem(key);
    } catch {
        return null;
    }
};

const writeStoredValue = (key, value) => {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        sessionStorage.setItem(key, value);
    } catch {
        try {
            localStorage.setItem(key, value);
        } catch {
            // Ignore storage failures in private browsing or restricted modes.
        }
    }
};

const removeStoredValue = (key) => {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        sessionStorage.removeItem(key);
    } catch {
        // Ignore storage failures in private browsing or restricted modes.
    }

    try {
        localStorage.removeItem(key);
    } catch {
        // Ignore storage failures in private browsing or restricted modes.
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = readStoredValue('authUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [token, setToken] = useState(() => readStoredValue('authToken') || null);
    const [loading, setLoading] = useState(false);

    const login = (userData, authToken) => {
        if (userData) {
            setUser(userData);
            writeStoredValue('authUser', JSON.stringify(userData));
        } else {
            setUser(null);
            removeStoredValue('authUser');
        }

        if (authToken) {
            setToken(authToken);
            writeStoredValue('authToken', authToken);
        } else {
            setToken(null);
            removeStoredValue('authToken');
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        removeStoredValue('authUser');
        removeStoredValue('authToken');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
