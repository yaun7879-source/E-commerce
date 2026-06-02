import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('authUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('authToken') || null);
    const [loading, setLoading] = useState(false);

    const login = (userData, authToken) => {
        if (userData) {
            setUser(userData);
            localStorage.setItem('authUser', JSON.stringify(userData));
        } else {
            setUser(null);
            localStorage.removeItem('authUser');
        }

        if (authToken) {
            setToken(authToken);
            localStorage.setItem('authToken', authToken);
        } else {
            setToken(null);
            localStorage.removeItem('authToken');
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
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
