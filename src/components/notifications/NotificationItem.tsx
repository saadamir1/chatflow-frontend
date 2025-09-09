import React, { useState, MouseEvent } from "react";
import "./Notifications.css";

type NotificationType = "success" | "warning" | "error" | "info";

interface Notification {
  id: string | number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string | number | Date;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string | number) => void;
  onDelete: (id: string | number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTime = (timestamp: string | number | Date): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getTypeIcon = (type: NotificationType): string => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      case "info":
      default:
        return "ℹ️";
    }
  };

  const getTypeColor = (type: NotificationType): string => {
    switch (type) {
      case "success":
        return "#28a745";
      case "warning":
        return "#ffc107";
      case "error":
        return "#dc3545";
      case "info":
      default:
        return "#17a2b8";
    }
  };

  const handleToggleRead = (e: MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  const handleDelete = (e: MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  const toggleExpanded = (): void => {
    setIsExpanded(!isExpanded);
    // Mark as read when expanded if it's unread
    if (!isExpanded && !notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      className={`notification-item ${!notification.read ? "unread" : ""} ${
        isExpanded ? "expanded" : ""
      }`}
      onClick={toggleExpanded}
    >
      <div className="notification-main">
        <div className="notification-indicator">
          <span
            className="type-icon"
            style={{ color: getTypeColor(notification.type) }}
          >
            {getTypeIcon(notification.type)}
          </span>
          {!notification.read && <div className="unread-dot"></div>}
        </div>

        <div className="notification-content">
          <div className="notification-header">
            <h4 className="notification-title">{notification.title}</h4>
            <span className="notification-time">
              {formatTime(notification.createdAt)}
            </span>
          </div>

          <p className={`notification-message ${isExpanded ? "expanded" : ""}`}>
            {notification.message}
          </p>

          {isExpanded && (
            <div className="notification-meta">
              <span className="notification-type">
                Type: {notification.type}
              </span>
              <span className="notification-date">
                {new Date(notification.createdAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="notification-actions">
          <button
            className={`read-toggle ${notification.read ? "read" : "unread"}`}
            onClick={handleToggleRead}
            title={notification.read ? "Mark as unread" : "Mark as read"}
          >
            {notification.read ? "📖" : "📧"}
          </button>

          <button
            className="delete-btn"
            onClick={handleDelete}
            title="Delete notification"
          >
            🗑️
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="notification-details">
          <div className="details-content">
            <p>
              <strong>Full message:</strong>
            </p>
            <p>{notification.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;
