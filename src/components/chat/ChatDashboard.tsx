'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useAuth } from '../../contexts/AuthContext';
import { USERS_QUERY } from '../../graphql/operations';

const ChatDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: usersData, loading: usersLoading } = useQuery(USERS_QUERY, { errorPolicy: 'ignore' });
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  if (authLoading || usersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900 font-medium">Loading chat...</p>
        </div>
      </div>
    );
  }

  const users = (usersData?.users || []).filter((u: any) => u.id !== user?.id);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const message = {
      id: Date.now(),
      content: newMessage,
      sender: user,
      createdAt: new Date().toISOString(),
      recipient: selectedUser
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chat</h1>
          <p className="text-gray-600">Connect with your team members</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: '600px' }}>
          <div className="flex h-full">
            {/* Users Sidebar */}
            <div className="w-1/3 border-r border-gray-200 bg-gray-50">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Team Members</h3>
              </div>
              <div className="overflow-y-auto">
                {users.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No other users found
                  </div>
                ) : (
                  users.map((u: any) => (
                    <div
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 ${
                        selectedUser?.id === u.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {u.firstName?.[0]}{u.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {u.firstName} {u.lastName}
                          </h4>
                          <p className="text-sm text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {selectedUser.firstName} {selectedUser.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">Online</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.filter(m => 
                      (m.sender.id === user?.id && m.recipient.id === selectedUser.id) ||
                      (m.sender.id === selectedUser.id && m.recipient.id === user?.id)
                    ).map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender.id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender.id === user?.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender.id === user?.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {messages.filter(m => 
                      (m.sender.id === user?.id && m.recipient.id === selectedUser.id) ||
                      (m.sender.id === selectedUser.id && m.recipient.id === user?.id)
                    ).length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        Start a conversation with {selectedUser.firstName}
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-500">Choose a team member to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatDashboard;