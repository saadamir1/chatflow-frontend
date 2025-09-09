"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useAuth } from "../../../contexts/AuthContext";
import { USERS_QUERY, CREATE_NOTIFICATION } from "../../../graphql/operations";

import AuthGuard from "../../../components/common/AuthGuard";

function AdminUsersContent() {
  const { user } = useAuth();
  const { data, loading, refetch } = useQuery(USERS_QUERY, {
    errorPolicy: "ignore",
  });
  const [createNotification] = useMutation(CREATE_NOTIFICATION, {
    errorPolicy: "all",
    fetchPolicy: "no-cache",
  });
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [notificationText, setNotificationText] = useState("");
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Redirect if not admin
  if (user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">🚫</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-500">
            You need admin privileges to access this page
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  const users = data?.users || [];

  const handleSendNotification = async () => {
    if (!notificationText.trim() || selectedUsers.length === 0) return;
    try {
      const results = [];
      for (const userId of selectedUsers) {
        const result = await createNotification({
          variables: {
            createNotificationInput: {
              title: "Admin Announcement",
              message: notificationText.trim(),
              type: "admin",
              userId: parseFloat(userId.toString()),
            },
          },
        });
        if (result.data?.createNotification) {
          results.push(result.data.createNotification);
        } else {
          console.error("No data returned for user:", userId);
        }
      }

      if (results.length > 0) {
        setNotificationText("");
        setSelectedUsers([]);
        setShowNotificationModal(false);
        alert(`Successfully sent ${results.length} notifications!`);
      } else {
        alert("No notifications were created. Check console for errors.");
      }
    } catch (error) {
      alert(`Failed to send notifications: ${error || "Unknown error"}`);
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map((u: any) => u.id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                👑 Admin - User Management
              </h1>
              <p className="text-gray-600">
                Manage users and send announcements
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowNotificationModal(true)}
                disabled={selectedUsers.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Notification ({selectedUsers.length})
              </button>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Selection Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={selectAllUsers}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Select All ({users.length})
              </button>
              <button
                onClick={clearSelection}
                className="text-gray-600 hover:text-gray-700 text-sm font-medium"
              >
                Clear Selection
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {selectedUsers.length} of {users.length} users selected
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">All Users</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {users.map((user: any) => (
              <div
                key={user.id}
                className={`p-6 hover:bg-gray-50 cursor-pointer ${
                  selectedUsers.includes(user.id)
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  toggleUserSelection(user.id);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleUserSelection(user.id);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                        {user.role === "admin" && (
                          <span className="ml-2 text-red-600 text-sm">
                            👑 Admin
                          </span>
                        )}
                      </h4>
                      <p className="text-gray-600">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === "admin"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                        <span className="text-xs text-gray-500">
                          ID: {user.id}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Registered User</div>
                    <div className="text-xs text-gray-400">Active Account</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Send Notification Modal */}
        {showNotificationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                Send Admin Notification
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Sending to {selectedUsers.length} selected user(s)
              </p>
              <textarea
                value={notificationText}
                onChange={(e) => setNotificationText(e.target.value)}
                placeholder="Enter your announcement message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                rows={4}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSendNotification}
                  disabled={!notificationText.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Send Notification
                </button>
                <button
                  onClick={() => setShowNotificationModal(false)}
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
}

export default function AdminUsers() {
  return (
    <AuthGuard>
      <AdminUsersContent />
    </AuthGuard>
  );
}
