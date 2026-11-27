import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ds_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      if (token) {
        try {
          const data = await api.auth.me();
          setUser(data.user);
        } catch {
          localStorage.removeItem('ds_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    verifyAuth();
  }, [token]);

  const login = async (email, password) => {
    const data = await api.auth.login(email, password);
    localStorage.setItem('ds_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (details) => {
    const data = await api.auth.register(details);
    localStorage.setItem('ds_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem('ds_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
