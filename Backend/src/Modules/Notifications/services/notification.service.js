import Notification from "../../../DB/models/notification.model.js";

export const createNotification = async ({
  userId,
  type = "system",
  title,
  message,
  actionUrl = null,
  targetId = null,
  targetRoute = null,
  metadata = {},
  req = null,
  io = null,
}) => {
  if (!userId || !title || !message) {
    console.warn("❌ Notification missing required fields:", { userId, title, message });
    return null;
  }

  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      actionUrl,
      targetId,
      targetRoute,
      metadata,
    });

    const payload = notification.toObject();
    const userIdStr = userId.toString();

    // Try to emit via req.app first, then fallback to io
    const emitEvent = req?.app?.get?.("emitEvent") || io?.to?.bind(io);

    if (emitEvent) {
      if (req?.app?.get?.("emitEvent")) {
        emitEvent(userIdStr, "notification:new", payload);
      } else if (io) {
        io.to(userIdStr).emit("notification:new", payload);
      }
      console.log(`📢 Notification emitted to user ${userIdStr}: ${type}`);
    } else {
      console.warn(`⚠️ No emitEvent or io available for user ${userIdStr}`);
    }

    return notification;
  } catch (error) {
    console.error("❌ Error creating notification:", error);
    return null;
  }
};

export const listNotifications = async (
  userId,
  { unreadOnly = false, limit = 50 } = {}
) => {
  const query = { userId };
  if (unreadOnly) query.isRead = false;

  return Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit) || 50, 100))
    .lean();
};

export const getUnreadNotificationCount = async (userId) => {
  return Notification.countDocuments({ userId, isRead: false });
};

export const markNotificationAsRead = async (userId, notificationId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );
};

export const markAllNotificationsAsRead = async (userId) => {
  await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
  return getUnreadNotificationCount(userId);
};