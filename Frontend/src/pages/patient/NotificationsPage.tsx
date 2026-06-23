import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, FileText, MessageCircle, Shield, Sparkles, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import API from "../../Api";
import socket from "../../socket/Socket";
import { useTranslation } from "react-i18next"; 

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
  const { t } = useTranslation(); 
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string>("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/v1/notifications?limit=80");
      setNotifications(res.data?.data || []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleNewNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setToastMessage(`${notification.title}`);
      setTimeout(() => setToastMessage(""), 5000);
    };

    fetchNotifications();
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
      if (
        notification.type === "doctor_review" ||
        notification.type === "doctor-review"
      ) {
        finalUrl = `/patient/scans/${targetId}`;
      } else if (notification.type === "message") {
        finalUrl = `/patient/chat/${targetId}`;
      } else if (notification.type === "appointment") {
        finalUrl = `/patient/recommendations`;
      } else if (notification.type === "welcome") {
        finalUrl = `/patient/dashboard`;
      }
    }

    console.log("Target Route:", notification.targetRoute);
    console.log("Target ID:", notification.targetId);
    console.log("Resolved URL:", finalUrl);

    if (!finalUrl) {
      alert("This notification is not linked to any content.");
      return;
    }

    const isDoctorReview =
      notification.type === "doctor-review" ||
      notification.type === "doctor_review" ||
      finalUrl.includes("/patient/scans/") ||
      finalUrl.includes("/patient/reports/");

    if (isDoctorReview) {
      const highlightUrl = finalUrl.includes("?")
        ? `${finalUrl}&highlightReview=true`
        : `${finalUrl}?highlightReview=true`;
      navigate(highlightUrl, { state: { highlightReview: true } });
    } else {
      navigate(finalUrl);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    window.dispatchEvent(new CustomEvent("notifications:count-changed", { detail: 0 }));
    await API.patch("/api/v1/notifications/mark-all-read");
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((item) => item._id !== id));
    await API.delete(`/api/v1/notifications/${id}`).catch(() => {
      fetchNotifications();
    });
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const filtered =
    filter === "unread" ? notifications.filter((item) => !item.isRead) : notifications;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center shadow-md"
              whileHover={{ scale: 1.05 }}
            >
              <Bell className="w-6 h-6 text-teal-700" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{t("sidebar.notifications", "Notifications")}</h1>
              <p className="text-sm text-slate-600 mt-1">
                {unreadCount > 0 ? `${unreadCount} ${t("notifications.unread", "unread")}` : t("notifications.allCaughtUp", "All caught up")}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <Button
                size="sm"
                variant="ghost"
                onClick={markAllAsRead}
                leftIcon={<CheckCheck className="w-4 h-4" />}
              >
                {t("notifications.markAllRead", "Mark all read")}
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6"
        >
          <Tab active={filter === "all"} onClick={() => setFilter("all")} label={t("notifications.tabs.all", "All")} />
          <Tab active={filter === "unread"} onClick={() => setFilter("unread")} label={t("notifications.tabs.unread", "Unread")} />
        </motion.div>

        {/* Notifications List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <Card className="p-10 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block"
                >
                  <Bell className="w-6 h-6 text-teal-600" />
                </motion.div>
                <p className="text-slate-500 mt-3">{t("notifications.loading", "Loading notifications...")}</p>
              </Card>
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="p-10 text-center">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  </motion.div>
                  <h3 className="font-semibold text-slate-900">{t("notifications.none", "No notifications")}</h3>
                  <p className="text-sm text-slate-500 mt-1">{t("notifications.caughtUp", "You're all caught up! New messages will appear here.")}</p>
                </Card>
              </motion.div>
            ) : (
              filtered.map((notification, index) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card
                    onClick={() => handleNotificationOpen(notification)}
                    className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${!notification.isRead
                      ? "bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200 shadow-sm"
                      : "bg-white hover:bg-slate-50 border-slate-200"
                      }`}
                  >
                    <div className="flex gap-3 items-start">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 ${getIconColor(
                          notification.type
                        )}`}
                      >
                        {getIcon(notification.type)}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-semibold text-slate-900 leading-tight">{notification.title}</h3>
                          {!notification.isRead && (
                            <motion.span
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-2.5 h-2.5 rounded-full bg-teal-600 flex-shrink-0 mt-1.5"
                            />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
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
                            {t("actions.viewDetails", "View Details")}
                          </Button>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                        className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 bg-teal-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Tab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${active
        ? "bg-teal-600 text-white shadow-md"
        : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
        }`}
    >
      {label}
    </motion.button>
  );
}

function getIcon(type: Notification["type"]) {
  if (type === "message") return <MessageCircle className="w-5 h-5" />;
  if (type === "doctor-review") return <FileText className="w-5 h-5" />;
  if (type === "welcome") return <Sparkles className="w-5 h-5" />;
  if (type === "system") return <FileText className="w-5 h-5" />;
  return <Shield className="w-5 h-5" />;
}

function getIconColor(type: Notification["type"]) {
  if (type === "message") return "bg-blue-100 text-blue-700";
  if (type === "doctor-review") return "bg-cyan-100 text-cyan-700";
  if (type === "welcome") return "bg-teal-100 text-teal-700";
  if (type === "system") return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}