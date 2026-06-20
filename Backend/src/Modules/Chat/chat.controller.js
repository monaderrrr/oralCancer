import {
  createConversation,
  getUserConversations,
  getConversationDetails,
  getConversationMessages,
  createMessage,
  getUnreadCount,
  getTotalUnreadCount,
  closeConversation,
} from "./services/chat.service.js";

/**
 * POST /api/v1/chat/conversations
 * Create a new conversation (payment required)
 * Body: { doctorId }
 */
export const createConversationHandler = async (req, res) => {
  try {
    const patientId = req.authUser?._id;
    const { doctorId } = req.body;

    if (!patientId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    if (!doctorId) {
      return res.status(400).json({ message: "doctorId is required" });
    }

    if (patientId.toString() === doctorId.toString()) {
      return res.status(400).json({ message: "Cannot create conversation with yourself" });
    }

    // Create conversation (payment should be verified in middleware or this endpoint)
    const conversation = await createConversation(patientId, doctorId, true);

    res.status(201).json({
      message: "Conversation created successfully",
      data: conversation,
    });
  } catch (error) {
    console.error("Create conversation error:", error);
    res.status(500).json({ message: "Failed to create conversation", error: error.message });
  }
};

/**
 * GET /api/v1/chat/conversations
 * Get all conversations for authenticated user
 * Query params: page, limit
 */
export const getConversationsHandler = async (req, res) => {
  try {
    const userId = req.authUser?._id;
    const { page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const result = await getUserConversations(userId, parseInt(page), parseInt(limit));

    res.status(200).json({
      message: "Conversations retrieved successfully",
      data: result.conversations,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ message: "Failed to fetch conversations", error: error.message });
  }
};

/**
 * GET /api/v1/chat/conversations/:conversationId
 * Get a single conversation details
 */
export const getConversationHandler = async (req, res) => {
  try {
    const userId = req.authUser?._id;
    const { conversationId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const conversation = await getConversationDetails(conversationId, userId);

    res.status(200).json({
      message: "Conversation retrieved successfully",
      data: conversation,
    });
  } catch (error) {
    console.error("Get conversation error:", error);
    const statusCode = error.message.includes("not found")
      ? 404
      : error.message.includes("Access denied")
        ? 403
        : 500;
    res.status(statusCode).json({ message: error.message || "Failed to fetch conversation" });
  }
};

/**
 * GET /api/v1/chat/conversations/:conversationId/messages
 * Get all messages for a conversation (participants only)
 * Query params: page, limit
 */
export const getMessagesHandler = async (req, res) => {
  try {
    const userId = req.authUser?._id;
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    if (!conversationId) {
      return res.status(400).json({ message: "conversationId is required" });
    }

    const result = await getConversationMessages(
      conversationId,
      userId,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      message: "Messages retrieved successfully",
      data: result.messages,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    const statusCode = error.message.includes("not found")
      ? 404
      : error.message.includes("Access denied")
        ? 403
        : 500;
    res.status(statusCode).json({ message: error.message || "Failed to fetch messages" });
  }
};

/**
 * POST /api/v1/chat/conversations/:conversationId/messages
 * Create a new message in a conversation
 * Body: { text }
 */
export const createMessageHandler = async (req, res) => {
  try {
    const senderId = req.authUser?._id;
    const { conversationId } = req.params;
    const { text, image } = req.body;

    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    if (!conversationId) {
      return res.status(400).json({ message: "conversationId is required" });
    }

    if ((!text || text.trim() === "") && !image) {
      return res.status(400).json({
        message: "Message must have text or image",
      });
    }

    const message = await createMessage(conversationId, senderId, text, image, req);

    const io = req.app.get("io");
    if (io) {
      io.to(`conversation-${conversationId}`).emit("receiveMessage", message);
    }

    res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });

  } catch (error) {
    console.error("Create message error:", error);
    const statusCode = error.message.includes("not found")
      ? 404
      : error.message.includes("Access denied")
        ? 403
        : 500;

    res.status(statusCode).json({
      message: error.message || "Failed to send message"
    });
  }
};

/**
 * GET /api/v1/chat/conversations/:conversationId/unread-count
 * Get unread message count
 */
export const getUnreadCountHandler = async (req, res) => {
  try {
    const userId = req.authUser?._id;
    const { conversationId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const count = await getUnreadCount(conversationId, userId);

    res.status(200).json({
      message: "Unread count retrieved successfully",
      data: { unreadCount: count },
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ message: "Failed to get unread count", error: error.message });
  }
};

/**
 * GET /api/v1/chat/unread-count
 * Get total unread message count for the current user
 */
export const getTotalUnreadCountHandler = async (req, res) => {
  try {
    const userId = req.authUser?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const count = await getTotalUnreadCount(userId);

    res.status(200).json({
      message: "Unread count retrieved successfully",
      data: { unreadCount: count },
    });
  } catch (error) {
    console.error("Get total unread count error:", error);
    res.status(500).json({ message: "Failed to get unread count", error: error.message });
  }
};

/**
 * POST /api/v1/chat/conversations/:conversationId/close
 * Close/deactivate a conversation
 */
export const closeConversationHandler = async (req, res) => {
  try {
    const userId = req.authUser?._id;
    const { conversationId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const conversation = await closeConversation(conversationId, userId);

    res.status(200).json({
      message: "Conversation closed successfully",
      data: conversation,
    });
  } catch (error) {
    console.error("Close conversation error:", error);
    const statusCode = error.message.includes("not found")
      ? 404
      : error.message.includes("Access denied")
        ? 403
        : 500;
    res.status(statusCode).json({ message: error.message || "Failed to close conversation" });
  }
};
