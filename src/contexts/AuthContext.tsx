'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME, CREATE_WORKSPACE } from '../graphql/operations';

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
  const [createWorkspace] = useMutation(CREATE_WORKSPACE);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem('access_token'));
    }
  }, []);

  const { data: userData, loading, error, refetch } = useQuery(GET_ME, {
    skip: !isLoggedIn || !mounted,
    errorPolicy: 'ignore'
  });

  useEffect(() => {
    if (userData?.me) {
      setUser(userData.me);
      // Auto-create workspace
      createWorkspace({
        variables: {
          name: `${userData.me.firstName}'s Workspace`,
          description: 'Default workspace'
        }
      }).catch(() => {});
    }
  }, [userData, createWorkspace]);

  const login = (tokens: any) => {
    console.log('Login tokens:', tokens);
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
    }
    setIsLoggedIn(true);
    // Delay to ensure token is properly set and page navigation happens
    setTimeout(() => {
      refetch();
    }, 1000);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    setIsLoggedIn(false);
    setUser(null);
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