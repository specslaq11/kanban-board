import { createContext, useContext, useState, useEffect } from 'react';
import config from '../config';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            fetch(`${config.apiUrl}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                credentials: 'include',
            })
            .then(async res => {
                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.message);
                }
                return res.json();
            })
            .then(data => {
                setCurrentUser(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Auth error:', error);
                handleAuthError();
            });
        } else {
            setLoading(false);
        }
    }, [token]);

    const getCsrfToken = () => {
        return document.cookie.split('; ')
            .find(row => row.startsWith('XSRF-TOKEN'))
            ?.split('=')[1];
    };

    const handleAuthError = () => {
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
        setLoading(false);
    };

    const login = async (email, password) => {
        try {
            const res = await fetch(`${config.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            console.log('Login response status:', res.status);
            if (res.status === 502 || res.status === 500) {
                throw new Error('Server error - please try again later');
            }

            if (res.status === 404) {
                throw new Error('API endpoint not found');
            }

            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message);

            localStorage.setItem('token', data.token);
            setToken(data.token);
            setCurrentUser(data.user);
        } catch (error) {
            console.error('Login error:', error);
            console.error('Login error details:', {
                message: error.message,
                stack: error.stack
            });
            if (error.message.includes('CORS')) {
                throw new Error('Connection error - please try again later');
            }
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            const res = await fetch(`${config.apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                credentials: 'include',
                body: JSON.stringify({ 
                    name, 
                    email, 
                    password,
                    passwordConfirm: password // Add password confirmation
                })
            });

            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message);

            localStorage.setItem('token', data.token);
            setToken(data.token);
            setCurrentUser(data.user);
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await fetch(`${config.apiUrl}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                credentials: 'include',
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            handleAuthError();
        }
    };

    const value = {
        currentUser,
        token,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
} 