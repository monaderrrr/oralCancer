import express from "express";
import { authenticationMiddleware } from "../../Middleware/authentication.middleware.js";
import {
  getNotificationsHandler,
  getUnreadCountHandler,
  markAllReadHandler,
  markReadHandler,
} from "./notification.controller.js";

const router = express.Router();

router.use(authenticationMiddleware());

router.get("/", getNotificationsHandler);
router.get("/unread-count", getUnreadCountHandler);
router.patch("/mark-all-read", markAllReadHandler);
router.patch("/:id/read", markReadHandler);

export default router;
