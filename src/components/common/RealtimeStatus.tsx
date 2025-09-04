'use client';

import React from 'react';
import { useSubscription } from '@apollo/client';
import { MESSAGE_SUBSCRIPTION, NOTIFICATION_SUBSCRIPTION } from '../../graphql/operations';

const RealtimeStatus = () => {
  const { data: messageData, error: messageError } = useSubscription(MESSAGE_SUBSCRIPTION);
  const { data: notificationData, error: notificationError } = useSubscription(NOTIFICATION_SUBSCRIPTION);

  const getConnectionStatus = (data: any, error: any) => {
    if (error) return 'error';
    if (data) return 'connected';
    return 'connecting';
  };

  const messageStatus = getConnectionStatus(messageData, messageError);
  const notificationStatus = getConnectionStatus(notificationData, notificationError);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '✅';
      case 'error': return '❌';
      default: return '🔄';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'error': return 'Error';
      default: return 'Connecting...';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getStatusIcon(messageStatus)}</span>
          <div>
            <div className="font-medium text-gray-900">Messages</div>
            <div className={`text-sm ${getStatusColor(messageStatus)}`}>
              {getStatusText(messageStatus)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getStatusIcon(notificationStatus)}</span>
          <div>
            <div className="font-medium text-gray-900">Notifications</div>
            <div className={`text-sm ${getStatusColor(notificationStatus)}`}>
              {getStatusText(notificationStatus)}
            </div>
          </div>
        </div>
      </div>

      {(messageError || notificationError) && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <h5 className="font-medium text-red-800 mb-2">Connection Issues:</h5>
          {messageError && (
            <p className="text-sm text-red-600">Messages: {messageError.message}</p>
          )}
          {notificationError && (
            <p className="text-sm text-red-600">Notifications: {notificationError.message}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default RealtimeStatus;