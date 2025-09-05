"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import { useAuth } from "../../contexts/AuthContext";
import {
  USERS_QUERY,
  MY_CHANNELS,
  MY_DIRECT_MESSAGES,
  ROOM_MESSAGES,
  SEND_MESSAGE,
  CREATE_ROOM,
  CREATE_DIRECT_MESSAGE,
  MESSAGE_SUBSCRIPTION,
} from "../../graphql/operations";

const ChatDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [activeTab, setActiveTab] = useState<"channels" | "dms">("channels");

  // Queries
  const { data: usersData } = useQuery(USERS_QUERY);
  const { data: channelsData, refetch: refetchChannels } =
    useQuery(MY_CHANNELS);
  const { data: dmsData, refetch: refetchDMs } = useQuery(MY_DIRECT_MESSAGES);
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
    pollInterval: 2000, // Poll every 2 seconds
    fetchPolicy: "cache-and-network",
  });

  // Mutations
  const [sendMessage] = useMutation(SEND_MESSAGE);
  const [createRoom] = useMutation(CREATE_ROOM);
  const [createDirectMessage] = useMutation(CREATE_DIRECT_MESSAGE);

  // Subscription
  const { data: newMessage } = useSubscription(MESSAGE_SUBSCRIPTION);

  // Data extraction
  const users = (usersData?.users || []).filter((u: any) => u.id !== user?.id);
  const channels = channelsData?.myChannels || [];
  const directMessages = dmsData?.myDirectMessages || [];
  const messages = messagesData?.roomMessages || [];

  // Handle new messages
  useEffect(() => {
    if (newMessage?.messageAdded) {
      console.log("New message received:", newMessage.messageAdded);
      refetchMessages();
    }
  }, [newMessage, refetchMessages]);

  // Debug messages data
  useEffect(() => {
    console.log("Selected room:", selectedRoom);
    console.log("Messages data:", messagesData);
    console.log("Messages:", messages);
    console.log("Messages loading:", messagesLoading);
    console.log("Messages error:", messagesError);
  }, [selectedRoom, messagesData, messages, messagesLoading, messagesError]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const messagesContainer = document.getElementById("messages-container");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-800">
        Loading...
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedRoom) return;

    try {
      await sendMessage({
        variables: {
          sendMessageInput: {
            content: messageText.trim(),
            roomId: parseFloat(selectedRoom.id),
          },
        },
      });
      setMessageText("");
      // Immediately refetch to show the new message
      setTimeout(() => refetchMessages(), 100);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSelectRoom = (room: any) => {
    setSelectedRoom(room);
  };

  const handleStartDM = async (otherUser: any) => {
    try {
      const result = await createDirectMessage({
        variables: { otherUserId: parseFloat(otherUser.id) },
      });
      if (result.data?.createDirectMessage) {
        setSelectedRoom(result.data.createDirectMessage);
        refetchDMs();
      }
    } catch (error) {
      console.error("Error creating DM:", error);
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;
    try {
      await createRoom({
        variables: {
          createRoomInput: {
            name: newChannelName,
            participantIds: [parseFloat(user?.id)],
          },
        },
      });
      setNewChannelName("");
      setShowCreateChannel(false);
      refetchChannels();
    } catch (error) {
      console.error("Error creating channel:", error);
    }
  };

  return (
    <div className="h-screen bg-white flex font-sans">
      {/* Sidebar */}
      <div className="w-80 bg-slate-800 text-white flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white">ChatFlow</h1>
          <p className="text-sm text-slate-300">
            {user?.firstName} {user?.lastName}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab("channels")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "channels"
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            Channels
          </button>
          <button
            onClick={() => setActiveTab("dms")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "dms"
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            Direct Messages
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "channels" ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Channels
                </h3>
                <button
                  onClick={() => setShowCreateChannel(true)}
                  className="text-slate-400 hover:text-white text-lg transition-colors"
                  title="Create Channel"
                >
                  +
                </button>
              </div>
              <div className="space-y-1">
                {channels.map((channel: any) => (
                  <div
                    key={channel.id}
                    onClick={() => handleSelectRoom(channel)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedRoom?.id === channel.id
                        ? "bg-blue-600 text-white"
                        : "hover:bg-slate-700 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="mr-2 text-slate-400">#</span>
                      <span className="text-sm font-medium">
                        {channel.name}
                      </span>
                    </div>
                  </div>
                ))}
                {channels.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">
                    No channels yet
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide">
                Direct Messages
              </h3>
              <div className="space-y-1">
                {directMessages.map((dm: any) => {
                  const otherUser = dm.participants?.find(
                    (p: any) => p.id !== user?.id
                  );
                  return (
                    <div
                      key={dm.id}
                      onClick={() => handleSelectRoom(dm)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedRoom?.id === dm.id
                          ? "bg-blue-600 text-white"
                          : "hover:bg-slate-700 text-slate-200"
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-500 rounded-full mr-3 flex items-center justify-center text-white text-sm font-medium">
                          {otherUser?.firstName?.[0]}
                        </div>
                        <span className="text-sm font-medium">
                          {otherUser?.firstName} {otherUser?.lastName}
                        </span>
                      </div>
                    </div>
                  );
                })}

                <div className="mt-6">
                  <p className="text-xs text-slate-400 mb-3 uppercase tracking-wide">
                    Start conversation with:
                  </p>
                  {users
                    .filter(
                      (u: any) =>
                        !directMessages.some((dm: any) =>
                          dm.participants?.some((p: any) => p.id === u.id)
                        )
                    )
                    .map((u: any) => (
                      <div
                        key={u.id}
                        onClick={() => handleStartDM(u)}
                        className="p-3 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-slate-500 rounded-full mr-3 flex items-center justify-center text-white text-sm font-medium">
                            {u.firstName?.[0]}
                          </div>
                          <span className="text-sm text-slate-300">
                            {u.firstName} {u.lastName}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
              <div className="flex items-center">
                {selectedRoom.type === "CHANNEL" ? (
                  <>
                    <span className="text-xl mr-2 text-gray-600">#</span>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedRoom.name}
                    </h2>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-green-500 rounded-full mr-3 flex items-center justify-center text-white font-medium">
                      {
                        selectedRoom.participants?.find(
                          (p: any) => p.id !== user?.id
                        )?.firstName?.[0]
                      }
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {
                        selectedRoom.participants?.find(
                          (p: any) => p.id !== user?.id
                        )?.firstName
                      }{" "}
                      {
                        selectedRoom.participants?.find(
                          (p: any) => p.id !== user?.id
                        )?.lastName
                      }
                    </h2>
                  </>
                )}
              </div>
            </div>

            {/* Messages */}
            <div
              id="messages-container"
              className="flex-1 overflow-y-auto p-6 bg-gray-50"
            >
              {messagesLoading ? (
                <div className="text-center text-gray-500 mt-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm">Loading messages...</p>
                </div>
              ) : messagesError ? (
                <div className="text-center text-red-500 mt-8">
                  <div className="text-4xl mb-2">⚠️</div>
                  <p className="text-lg font-medium">Error loading messages</p>
                  <p className="text-sm">{messagesError.message}</p>
                  <button
                    onClick={() => refetchMessages()}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <div className="text-4xl mb-2">💬</div>
                  <p className="text-lg font-medium text-gray-700">
                    No messages yet
                  </p>
                  <p className="text-sm text-gray-500">
                    Start the conversation!
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Room ID: {selectedRoom?.id}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message: any) => (
                    <div
                      key={message.id}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {message.sender?.firstName?.[0] || "U"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            {message.sender?.firstName || "Unknown"}{" "}
                            {message.sender?.lastName || "User"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-100 inline-block max-w-2xl">
                          <p className="text-gray-900">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-200 bg-white"
            >
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Message ${
                    selectedRoom.type === "CHANNEL"
                      ? "#" + selectedRoom.name
                      : selectedRoom.participants?.find(
                          (p: any) => p.id !== user?.id
                        )?.firstName
                  }...`}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to ChatFlow
              </h3>
              <p className="text-gray-600">
                Select a channel or start a direct message to begin chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Create New Channel
            </h3>
            <input
              type="text"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="Channel name (e.g., general, marketing)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 text-gray-900 placeholder-gray-500"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleCreateChannel}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateChannel(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-medium transition-colors"
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
