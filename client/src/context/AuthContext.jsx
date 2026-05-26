import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for token and user in localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Verify token with backend
        try {
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          const json = await res.json();
          if (json.success) {
            setUser(json.data);
            localStorage.setItem('user', JSON.stringify(json.data));
          } else {
            // Token is invalid
            logout();
          }
        } catch (err) {
          console.error('[Auth Verify Failed]', err);
          // Don't log out immediately if it's a network error
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();

      if (json.success) {
        setToken(json.data.token);
        setUser(json.data);
        localStorage.setItem('token', json.data.token);
        localStorage.setItem('user', JSON.stringify(json.data));
        setLoading(false);
        return { success: true };
      } else {
        setError(json.message);
        setLoading(false);
        return { success: false, message: json.message };
      }
    } catch (err) {
      const msg = 'Failed to connect to backend server';
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      const json = await res.json();

      if (json.success) {
        setToken(json.data.token);
        setUser(json.data);
        localStorage.setItem('token', json.data.token);
        localStorage.setItem('user', JSON.stringify(json.data));
        setLoading(false);
        return { success: true };
      } else {
        setError(json.message);
        setLoading(false);
        return { success: false, message: json.message };
      }
    } catch (err) {
      const msg = 'Failed to connect to backend server';
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  // Logout handler
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
