"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import { useAuth } from "../../contexts/AuthContext";
import {
  USERS_QUERY,
  MY_CHANNELS,
  DISCOVER_CHANNELS,
  MY_DIRECT_MESSAGES,
  ROOM_MESSAGES,
  SEND_MESSAGE,
  CREATE_ROOM,
  CREATE_DIRECT_MESSAGE,
  MESSAGE_SUBSCRIPTION,
  REQUEST_JOIN,
  DELETE_ROOMS,
} from "../../graphql/operations";

const ChatDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"channels" | "dms" | "discover">("channels");
  const [manageMode, setManageMode] = useState(false);
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Queries with error handling and loading states
  const { data: usersData, loading: usersLoading } = useQuery(USERS_QUERY, {
    errorPolicy: 'all'
  });
  const { data: channelsData, refetch: refetchChannels, loading: channelsLoading } = useQuery(MY_CHANNELS, {
    errorPolicy: 'all',
    pollInterval: 30000
  });
  const { data: dmsData, refetch: refetchDMs, loading: dmsLoading } = useQuery(MY_DIRECT_MESSAGES, {
    errorPolicy: 'all',
    pollInterval: 30000
  });
  const { data: discoverData, refetch: refetchDiscover, loading: discoverLoading } = useQuery(DISCOVER_CHANNELS, {
    errorPolicy: 'all',
    pollInterval: 60000
  });
  const {
    data: messagesData,
    refetch: refetchMessages,
    loading: messagesLoading,
    error: messagesError,
  } = useQuery(ROOM_MESSAGES, {
    variables: {
      roomId: selectedRoom?.id ? parseFloat(selectedRoom.id) : null,
    },
    skip: !selectedRoom,
    pollInterval: 5000,
    fetchPolicy: "cache-and-network",
    errorPolicy: 'all'
  });

  // Mutations
  const [sendMessage, { loading: sendingMessage }] = useMutation(SEND_MESSAGE, {
    errorPolicy: 'all',
    onCompleted: () => {
      setMessageText("");
      setTimeout(() => refetchMessages(), 500);
      messageInputRef.current?.focus();
    }
  });
  const [createRoom, { loading: creatingRoom }] = useMutation(CREATE_ROOM, {
    errorPolicy: 'all'
  });
  const [createDirectMessage, { loading: creatingDM }] = useMutation(CREATE_DIRECT_MESSAGE, {
    errorPolicy: 'all'
  });
  const [deleteRooms, { loading: deletingRooms }] = useMutation(DELETE_ROOMS, {
    errorPolicy: 'all',
    onCompleted: async () => {
      setSelectedChannelIds([]);
      await Promise.all([refetchChannels(), refetchDiscover()]);
    }
  });
  const [requestJoin, { loading: requestingJoin }] = useMutation(REQUEST_JOIN, {
    errorPolicy: 'all',
    onCompleted: () => {
      refetchDiscover();
    }
  });

  // Subscription for real-time messages
  const { data: newMessage } = useSubscription(MESSAGE_SUBSCRIPTION, {
    variables: { roomId: selectedRoom?.id ? parseFloat(selectedRoom.id) : null },
    skip: !selectedRoom
  });

  // Data processing
  const users = (usersData?.users || []).filter((u: any) => u.id !== user?.id);
  const channels = channelsData?.myChannels || [];
  const directMessages = dmsData?.myDirectMessages || [];
  const discoverChannels = discoverData?.discoverChannels || [];
  const messages = messagesData?.roomMessages || [];

  // Filter functionality
  const filteredChannels = channels.filter((channel: any) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const toggleSelectChannel = (id: string) => {
    setSelectedChannelIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteSelectedChannels = async () => {
    if (selectedChannelIds.length === 0 || deletingRooms) return;
    try {
      await deleteRooms({ variables: { deleteRoomsInput: { roomIds: selectedChannelIds.map((x) => parseFloat(x)) } } });
    } catch (e) {
      console.error('Failed to delete channels', e);
    }
  };

  const filteredDMs = directMessages.filter((dm: any) => {
    const otherUser = dm.participants?.find((p: any) => p.id !== user?.id);
    const fullName = `${otherUser?.firstName || ""} ${otherUser?.lastName || ""}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle real-time messages
  useEffect(() => {
    if (newMessage?.messageAdded && selectedRoom) {
      refetchMessages();
    }
  }, [newMessage, selectedRoom, refetchMessages]);

  // Focus input when room is selected
  useEffect(() => {
    if (selectedRoom && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [selectedRoom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedRoom || sendingMessage) return;

    try {
      await sendMessage({
        variables: {
          sendMessageInput: {
            content: messageText.trim(),
            roomId: parseFloat(selectedRoom.id),
          },
        },
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleSelectRoom = (room: any) => {
    setSelectedRoom(room);
    setShowUserList(false);
  };

  const handleStartDM = async (otherUser: any) => {
    try {
      const result = await createDirectMessage({
        variables: { otherUserId: parseFloat(otherUser.id) },
      });
      if (result.data?.createDirectMessage) {
        setSelectedRoom(result.data.createDirectMessage);
        setActiveTab("dms");
        refetchDMs();
        setShowUserList(false);
      }
    } catch (error) {
      console.error("Failed to create direct message:", error);
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim() || creatingRoom) return;
    
    try {
      const result = await createRoom({
        variables: {
          createRoomInput: {
            name: newChannelName.trim(),
            participantIds: [parseFloat(user?.id)],
          },
        },
      });
      
      if (result.data?.createRoom) {
        setNewChannelName("");
        setShowCreateChannel(false);
        refetchChannels();
        setSelectedRoom(result.data.createRoom);
        setActiveTab("channels");
      }
    } catch (error) {
      console.error("Failed to create channel:", error);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const isMyMessage = (message: any) => message.sender?.id === user?.id;

  const getOtherUser = (room: any) => {
    return room.participants?.find((p: any) => p.id !== user?.id);
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading ChatFlow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">💬</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ChatFlow</h1>
              <p className="text-xs text-gray-500">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">🔍</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("channels")}
            className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors ${
              activeTab === "channels"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            # Channels
            {channels.length > 0 && (
              <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                {channels.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("dms")}
            className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors ${
              activeTab === "dms"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            💬 Messages
            {directMessages.length > 0 && (
              <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                {directMessages.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("discover")}
            className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors ${
              activeTab === "discover"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            🔎 Discover
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "channels" ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Channels</h3>
                <div className="flex items-center gap-2">
                  {user?.id && (
                    <button
                      onClick={() => setManageMode((m) => !m)}
                      className={`px-3 py-1.5 text-sm rounded-lg border ${manageMode ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      {manageMode ? 'Done' : 'Manage'}
                    </button>
                  )}
                  <button
                    onClick={() => setShowCreateChannel(true)}
                    className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors"
                    title="Create Channel"
                  >
                    <span className="text-lg font-bold">+</span>
                  </button>
                </div>
              </div>

              {manageMode && selectedChannelIds.length > 0 && (
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-600">Selected: {selectedChannelIds.length}</span>
                  <button
                    onClick={handleDeleteSelectedChannels}
                    disabled={deletingRooms}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50"
                  >
                    {deletingRooms ? 'Deleting...' : 'Delete selected'}
                  </button>
                </div>
              )}

              {channelsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-3 p-3 rounded-lg">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    </div>
                  ))}
                </div>
              ) : filteredChannels.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-gray-400 text-xl">#</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    {searchQuery ? "No channels found" : "No channels yet"}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => setShowCreateChannel(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Create your first channel
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredChannels.map((channel: any) => (
                    <div
                      key={channel.id}
                      onClick={() => !manageMode && handleSelectRoom(channel)}
                      className={`flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                        selectedRoom?.id === channel.id
                          ? "bg-blue-100 text-blue-900 border-l-4 border-blue-600"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {manageMode && channel.adminId === user?.id && (
                        <input
                          type="checkbox"
                          checked={selectedChannelIds.includes(channel.id)}
                          onChange={() => toggleSelectChannel(channel.id)}
                          className="mr-3"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                        selectedRoom?.id === channel.id ? "bg-blue-200" : "bg-gray-100"
                      }`}>
                        <span className="text-sm font-semibold">#</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{channel.name}</p>
                        <p className="text-xs text-gray-500">
                          {channel.participants?.length || 0} members
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === "dms" ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Direct Messages</h3>
                <button
                  onClick={() => setShowUserList(true)}
                  className="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center transition-colors"
                  title="Start New Message"
                >
                  <span className="text-lg font-bold">+</span>
                </button>
              </div>

              {dmsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-3 p-3 rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredDMs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-gray-400 text-xl">💬</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    {searchQuery ? "No conversations found" : "No messages yet"}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => setShowUserList(true)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Start a conversation
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredDMs.map((dm: any) => {
                    const otherUser = getOtherUser(dm);
                    return (
                      <div
                        key={dm.id}
                        onClick={() => handleSelectRoom(dm)}
                        className={`flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                          selectedRoom?.id === dm.id
                            ? "bg-green-100 text-green-900 border-l-4 border-green-600"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <div className="relative mr-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                            selectedRoom?.id === dm.id ? "bg-green-600" : "bg-gray-400"
                          }`}>
                            {getInitials(otherUser?.firstName, otherUser?.lastName)}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {otherUser?.firstName} {otherUser?.lastName}
                          </p>
                          <p className="text-xs text-green-500">Online</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Discover channels</h3>
              </div>

              {discoverLoading ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="animate-pulse flex items-center space-x-3 p-3 rounded-lg">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    </div>
                  ))}
                </div>
              ) : discoverChannels.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">No channels to discover.</div>
              ) : (
                <div className="space-y-2">
                  {discoverChannels
                    .filter((c: any) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-200 bg-white">
                        <div>
                          <p className="text-sm font-medium text-gray-900">#{c.name}</p>
                          {c.description && <p className="text-xs text-gray-500">{c.description}</p>}
                        </div>
                        <button
                          disabled={requestingJoin}
                          onClick={() => requestJoin({ variables: { requestJoinInput: { roomId: parseFloat(c.id) } } })}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
                        >
                          Request to join
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {selectedRoom.type === "CHANNEL" ? (
                    <>
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-lg">#</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {selectedRoom.name}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {selectedRoom.participants?.length || 0} members
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-semibold">
                          {getInitials(
                            getOtherUser(selectedRoom)?.firstName,
                            getOtherUser(selectedRoom)?.lastName
                          )}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {getOtherUser(selectedRoom)?.firstName} {getOtherUser(selectedRoom)?.lastName}
                        </h2>
                        <p className="text-sm text-green-500 font-medium">Online</p>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <span className="text-lg">📞</span>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <span className="text-lg">📹</span>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <span className="text-lg">ℹ️</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-gray-500">Loading messages...</p>
                  </div>
                </div>
              ) : messagesError ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center bg-white rounded-xl p-8 border border-red-200">
                    <div className="text-red-500 text-3xl mb-3">⚠️</div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">Unable to load messages</p>
                    <p className="text-sm text-gray-500 mb-4">{messagesError.message}</p>
                    <button
                      onClick={() => refetchMessages()}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center bg-white rounded-xl p-8 border border-gray-200">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">👋</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {selectedRoom.type === "CHANNEL"
                        ? `Welcome to #${selectedRoom.name}`
                        : "Start your conversation"}
                    </h3>
                    <p className="text-gray-500">
                      {selectedRoom.type === "CHANNEL"
                        ? "This is the beginning of the channel."
                        : "Send your first message to get started."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message: any, index: number) => {
                    const isMine = isMyMessage(message);
                    const prevMessage = index > 0 ? messages[index - 1] : null;
                    const showAvatar = !prevMessage || prevMessage.sender?.id !== message.sender?.id;
                    const showTimestamp = !prevMessage || 
                      (new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime()) > 300000;

                    return (
                      <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`flex items-end space-x-2 max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl ${
                          isMine ? "flex-row-reverse space-x-reverse" : "flex-row"
                        }`}>
                          {!isMine && showAvatar ? (
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                              {getInitials(message.sender?.firstName, message.sender?.lastName)}
                            </div>
                          ) : !isMine ? (
                            <div className="w-8 flex-shrink-0"></div>
                          ) : null}

                          <div className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                            {showTimestamp && (
                              <div className={`flex items-center space-x-2 mb-1 ${
                                isMine ? "flex-row-reverse space-x-reverse" : "flex-row"
                              }`}>
                                {!isMine && (
                                  <span className="text-sm font-medium text-gray-900">
                                    {message.sender?.firstName} {message.sender?.lastName}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  {formatTime(message.createdAt)}
                                </span>
                              </div>
                            )}

                            <div
                              className={`px-4 py-2.5 rounded-2xl break-words ${
                                isMine
                                  ? "bg-blue-600 text-white"
                                  : "bg-white border border-gray-200 text-gray-900"
                              } ${showAvatar ? "" : "mt-1"}`}
                              style={{
                                borderTopLeftRadius: isMine || !showAvatar ? "1rem" : "0.375rem",
                                borderTopRightRadius: !isMine || !showAvatar ? "1rem" : "0.375rem",
                              }}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="px-6 py-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-end space-x-4">
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-lg">📎</span>
                </button>
                
                <div className="flex-1">
                  <div className="relative">
                    <input
                      ref={messageInputRef}
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder={`Message ${
                        selectedRoom.type === "CHANNEL"
                          ? "#" + selectedRoom.name
                          : getOtherUser(selectedRoom)?.firstName
                      }...`}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      disabled={sendingMessage}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <span className="text-lg">😊</span>
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={!messageText.trim() || sendingMessage}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors flex items-center space-x-2"
                >
                  {sendingMessage ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Send</span>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-200">
                <span className="text-4xl">💬</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to ChatFlow</h3>
              <p className="text-gray-500 leading-relaxed mb-6">
                Select a channel from the sidebar or start a direct message to begin your conversation.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowCreateChannel(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  # Create Channel
                </button>
                <button
                  onClick={() => setShowUserList(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  💬 New Message
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl font-bold">#</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Create New Channel</h3>
              <p className="text-gray-500 text-sm">Channels are where your team communicates.</p>
            </div>

            <form onSubmit={handleCreateChannel}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Channel name
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-semibold">
                    #
                  </span>
                  <input
                    type="text"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="e.g. general, marketing, random"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={creatingRoom}
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={!newChannelName.trim() || creatingRoom}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {creatingRoom ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Channel</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateChannel(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 font-semibold transition-colors"
                  disabled={creatingRoom}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User List Modal */}
      {showUserList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl max-h-96 flex flex-col">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Start New Message</h3>
              <p className="text-gray-500 text-sm">Choose someone to start a conversation with.</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {usersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-3 p-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No other users available</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {users
                    .filter((u: { id: any; }) => !directMessages.some((dm: { participants: any[]; }) => 
                      dm.participants?.some(p => p.id === u.id)
                    ))
                    .map((u: any) => (
                      <div
                        key={u.id}
                        onClick={() => handleStartDM(u)}
                        className="flex items-center p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                          {getInitials(u.firstName, u.lastName)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-sm text-green-500">Online</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowUserList(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 font-semibold transition-colors"
                disabled={creatingDM}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatDashboard;