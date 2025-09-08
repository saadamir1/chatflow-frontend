'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { useAuth } from '../../contexts/AuthContext';
import { 
  MY_NOTIFICATIONS, 
  MARK_NOTIFICATION_READ, 
  DELETE_NOTIFICATION, 
  NOTIFICATION_SUBSCRIPTION,
  APPROVE_JOIN,
  REJECT_JOIN
} from '../../graphql/operations';
import { useToast } from '../common/ToastProvider';

const NotificationCenter = () => {
  const { user, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const [filter, setFilter] = useState('all');
  
  const { data, loading, error, refetch } = useQuery(MY_NOTIFICATIONS, { 
    errorPolicy: 'ignore',
    pollInterval: 30000 // Poll every 30 seconds
  });
  
  const [markAsRead] = useMutation(MARK_NOTIFICATION_READ, { errorPolicy: 'ignore' });
  const [deleteNotification] = useMutation(DELETE_NOTIFICATION, { errorPolicy: 'ignore' });
  const [approveJoin] = useMutation(APPROVE_JOIN, { errorPolicy: 'all', onCompleted: () => showSuccess('Join request approved'), onError: () => showError('Failed to approve request') });
  const [rejectJoin] = useMutation(REJECT_JOIN, { errorPolicy: 'all', onCompleted: () => showSuccess('Join request rejected'), onError: () => showError('Failed to reject request') });
  const { data: newNotification } = useSubscription(NOTIFICATION_SUBSCRIPTION);

  // Handle new notifications from subscription
  useEffect(() => {
    if (newNotification?.notificationAdded) {
      refetch();
    }
  }, [newNotification, refetch]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900 font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load notifications</h3>
          <p className="text-gray-500 mb-4">Please check your connection and try again</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const notifications = data?.myNotifications || [];
  const filteredNotifications = notifications.filter((n: any) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead({ variables: { id: Number(id) } });
      refetch();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification({ variables: { id } });
      refetch();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n: any) => !n.read);
    try {
      await Promise.all(
        unreadNotifications.map((n: any) => 
          markAsRead({ variables: { id: n.id } })
        )
      );
      refetch();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'message': return '💬';
      case 'welcome': return '👋';
      case 'workspace': return '🏢';
      case 'system': return '⚙️';
      case 'admin': return '👑';
      case 'CHANNEL_JOIN_REQUEST': return '📥';
      case 'CHANNEL_JOIN_APPROVED': return '✅';
      case 'CHANNEL_JOIN_REJECTED': return '❌';
      default: return '🔔';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'message': return 'border-blue-500';
      case 'welcome': return 'border-green-500';
      case 'workspace': return 'border-purple-500';
      case 'system': return 'border-gray-500';
      case 'admin': return 'border-red-500';
      default: return 'border-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Notifications
                {user?.role === 'ADMIN' && <span className="text-red-600 text-sm ml-2">👑 Admin</span>}
              </h1>
              <p className="text-gray-600">Stay updated with your latest activities</p>
            </div>
            {notifications.filter((n: any) => !n.read).length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Mark All Read
              </button>
            )}
          </div>
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
                Unread ({notifications.filter((n: any) => !n.read).length})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === 'read'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Read ({notifications.filter((n: any) => n.read).length})
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
                  notification.read ? 'border-gray-300' : getTypeColor(notification.type)
                } p-6 ${!notification.read ? 'bg-blue-50' : ''}`}
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
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{notification.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                        <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                          notification.type === 'message' ? 'bg-blue-100 text-blue-800' :
                          notification.type === 'admin' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {notification.type}
                        </span>
                        {!notification.read && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {notification.type === 'CHANNEL_JOIN_REQUEST' && typeof notification.referenceId === 'number' && (
                      <>
                        <button
                          onClick={async () => {
                            try {
                              await approveJoin({ variables: { approveJoinInput: { requestId: Number(notification.referenceId) } } });
                              await markAsRead({ variables: { id: Number(notification.id) } });
                              refetch();
                            } catch (e) { console.error(e); }
                          }}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await rejectJoin({ variables: { rejectJoinInput: { requestId: Number(notification.referenceId) } } });
                              await markAsRead({ variables: { id: Number(notification.id) } });
                              refetch();
                            } catch (e) { console.error(e); }
                          }}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}
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

        {/* Live Notification Indicator */}
        {newNotification && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg max-w-sm animate-bounce">
            <h4 className="font-medium flex items-center">
              <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
              New Notification!
            </h4>
            <p className="text-sm mt-1">{newNotification.notificationAdded.title}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;