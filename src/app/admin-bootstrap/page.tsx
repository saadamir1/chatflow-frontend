'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { BOOTSTRAP_ADMIN } from '../../graphql/operations';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminBootstrap() {
  const [formData, setFormData] = useState({
    email: 'admin@example.com',
    password: 'password123',
    firstName: 'Admin',
    lastName: 'User'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { login } = useAuth();

  const [bootstrapAdmin] = useMutation(BOOTSTRAP_ADMIN, {
    onCompleted: (data) => {
      setIsLoading(false);
      login(data.bootstrapAdmin);
      setMessage('Admin created and logged in successfully!');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    },
    onError: (error) => {
      setIsLoading(false);
      setMessage(`Error: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    bootstrapAdmin({
      variables: formData
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Bootstrap Admin Account
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Admin Account'}
          </button>
        </form>
        
        {message && (
          <div className={`mt-4 p-3 rounded-md ${
            message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {message}
          </div>
        )}
        
        <div className="mt-6 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-500 text-sm">
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}