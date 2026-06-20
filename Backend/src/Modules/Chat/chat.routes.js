import express from "express";
import { authenticationMiddleware } from "../../Middleware/authentication.middleware.js";
import { paymentCheckMiddleware } from "../../Middleware/payment-check.middleware.js";
import upload from "../../config/multer.config.js";
import {
  createConversationHandler,
  getConversationsHandler,
  getConversationHandler,
  getMessagesHandler,
  createMessageHandler,
  getUnreadCountHandler,
  getTotalUnreadCountHandler,
  closeConversationHandler,
} from "./chat.controller.js";

const router = express.Router();

router.use(authenticationMiddleware());

router.get("/unread-count", getTotalUnreadCountHandler);

/**
 * Conversation Routes
 */
router.post("/conversations", createConversationHandler);
router.get("/conversations", getConversationsHandler);
router.get("/conversations/:conversationId", getConversationHandler);
router.post("/conversations/:conversationId/close", closeConversationHandler);

/**
 * Message Routes
 */
router.get(
  "/conversations/:conversationId/messages",
  paymentCheckMiddleware(),
  getMessagesHandler
);

router.post(
  "/conversations/:conversationId/messages",
  paymentCheckMiddleware(),
  createMessageHandler
);

router.post(
  "/upload",
  paymentCheckMiddleware(), 
  upload.single("image"), 
  (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    console.log(req.file);
    res.status(200).json({ 
      message: "Image uploaded successfully",
      imageUrl 
    });
  }
);

router.get("/conversations/:conversationId/unread-count", getUnreadCountHandler);

export default router;
