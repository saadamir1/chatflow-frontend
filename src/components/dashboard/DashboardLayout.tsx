"use client";

import React, { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import "./Dashboard.css";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Helper to set active link
  const isActive = (href: string, exact: boolean = false): string => {
    if (exact) {
      return pathname === href ? "active" : "";
    }
    return pathname.startsWith(href) ? "active" : "";
  };

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <h1 className="dashboard-title">Dashboard</h1>
        </div>

        <div className="header-right">
          <div className="user-info">
            <span className="user-name">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="user-role">{user?.role}</span>
          </div>
          <button
            className="logout-button"
            onClick={handleLogout}
            title="Logout"
          >
            🚪
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3>Main</h3>
            <Link
              href="/dashboard"
              className={`nav-link ${isActive("/dashboard", true)}`}
              onClick={closeSidebar}
            >
              <span className="nav-icon">🏠</span>
              Overview
            </Link>
          </div>

          <div className="nav-section">
            <h3>Communication</h3>
            <Link
              href="/dashboard/chat"
              className={`nav-link ${isActive("/dashboard/chat")}`}
              onClick={closeSidebar}
            >
              <span className="nav-icon">💬</span>
              Chat
            </Link>
            <Link
              href="/dashboard/notifications"
              className={`nav-link ${isActive("/dashboard/notifications")}`}
              onClick={closeSidebar}
            >
              <span className="nav-icon">🔔</span>
              Notifications
            </Link>
          </div>

          <div className="nav-section">
            <h3>Account</h3>
            <Link
              href="/dashboard/profile"
              className={`nav-link ${isActive("/dashboard/profile")}`}
              onClick={closeSidebar}
            >
              <span className="nav-icon">👤</span>
              Profile
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
