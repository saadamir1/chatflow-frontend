'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { useAuth } from '../../contexts/AuthContext';
import { 
  USERS_QUERY, 
  MY_ROOMS, 
  ROOM_MESSAGES, 
  SEND_MESSAGE, 
  CREATE_ROOM, 
  MESSAGE_SUBSCRIPTION,
  CREATE_NOTIFICATION 
} from '../../graphql/operations';

const ChatDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: usersData, loading: usersLoading } = useQuery(USERS_QUERY, { errorPolicy: 'ignore' });
  const { data: roomsData, loading: roomsLoading, refetch: refetchRooms } = useQuery(MY_ROOMS, { errorPolicy: 'ignore' });
  const { data: newMessage } = useSubscription(MESSAGE_SUBSCRIPTION);
  
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [chatType, setChatType] = useState<'room' | 'direct'>('room');
  const [newMessageText, setNewMessageText] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [unreadCounts, setUnreadCounts] = useState<{[key: string]: number}>({});

  // Get room messages
  const { data: messagesData, loading: messagesLoading, refetch: refetchMessages } = useQuery(ROOM_MESSAGES, {
    variables: { roomId: selectedRoom?.id },
    skip: !selectedRoom || chatType !== 'room',
    errorPolicy: 'ignore'
  });

  const [sendMessage] = useMutation(SEND_MESSAGE, { errorPolicy: 'ignore' });
  const [createRoom] = useMutation(CREATE_ROOM, { errorPolicy: 'ignore' });
  const [createNotification] = useMutation(CREATE_NOTIFICATION, { errorPolicy: 'ignore' });

  // Handle new messages from subscription
  useEffect(() => {
    if (newMessage?.messageAdded) {
      const msg = newMessage.messageAdded;
      
      // If message is for current room, refetch messages
      if (selectedRoom && msg.roomId === selectedRoom.id) {
        refetchMessages();
      } else {
        // Update unread count for other rooms
        setUnreadCounts(prev => ({
          ...prev,
          [`room_${msg.roomId}`]: (prev[`room_${msg.roomId}`] || 0) + 1
        }));
      }

      // Create notification for message recipient
      if (msg.senderId !== user?.id) {
        createNotification({
          variables: {
            title: 'New Message',
            message: `${msg.sender?.firstName}: ${msg.content}`,
            type: 'message',
            userId: user?.id
          }
        }).catch(() => {});
      }
    }
  }, [newMessage, selectedRoom, refetchMessages, user?.id, createNotification]);

  if (authLoading || usersLoading || roomsLoading) {
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
  const rooms = roomsData?.myRooms || [];
  const messages = messagesData?.roomMessages || [];

  // Use only real rooms from database
  const allChannels = rooms.map(room => ({
    ...room,
    name: `# ${room.name}`,
    description: `${room.name} discussion room`,
    type: 'public'
  }));

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedRoom) return;

    try {
      const result = await sendMessage({
        variables: {
          content: newMessageText.trim(),
          roomId: selectedRoom.id
        }
      });
      
      console.log('Message sent:', result);
      setNewMessageText('');
      
      // Immediately refetch messages to show the new message
      await refetchMessages();
      
      // Clear unread count for current room
      setUnreadCounts(prev => ({
        ...prev,
        [`room_${selectedRoom.id}`]: 0
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleSelectRoom = (room: any) => {
    console.log('Selecting room:', room);
    setSelectedRoom(room);
    setSelectedUser(null);
    setChatType('room');
    // Clear unread count
    setUnreadCounts(prev => ({
      ...prev,
      [`room_${room.id}`]: 0
    }));
  };

  const handleSelectUser = async (selectedUser: any) => {
    try {
      const result = await createRoom({
        variables: {
          name: `dm-${user?.id}-${selectedUser.id}`,
          participantIds: [user?.id, selectedUser.id]
        }
      });
      
      if (result.data?.createRoom) {
        setSelectedRoom(result.data.createRoom);
        setSelectedUser(selectedUser);
        setChatType('direct');
      }
    } catch (error) {
      console.error('Error creating DM room:', error);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    
    try {
      await createRoom({
        variables: {
          name: newRoomName,
          participantIds: [user?.id]
        }
      });
      setNewRoomName('');
      setShowCreateRoom(false);
      refetchRooms();
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ChatFlow Team {user?.role === 'ADMIN' && <span className="text-red-600 text-sm">(Admin)</span>}
          </h1>
          <p className="text-gray-600">Professional team collaboration platform</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: '700px' }}>
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
              {/* Channels Section */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Channels</h3>
                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={() => setShowCreateRoom(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Create
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  {allChannels.map((room: any) => (
                    <div
                      key={room.id}
                      onClick={() => handleSelectRoom(room)}
                      className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                        selectedRoom?.id === room.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 flex items-center">
                            {room.name}
                            {room.type === 'private' && <span className="ml-1 text-orange-500">🔒</span>}
                            {room.type === 'admin' && <span className="ml-1 text-red-500">👑</span>}
                          </div>
                          {room.description && (
                            <div className="text-xs text-gray-500">{room.description}</div>
                          )}
                        </div>
                        {unreadCounts[`room_${room.id}`] > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {unreadCounts[`room_${room.id}`]}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Messages Section */}
              <div className="p-4 flex-1">
                <h3 className="font-semibold text-gray-900 mb-3">Direct Messages</h3>
                <div className="space-y-1">
                  {users.length === 0 ? (
                    <div className="text-sm text-gray-500">No other users found</div>
                  ) : (
                    users.map((u: any) => (
                      <div
                        key={u.id}
                        onClick={() => handleSelectUser(u)}
                        className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                          selectedUser?.id === u.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {u.firstName?.[0]}{u.lastName?.[0]}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">
                              {u.firstName} {u.lastName}
                              {u.role === 'admin' && <span className="ml-1 text-red-500 text-xs">👑</span>}
                            </div>
                            <div className="text-xs text-gray-500">{u.email}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedRoom || selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {selectedRoom ? (
                          <>
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold">#</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{selectedRoom.name}</h3>
                              <p className="text-sm text-gray-500">
                                {selectedRoom.description || 'Team channel'}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {selectedUser.firstName} {selectedUser.lastName}
                              </h3>
                              <p className="text-sm text-gray-500">Direct Message</p>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedRoom && `${messages.length} messages`}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messagesLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-500">Loading messages...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        {selectedRoom 
                          ? `Start the conversation in ${selectedRoom.name}`
                          : `Start your conversation with ${selectedUser?.firstName}`
                        }
                      </div>
                    ) : (
                      messages.map((message: any) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                            {message.senderId !== user?.id && (
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-medium">
                                  {message.sender?.firstName?.[0]}{message.sender?.lastName?.[0]}
                                </span>
                              </div>
                            )}
                            <div
                              className={`px-4 py-2 rounded-lg ${
                                message.senderId === user?.id
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              {message.senderId !== user?.id && (
                                <div className="text-xs font-medium mb-1">
                                  {message.sender?.firstName} {message.sender?.lastName}
                                </div>
                              )}
                              <p>{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {new Date(message.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        placeholder={`Message ${selectedRoom ? selectedRoom.name : selectedUser?.firstName}...`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={!newMessageText.trim()}
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to ChatFlow</h3>
                    <p className="text-gray-500 mb-4">Select a channel to start collaborating</p>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>• Join channels to collaborate with your team</p>
                      <p>• Messages are permanently saved in database</p>
                      <p>• Real-time notifications for new messages</p>
                      {user?.role === 'ADMIN' && <p>• Admin privileges: Create channels & manage users</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create Room Modal */}
        {showCreateRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Create New Channel</h3>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Channel name (e.g., marketing-team)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateRoom}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Channel
                </button>
                <button
                  onClick={() => setShowCreateRoom(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDashboard;