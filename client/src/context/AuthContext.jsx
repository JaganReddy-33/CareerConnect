import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setToken(token);
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setUser(response.data.user);
      setToken(token);
    } catch (error) {
      // Try to refresh token if validation fails
      if (error.response?.status === 401) {
        try {
          const refreshResponse = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {}, {
            withCredentials: true,
          });
          const newToken = refreshResponse.data.accessToken;
          localStorage.setItem('accessToken', newToken);
          setToken(newToken);
          // Retry getting user info
          const userResponse = await axios.get(`${import.meta.env.VITE_API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${newToken}` },
            withCredentials: true,
          });
          setUser(userResponse.data.user);
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          setToken(null);
          setUser(null);
        }
      } else {
        localStorage.removeItem('accessToken');
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = (accessToken, userData) => {
    localStorage.setItem('accessToken', accessToken);
    setToken(accessToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      if (token) {
        await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedData) => {
    setUser((prevUser) => (prevUser ? { ...prevUser, ...updatedData } : updatedData));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
