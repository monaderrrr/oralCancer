import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCheck, FileText, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import API from "../../Api";
import socket from "../../socket/Socket";
import { useNavigate } from "react-router-dom";

interface Notification {
  _id: string;
  type: "welcome" | "message" | "doctor_approved" | "doctor-review" | "doctor_review" | "scan_review" | "appointment" | "system";
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
  targetId?: string;
  targetRoute?: string;
  metadata?: {
    scanId?: string;
    doctorId?: string;
    [key: string]: any;
  };
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/v1/notifications?limit=80");
      setNotifications(res.data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleNewNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on("notification:new", handleNewNotification);
    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, []);

  const handleNotificationOpen = async (notification: Notification) => {
    console.log("Notification Clicked");
    console.log(notification);

    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((item) => (item._id === notification._id ? { ...item, isRead: true } : item))
      );
      window.dispatchEvent(
        new CustomEvent("notifications:count-changed", {
          detail: Math.max(unreadCount - 1, 0),
        })
      );
      await API.patch(`/api/v1/notifications/${notification._id}/read`);
    }

    let finalUrl = "";
    if (notification.targetRoute) {
      const targetId = notification.targetId || "";
      finalUrl = notification.targetRoute
        .replace(/:scanId/g, targetId)
        .replace(/:conversationId/g, targetId)
        .replace(/:appointmentId/g, targetId)
        .replace(/:doctorId/g, targetId)
        .replace(/:bookingId/g, targetId)
        .replace(/:\w+/g, targetId);
    } else if (notification.actionUrl) {
      finalUrl = notification.actionUrl;
    } else {
      const targetId =
        notification.targetId ||
        notification.metadata?.scanId ||
        notification.metadata?.conversationId ||
        "";
      if (notification.type === "scan_review") {
        finalUrl = `/doctor/scans/${targetId}`;
      } else if (notification.type === "message") {
        finalUrl = `/doctor/messages/${targetId}`;
      } else if (notification.type === "doctor_approved") {
        finalUrl = `/doctor/dashboard`;
      } else if (notification.type === "welcome") {
        finalUrl = `/doctor/verification-upload`;
      }
    }

    console.log("Target Route:", notification.targetRoute);
    console.log("Target ID:", notification.targetId);
    console.log("Resolved URL:", finalUrl);

    if (!finalUrl) {
      alert("This notification is not linked to any content.");
      return;
    }

    navigate(finalUrl);
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    window.dispatchEvent(new CustomEvent("notifications:count-changed", { detail: 0 }));
    await API.patch("/api/v1/notifications/mark-all-read");
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const filtered =
    filter === "unread" ? notifications.filter((item) => !item.isRead) : notifications;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center">
              <Bell className="w-6 h-6 text-teal-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
              <p className="text-sm text-slate-600">
                {unreadCount ? `${unreadCount} unread updates` : "All caught up"}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} leftIcon={<CheckCheck className="w-4 h-4" />}>
              Mark all read
            </Button>
          )}
        </motion.div>

        <div className="flex gap-2 mb-6">
          {(["all", "unread"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filter === tab ? "bg-teal-600 text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab === "all" ? "All" : "Unread"}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {loading ? (
            <Card className="p-10 text-center text-slate-500">Loading notifications...</Card>
          ) : filtered.length === 0 ? (
            <Card className="p-12 text-center">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900">No notifications</h3>
              <p className="text-sm text-slate-500 mt-1">New messages and approval updates will appear here.</p>
            </Card>
          ) : (
            filtered.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card
                  onClick={() => handleNotificationOpen(notification)}
                  className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                    !notification.isRead ? "bg-teal-50 border-teal-200 shadow-sm" : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex gap-4">
                    <div className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center ${getIconColor(notification.type)}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                        {!notification.isRead && <span className="mt-2 w-2.5 h-2.5 rounded-full bg-teal-600 flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-slate-400 mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                      <div className="mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationOpen(notification);
                          }}
                          className="text-xs font-semibold px-3 py-1.5 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 rounded-lg transition-all"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function getIcon(type: Notification["type"]) {
  if (type === "message") return <MessageCircle className="w-5 h-5" />;
  if (type === "doctor_approved") return <ShieldCheck className="w-5 h-5" />;
  if (type === "doctor-review") return <FileText className="w-5 h-5" />;
  if (type === "welcome") return <Sparkles className="w-5 h-5" />;
  return <Bell className="w-5 h-5" />;
}

function getIconColor(type: Notification["type"]) {
  if (type === "message") return "bg-blue-100 text-blue-700";
  if (type === "doctor_approved") return "bg-emerald-100 text-emerald-700";
  if (type === "doctor-review") return "bg-cyan-100 text-cyan-700";
  if (type === "welcome") return "bg-teal-100 text-teal-700";
  return "bg-slate-100 text-slate-600";
}
