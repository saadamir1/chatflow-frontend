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
  const { data: notificationsData } = useQuery(MY_NOTIFICATIONS, { errorPolicy: 'ignore' });
  const { data: roomsData } = useQuery(MY_ROOMS, { errorPolicy: 'ignore' });
  
  const unreadNotifications = (notificationsData?.myNotifications || []).filter((n: any) => !n.read);
  const totalRooms = roomsData?.myRooms?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CF</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">ChatFlow</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-medium">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </span>
                </div>
                <span className="text-sm text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}! 👋
            {user?.role === 'ADMIN' && (
              <span className="text-red-600 text-lg ml-2">👑 Admin</span>
            )}
          </h2>
          <p className="text-gray-600">
            {user?.role === 'ADMIN' 
              ? 'Manage your team, create channels, and oversee all communications.'
              : 'Collaborate with your team and stay connected with real-time messaging.'
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className={`grid grid-cols-1 ${user?.role === 'ADMIN' ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6 mb-8`}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔔</span>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-2xl font-bold text-gray-900">
                  {unreadNotifications.length}
                </h3>
                <p className="text-gray-600">Unread Notifications</p>
                <Link
                  href="/dashboard/notifications"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all →
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-2xl font-bold text-gray-900">
                  {totalRooms}
                </h3>
                <p className="text-gray-600">Active Chats</p>
                <Link
                  href="/dashboard/chat"
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  Open chat →
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-2xl font-bold text-gray-900 capitalize">
                  {user?.role?.toLowerCase()}
                </h3>
                <p className="text-gray-600">Account Type</p>
                <Link
                  href="/dashboard/profile"
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  View profile →
                </Link>
              </div>
            </div>
          </div>

          {/* Admin-only Stats */}
          {user?.role === 'ADMIN' && (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👑</span>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">Admin</h3>
                  <p className="text-gray-600">System Control</p>
                  <Link
                    href="/admin/users"
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Manage Users →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Real-time Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📡</span>
              Real-time Status
            </h3>
            <RealtimeStatus />
          </div>

          {/* Recent Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🔔</span>
              Recent Notifications
            </h3>
            <div className="space-y-3">
              {unreadNotifications.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No unread notifications
                </p>
              ) : (
                unreadNotifications.slice(0, 3).map((notification: any) => (
                  <div
                    key={notification.id}
                    className="border-l-4 border-blue-500 pl-4 py-2"
                  >
                    <h4 className="font-medium text-gray-900">
                      {notification.title}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {notification.message}
                    </p>
                    <small className="text-gray-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </small>
                  </div>
                ))
              )}
              {unreadNotifications.length > 3 && (
                <Link
                  href="/dashboard/notifications"
                  className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium pt-2"
                >
                  View {unreadNotifications.length - 3} more notifications →
                </Link>
              )}
            </div>
          </div>

          {/* Chat Rooms */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">💬</span>
              Your Chat Rooms
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {totalRooms === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500 mb-4">No chat rooms yet</p>
                  <Link 
                    href="/dashboard/chat" 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Your First Chat
                  </Link>
                </div>
              ) : (
                (roomsData?.myRooms || []).slice(0, 6).map((room: any) => (
                  <div key={room.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <h4 className="font-medium text-gray-900 mb-2">{room.name}</h4>
                    <p className="text-gray-600 text-sm mb-3">
                      {room.participants?.length || 0} participants
                    </p>
                    <Link 
                      href="/dashboard/chat" 
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Open chat →
                    </Link>
                  </div>
                ))
              )}
            </div>
            {totalRooms > 6 && (
              <div className="text-center mt-6">
                <Link
                  href="/dashboard/chat"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all {totalRooms} rooms →
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardOverview;