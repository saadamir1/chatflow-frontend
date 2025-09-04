'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@apollo/client';
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

  useEffect(() => {
    // Check localStorage only on client side
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem('access_token'));
    }
  }, []);

  const { data: userData, loading, error, refetch } = useQuery(GET_ME, {
    skip: !isLoggedIn,
    onCompleted: (data) => {
      setUser(data.me);
    },
    onError: (error) => {
      console.error('Failed to fetch user data:', error);
      // If token is invalid, logout
      if (error.message.includes('Unauthorized')) {
        logout();
      }
    }
  });

  const login = (tokens: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
    }
    setIsLoggedIn(true);
    refetch();
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    setIsLoggedIn(false);
    setUser(null);
  };

  const value = {
    isLoggedIn,
    user,
    loading,
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