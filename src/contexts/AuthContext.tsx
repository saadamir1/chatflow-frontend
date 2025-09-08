'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { GET_ME } from '../graphql/operations';

interface AuthContextType {
  isLoggedIn: boolean;
  user: any;
  loading: boolean;
  error: any;
  login: (tokens: any) => void;
  logout: () => void;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem('access_token'));
    }
  }, []);

  // Skip GET_ME query for now due to JWT issues
  const loading = false;
  const error = null;
  const refetch = () => {};

  // Set user data from JWT token payload
  useEffect(() => {
    if (isLoggedIn && !user && typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // Decode JWT payload (without verification for display purposes)
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({
            id: payload.sub,
            email: payload.email,
            firstName: payload.email === 'admin@gmail.com' ? 'Admin' : 
              payload.email === 'Saadamir070@gmail.com' ? 'Saad' :
              payload.email === 'Saadshk070@gmail.com' ? 'Ahsan' :
              payload.email.split('@')[0],
            lastName: 'User',
            role: payload.role?.toUpperCase() || 'USER'
          });
        } catch (e) {
          console.error('Error decoding token:', e);
        }
      }
    }
  }, [isLoggedIn, user]);

  const login = (tokens: any) => {
    console.log('Login tokens:', tokens);
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
    }
    setIsLoggedIn(true);
    
    // Decode and set user data immediately
    try {
      const payload = JSON.parse(atob(tokens.access_token.split('.')[1]));
      setUser({
        id: payload.sub,
        email: payload.email,
        firstName: payload.email === 'admin@gmail.com' ? 'Admin' : 
          payload.email === 'Saadamir070@gmail.com' ? 'Saad' :
          payload.email === 'Saadshk070@gmail.com' ? 'Ahsan' :
          payload.email.split('@')[0],
        lastName: 'User',
        role: payload.role?.toUpperCase() || 'USER'
      });
    } catch (e) {
      console.error('Error decoding token:', e);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    setIsLoggedIn(false);
    setUser(null);
    try {
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { type: 'success', message: 'Signed out' } }));
    } catch {}
    window.location.href = '/';
  };

  const value = {
    isLoggedIn,
    user,
    loading: loading || !mounted,
    error,
    login,
    logout,
    refetch
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};