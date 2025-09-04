'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const NotificationCenter = () => {
  const { user, loading } = useAuth();
  const [filter, setFilter] = useState('all');

  // Mock notifications for demo
  const mockNotifications = [
    {
      id: 1,
      title: 'Welcome to ChatFlow!',
      message: 'Your account has been successfully created. Start collaborating with your team.',
      type: 'welcome',
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Workspace Created',
      message: 'Your default workspace has been set up and is ready to use.',
      type: 'workspace',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 3,
      title: 'System Update',
      message: 'ChatFlow has been updated with new features and improvements.',
      type: 'system',
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const [notifications, setNotifications] = useState(mockNotifications);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900 font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

  const filteredNotifications = notifications.filter((n: any) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleDelete = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'welcome': return '👋';
      case 'workspace': return '🏢';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">Stay updated with your latest activities</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setFilter('all')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === 'unread'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Unread ({notifications.filter(n => !n.read).length})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === 'read'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Read ({notifications.filter(n => n.read).length})
              </button>
            </nav>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500">
                {filter === 'all' ? 'You have no notifications yet.' : `No ${filter} notifications.`}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification: any) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm border-l-4 ${
                  notification.read ? 'border-gray-300' : 'border-blue-500'
                } p-6`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="text-2xl">{getTypeIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{notification.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs capitalize">
                          {notification.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;