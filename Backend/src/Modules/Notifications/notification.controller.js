import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "./services/notification.service.js";

export const getNotificationsHandler = async (req, res, next) => {
  try {
    const userId = req.authUser?._id;
    const notifications = await listNotifications(userId, {
      unreadOnly: req.query.unread === "true",
      limit: req.query.limit,
    });

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCountHandler = async (req, res, next) => {
  try {
    const count = await getUnreadNotificationCount(req.authUser?._id);
    return res.status(200).json({ success: true, data: { unreadCount: count } });
  } catch (error) {
    next(error);
  }
};

export const markReadHandler = async (req, res, next) => {
  try {
    const notification = await markNotificationAsRead(req.authUser?._id, req.params.id);
    return res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

export const markAllReadHandler = async (req, res, next) => {
  try {
    const unreadCount = await markAllNotificationsAsRead(req.authUser?._id);
    return res.status(200).json({ success: true, data: { unreadCount } });
  } catch (error) {
    next(error);
  }
};
