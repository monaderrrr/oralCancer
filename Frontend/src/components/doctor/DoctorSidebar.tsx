import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  ClipboardCheck,
  Bell,
  Settings,
  LogOut,
  X,
  CheckCircle,
  HeartHandshake,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import { useDoctor } from "../../contexts/DoctorContext";
import API from "../../Api";
import socket from "../../socket/Socket";
import { useTranslation } from "react-i18next"; 

interface DoctorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DoctorSidebar({ isOpen, onClose }: DoctorSidebarProps) {
  const location = useLocation();
  const { logout, user } = useAuth(); 
  const { dashboard } = useDoctor();
  const { t } = useTranslation(); 
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  const stats = dashboard?.stats || {};

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const res = await API.get("/api/v1/chat/unread-count");
        setUnreadMessages(res.data?.data?.unreadCount || 0);
      } catch (error) {
        console.error("Failed to load unread messages:", error);
      }
    };

    const fetchUnreadNotifications = async () => {
      try {
        const res = await API.get("/api/v1/notifications/unread-count");
        setNotificationCount(res.data?.data?.unreadCount || 0);
      } catch (error) {
        console.error("Failed to load unread notifications:", error);
      }
    };

    fetchUnreadMessages();
    fetchUnreadNotifications();
    socket.on("receiveMessage", fetchUnreadMessages);
    socket.on("message:unread", fetchUnreadMessages);
    socket.on("notification:new", fetchUnreadNotifications);
    const interval = window.setInterval(() => {
      fetchUnreadMessages();
      fetchUnreadNotifications();
    }, 60000);

    return () => {
      socket.off("receiveMessage", fetchUnreadMessages);
      socket.off("message:unread", fetchUnreadMessages);
      socket.off("notification:new", fetchUnreadNotifications);
      window.clearInterval(interval);
    };
  }, []);

  // ================= SAFE ACTIVE ROUTE =================
  const isActive = (path: string) =>
    location.pathname.startsWith(path);

  // ================= NAV ITEMS (DYNAMIC BADGES) =================
  const navItems = [
    {
      name: t("sidebar.dashboard", "Dashboard"),
      path: "/doctor/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: t("sidebar.messages", "Messages"),
      path: "/doctor/messages",
      icon: MessageSquare,
      badge: unreadMessages, 
    },
    {
      name: t("sidebar.patients", "Patients"),
      path: "/doctor/patients",
      icon: Users,
    },
    {
      name: t("sidebar.community", "Community"),
      path: "/doctor/community",
      icon: HeartHandshake,
    },
    {
      name: t("sidebar.scanReviews", "Scan Reviews"),
      path: "/doctor/scans", 
      icon: ClipboardCheck,
      badge: stats.pendingScanReviewsCount || 0, 
    },
    {
      name: t("sidebar.notifications", "Notifications"),
      path: "/doctor/notifications",
      icon: Bell,
      badge: notificationCount || 0,
    },
    {
      name: t("sidebar.settings", "Settings"),
      path: "/doctor/settings",
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Overlay (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r
          border-slate-200 shadow-sm transition-transform duration-300
          lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="h-full flex flex-col">

          {/* Header & Doctor Info */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <span className="font-bold text-xl text-teal-600">OralScan AI</span>
              <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            {/* User Info Section */}
            <div className="flex items-center gap-3 px-1">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                {user?.fullName?.charAt(0) || "D"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {t("sidebar.doctorPrefix", "Dr.")} {user?.fullName || "Ola Samy"}
                </p>
                {stats.verificationStatus === "approved" && (
                  <div className="flex items-center gap-1 text-[10px] text-teal-600 font-medium">
                    <CheckCircle className="w-3 h-3" /> {t("sidebar.verified", "Verified")}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path + item.name}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition
                    ${
                      active
                        ? "bg-teal-50 text-teal-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 ${
                        active ? "text-teal-600" : "text-slate-400"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>

                  {/* Badges from Backend Stats */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`
                        px-2 py-0.5 rounded-full text-[10px] font-bold
                        ${
                          active
                            ? "bg-teal-100 text-teal-700"
                            : "bg-red-100 text-red-600"
                        }
                      `}
                    >
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer Action */}
          <div className="p-4 border-t bg-slate-50/50">
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              {t("sidebar.signOut", "Sign Out")}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}