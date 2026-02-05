import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface User {
  userId: string;
  roles: string[];
  exp?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [, setLocation] = useLocation();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setLocation('/login');
  }, [setLocation]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');

    if (tokenFromUrl) {
      login(tokenFromUrl);
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (token) {
      try {
        const decodedUser = jwtDecode<User>(token);

        // Check for expiration
        if (decodedUser.exp && decodedUser.exp * 1000 < Date.now()) {
          console.warn('Token expired');
          logout();
          return;
        }

        console.log('Token decoded successfully:', decodedUser);
        setUser(decodedUser);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      }
    }
  }, [token, logout]);

  // Set up response interceptor to handle 401s globally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.warn('Unauthorized request detected, logging out...');
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [logout]);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setLocation('/');
  };

  const isAuthenticated = () => !!token;
  const isAdmin = () => {
    return user?.roles?.includes('admin') || false;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
