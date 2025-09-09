"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useAuth } from "../../../contexts/AuthContext";
import {
  USERS_QUERY,
  CREATE_NOTIFICATION,
  MY_CHANNELS,
  MY_ROOMS,
  DELETE_ROOMS,
  WORKSPACES_QUERY,
  WORKSPACE_INVITATIONS,
  DELETE_NOTIFICATION,
  MY_NOTIFICATIONS,
} from "../../../graphql/operations";
import AuthGuard from "../../../components/common/AuthGuard";

interface AdminStats {
  totalUsers: number;
  totalChannels: number;
  totalRooms: number;
  totalWorkspaces: number;
  pendingInvitations: number;
}

function AdminDashboardContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "channels" | "workspaces" | "notifications"
  >("overview");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showModal, setShowModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>({});

  // Queries
  const {
    data: usersData,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useQuery(USERS_QUERY, {
    errorPolicy: "ignore",
  });
  const { data: channelsData, refetch: refetchChannels } = useQuery(
    MY_CHANNELS,
    {
      errorPolicy: "ignore",
    }
  );
  const { data: roomsData, refetch: refetchRooms } = useQuery(MY_ROOMS, {
    errorPolicy: "ignore",
  });
  const { data: workspacesData, refetch: refetchWorkspaces } = useQuery(
    WORKSPACES_QUERY,
    {
      errorPolicy: "ignore",
    }
  );
  const { data: invitationsData } = useQuery(WORKSPACE_INVITATIONS, {
    errorPolicy: "ignore",
  });
  const { data: notificationsData, refetch: refetchNotifications } = useQuery(
    MY_NOTIFICATIONS,
    {
      errorPolicy: "ignore",
    }
  );

  // Mutations
  const [createNotification] = useMutation(CREATE_NOTIFICATION, {
    errorPolicy: "all",
    fetchPolicy: "no-cache",
  });
  const [deleteRooms] = useMutation(DELETE_ROOMS, {
    errorPolicy: "all",
  });
  const [deleteNotification] = useMutation(DELETE_NOTIFICATION, {
    errorPolicy: "all",
  });

  // Admin access check
  if (user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">🚫</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-500">Admin privileges required</p>
        </div>
      </div>
    );
  }

  const stats: AdminStats = {
    totalUsers: usersData?.users?.length || 0,
    totalChannels: channelsData?.myChannels?.length || 0,
    totalRooms: roomsData?.myRooms?.length || 0,
    totalWorkspaces: workspacesData?.workspaces?.length || 0,
    pendingInvitations:
      invitationsData?.workspaceInvitations?.filter(
        (inv: any) => inv.status === "PENDING"
      )?.length || 0,
  };

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) return;

    try {
      switch (action) {
        case "delete_channels":
          await deleteRooms({
            variables: {
              deleteRoomsInput: { roomIds: selectedItems },
            },
          });
          refetchChannels();
          break;
        case "send_notification":
          setShowModal("notification");
          return;
        case "delete_notifications":
          for (const id of selectedItems) {
            await deleteNotification({ variables: { id } });
          }
          refetchNotifications();
          break;
      }
      setSelectedItems([]);
      alert(`Successfully completed ${action}`);
    } catch (error) {
      alert(`Failed to ${action}: ${error}`);
    }
  };

  const sendBulkNotification = async () => {
    if (!modalData.message?.trim()) return;

    try {
      const promises = selectedItems.map((userId) =>
        createNotification({
          variables: {
            createNotificationInput: {
              title: modalData.title || "Admin Announcement",
              message: modalData.message.trim(),
              type: "admin",
              userId: parseFloat(userId.toString()),
            },
          },
        })
      );

      await Promise.all(promises);
      setShowModal(null);
      setModalData({});
      setSelectedItems([]);
      alert(`Notification sent to ${selectedItems.length} users!`);
    } catch (error) {
      alert(`Failed to send notifications: ${error}`);
    }
  };

  const StatCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: number;
    icon: string;
    color: string;
  }) => (
    <div className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );

  const DataTable = ({
    data,
    type,
    onSelect,
  }: {
    data: any[];
    type: string;
    onSelect: (id: number) => void;
  }) => {
    if (!data?.length)
      return (
        <div className="p-8 text-center text-gray-500">No {type} found</div>
      );

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(data.map((item: any) => item.id));
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                  className="h-4 w-4 text-blue-600 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => onSelect(item.id)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </td>
                <td className="px-6 py-4">
                  {type === "users" && (
                    <div>
                      <div className="font-medium">
                        {item.firstName} {item.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{item.email}</div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.role === "ADMIN"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {item.role}
                      </span>
                    </div>
                  )}
                  {type === "channels" && (
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        {item.isPrivate ? "🔒 Private" : "🌐 Public"} •{" "}
                        {item.participants?.length || 0} members
                      </div>
                      <div className="text-xs text-gray-400">
                        {item.description}
                      </div>
                    </div>
                  )}
                  {type === "workspaces" && (
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">/{item.slug}</div>
                      <div className="text-xs text-gray-400">
                        {item.description}
                      </div>
                    </div>
                  )}
                  {type === "notifications" && (
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-gray-500">
                        {item.message}
                      </div>
                      <div className="text-xs text-gray-400">
                        {item.type} •{" "}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-900 text-sm">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (usersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            👑 Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Complete system administration and control
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: "overview", name: "Overview", icon: "📊" },
              { id: "users", name: "Users", icon: "👥" },
              { id: "channels", name: "Channels", icon: "💬" },
              { id: "workspaces", name: "Workspaces", icon: "🏢" },
              { id: "notifications", name: "Notifications", icon: "🔔" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon="👥"
                color="border-blue-500"
              />
              <StatCard
                title="Channels"
                value={stats.totalChannels}
                icon="💬"
                color="border-green-500"
              />
              <StatCard
                title="Workspaces"
                value={stats.totalWorkspaces}
                icon="🏢"
                color="border-purple-500"
              />
              <StatCard
                title="Pending Invites"
                value={stats.pendingInvitations}
                icon="📧"
                color="border-orange-500"
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowModal("notification")}
                  className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center"
                >
                  <div className="text-2xl mb-2">📢</div>
                  <div className="text-sm font-medium">Broadcast</div>
                </button>
                <button
                  onClick={() => refetchUsers()}
                  className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-center"
                >
                  <div className="text-2xl mb-2">🔄</div>
                  <div className="text-sm font-medium">Refresh Data</div>
                </button>
                <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center">
                  <div className="text-2xl mb-2">📈</div>
                  <div className="text-sm font-medium">Analytics</div>
                </button>
                <button className="p-4 bg-red-50 hover:bg-red-100 rounded-lg text-center">
                  <div className="text-2xl mb-2">⚙️</div>
                  <div className="text-sm font-medium">Settings</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">User Management</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction("send_notification")}
                  disabled={selectedItems.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Send Notification ({selectedItems.length})
                </button>
                <button
                  onClick={() => refetchUsers()}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Refresh
                </button>
              </div>
            </div>
            <DataTable
              data={usersData?.users || []}
              type="users"
              onSelect={(id) => {
                setSelectedItems((prev) =>
                  prev.includes(id)
                    ? prev.filter((i) => i !== id)
                    : [...prev, id]
                );
              }}
            />
          </div>
        )}

        {/* Channels Tab */}
        {activeTab === "channels" && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Channel Management</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction("delete_channels")}
                  disabled={selectedItems.length === 0}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Delete Selected ({selectedItems.length})
                </button>
                <button
                  onClick={() => refetchChannels()}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Refresh
                </button>
              </div>
            </div>
            <DataTable
              data={channelsData?.myChannels || []}
              type="channels"
              onSelect={(id) => {
                setSelectedItems((prev) =>
                  prev.includes(id)
                    ? prev.filter((i) => i !== id)
                    : [...prev, id]
                );
              }}
            />
          </div>
        )}

        {/* Workspaces Tab */}
        {activeTab === "workspaces" && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Workspace Management</h3>
              <button
                onClick={() => refetchWorkspaces()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Refresh
              </button>
            </div>
            <DataTable
              data={workspacesData?.workspaces || []}
              type="workspaces"
              onSelect={(id) => {
                setSelectedItems((prev) =>
                  prev.includes(id)
                    ? prev.filter((i) => i !== id)
                    : [...prev, id]
                );
              }}
            />
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Notification Management</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction("delete_notifications")}
                  disabled={selectedItems.length === 0}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Delete Selected ({selectedItems.length})
                </button>
                <button
                  onClick={() => refetchNotifications()}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Refresh
                </button>
              </div>
            </div>
            <DataTable
              data={notificationsData?.myNotifications || []}
              type="notifications"
              onSelect={(id) => {
                setSelectedItems((prev) =>
                  prev.includes(id)
                    ? prev.filter((i) => i !== id)
                    : [...prev, id]
                );
              }}
            />
          </div>
        )}

        {/* Edit Modal */}
        {showModal === "edit" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                Edit {modalData.type}
              </h3>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Edit functionality requires update mutations that are not
                  available in the provided backend APIs.
                </p>
                <div className="text-sm text-gray-500">
                  Available update mutations needed:
                  <ul className="list-disc list-inside mt-2">
                    <li>updateUser</li>
                    <li>updateChannel/updateRoom</li>
                    <li>updateWorkspace</li>
                    <li>updateNotification</li>
                  </ul>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(null);
                    setModalData({});
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
                <button
                  onClick={handleEdit}
                  disabled={true}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Save Changes (Disabled)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Modal */}
        {showModal === "notification" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                Send Admin Notification
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Notification title..."
                  value={modalData.title || ""}
                  onChange={(e) =>
                    setModalData({ ...modalData, title: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Message content..."
                  value={modalData.message || ""}
                  onChange={(e) =>
                    setModalData({ ...modalData, message: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
                <p className="text-sm text-gray-600">
                  {selectedItems.length > 0
                    ? `Sending to ${selectedItems.length} selected users`
                    : "No users selected"}
                </p>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(null);
                    setModalData({});
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={sendBulkNotification}
                  disabled={
                    !modalData.message?.trim() || selectedItems.length === 0
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Send Notification
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AuthGuard>
      <AdminDashboardContent />
    </AuthGuard>
  );
}
