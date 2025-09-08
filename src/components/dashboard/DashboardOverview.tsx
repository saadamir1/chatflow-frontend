"use client";

import React from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { MY_NOTIFICATIONS, MY_ROOMS } from "../../graphql/operations";
import { useAuth } from "../../contexts/AuthContext";
import RealtimeStatus from "../common/RealtimeStatus";

const DashboardOverview = () => {
  const { user, logout } = useAuth();
  
  // Get real data from backend
  const { data: notificationsData, loading: notificationsLoading } = useQuery(MY_NOTIFICATIONS, { errorPolicy: 'ignore' });
  const { data: roomsData, loading: roomsLoading } = useQuery(MY_ROOMS, { errorPolicy: 'ignore' });
  
  const unreadNotifications = (notificationsData?.myNotifications || []).filter((n: any) => !n.read);
  const totalRooms = roomsData?.myRooms?.length || 0;

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">💬</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ChatFlow</h1>
                <p className="text-xs text-gray-500">Team Communication</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard/chat" 
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="mr-2">💬</span>
                Open Chat
              </Link>
              
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {getInitials(user?.firstName, user?.lastName)}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role?.toLowerCase()}
                  </p>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h2>
            {user?.role === 'ADMIN' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                👑 Admin
              </span>
            )}
          </div>
          <p className="text-gray-600 max-w-2xl">
            {user?.role === 'ADMIN' 
              ? 'Manage your team, create channels, and oversee all communications from your admin dashboard.'
              : 'Stay connected with your team through real-time messaging and collaboration tools.'
            }
          </p>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Notifications Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔔</span>
              </div>
              {unreadNotifications.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {unreadNotifications.length}
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {notificationsLoading ? "..." : unreadNotifications.length}
            </h3>
            <p className="text-gray-600 text-sm mb-3">Unread Notifications</p>
            <Link
              href="/dashboard/notifications"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
            >
              View all
              <span className="ml-1">→</span>
            </Link>
          </div>

          {/* Active Chats Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {roomsLoading ? "..." : totalRooms}
            </h3>
            <p className="text-gray-600 text-sm mb-3">Active Chats</p>
            <Link
              href="/dashboard/chat"
              className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
            >
              Open chat
              <span className="ml-1">→</span>
            </Link>
          </div>

          {/* Account Type Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1 capitalize">
              {user?.role?.toLowerCase()}
            </h3>
            <p className="text-gray-600 text-sm mb-3">Account Type</p>
            <Link
              href="/dashboard/profile"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center"
            >
              View profile
              <span className="ml-1">→</span>
            </Link>
          </div>

          {/* Admin Panel Card */}
          {user?.role === 'ADMIN' && (
            <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👑</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">Admin</h3>
              <p className="text-gray-600 text-sm mb-3">System Control</p>
              <Link
                href="/admin/users"
                className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
              >
                Manage Users
                <span className="ml-1">→</span>
              </Link>
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Real-time Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-semibold text-gray-900">Real-time Status</h3>
            </div>
            <RealtimeStatus />
          </div>

          {/* Recent Notifications */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                Recent Notifications
              </h3>
              <Link
                href="/dashboard/notifications"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all
              </Link>
            </div>
            
            <div className="space-y-4">
              {notificationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                </div>
              ) : unreadNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📭</span>
                  </div>
                  <p className="text-gray-500 font-medium">All caught up!</p>
                  <p className="text-gray-400 text-sm">No new notifications</p>
                </div>
              ) : (
                unreadNotifications.slice(0, 4).map((notification: any) => (
                  <div
                    key={notification.id}
                    className="flex items-start space-x-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600">🔔</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-gray-400 text-xs mt-2">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Rooms Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
              Your Chat Rooms
            </h3>
            <Link
              href="/dashboard/chat"
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Open chat app
            </Link>
          </div>
          
          {roomsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent"></div>
            </div>
          ) : totalRooms === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">💬</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No chat rooms yet</h4>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Start your first conversation by creating a channel or sending a direct message.
              </p>
              <Link 
                href="/dashboard/chat" 
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold shadow-sm"
              >
                <span className="mr-2">💬</span>
                Start Your First Chat
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(roomsData?.myRooms || []).slice(0, 8).map((room: any) => (
                <div key={room.id} className="group border border-gray-200 rounded-xl p-4 hover:border-green-300 hover:shadow-sm transition-all">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      room.type === 'CHANNEL' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      <span className="font-semibold">
                        {room.type === 'CHANNEL' ? '#' : '💬'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">
                        {room.name || `Chat with ${room.participants?.find((p: any) => p.id !== user?.id)?.firstName}`}
                      </h4>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-xs mb-4">
                    {room.participants?.length || 0} participants
                  </p>
                  
                  <Link 
                    href="/dashboard/chat" 
                    className="text-green-600 hover:text-green-700 text-sm font-medium group-hover:text-green-700 flex items-center"
                  >
                    Open chat
                    <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              ))}
              
              {totalRooms > 8 && (
                <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-gray-400 transition-colors">
                  <Link
                    href="/dashboard/chat"
                    className="text-center"
                  >
                    <div className="text-gray-400 text-2xl mb-2">+</div>
                    <p className="text-gray-600 font-medium text-sm">
                      View all {totalRooms} rooms
                    </p>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardOverview;