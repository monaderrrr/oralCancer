import Conversation from "../../../DB/models/conversation.model.js";
import Message from "../../../DB/models/message.model.js";
import User from "../../../DB/models/users.model.js";
import { createNotification } from "../../Notifications/services/notification.service.js";

/**
 * Create a new conversation between patient and doctor
 * Assumes payment has been verified by middleware
 */
export const createConversation = async (patientId, doctorId, isPaid = true) => {
  try {
    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [patientId, doctorId] },
    });

    if (conversation) {
      return conversation;
    }

    // Create new conversation
    conversation = new Conversation({
      participants: [patientId, doctorId],
      isPaid,
    });

    await conversation.save();
    return conversation;
  } catch (error) {
    throw new Error(`Failed to create conversation: ${error.message}`);
  }
};

/**
 * Get all conversations for a user (paginated)
 */
export const getUserConversations = async (userId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({
      participants: userId,
      isActive: true,
    })
      .populate("participants", "username fullName email role")
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Conversation.countDocuments({
      participants: userId,
      isActive: true,
    });

    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conversation._id,
          senderId: { $ne: userId },
          isRead: false,
        });

        return {
          ...conversation,
          unreadCount,
        };
      })
    );

    return {
      conversations: conversationsWithUnread,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        limit,
      },
    };
  } catch (error) {
    throw new Error(`Failed to fetch conversations: ${error.message}`);
  }
};

/**
 * Get a single conversation with full details
 */
export const getConversationDetails = async (conversationId, userId) => {
  try {
    const conversation = await Conversation.findById(conversationId)
      .populate("participants", "username fullName email role phone consultationFee")
      .lean();

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Verify user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p._id.toString() === userId.toString()
    );
    if (!isParticipant) {
      throw new Error("Access denied: Not a participant in this conversation");
    }

    return conversation;
  } catch (error) {
    throw new Error(`Failed to fetch conversation: ${error.message}`);
  }
};

/**
 * Get all messages for a conversation (paginated)
 */
export const getConversationMessages = async (conversationId, userId, page = 1, limit = 50) => {
  try {
    const skip = (page - 1) * limit;

    // Verify conversation exists and user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (!isParticipant) {
      throw new Error("Access denied: Not a participant in this conversation");
    }

    const messages = await Message.find({ conversationId })
      .populate("senderId", "username fullName email role")
      .sort({ createdAt: 1 }) // Oldest first
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Message.countDocuments({ conversationId });

    // Mark messages as read if user is the recipient
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        isRead: false,
      },
      { isRead: true }
    );

    return {
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        limit,
      },
    };
  } catch (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }
};

/**
 * Create a new message in a conversation
 */
export const createMessage = async (conversationId, senderId, text, image = null, req = null) => {
  try {
    const isTextEmpty = !text || text.trim().length === 0;
    
    if (isTextEmpty && !image) {
      throw new Error("Message content cannot be empty");
    }

    // Verify conversation exists and sender is a participant
    const conversation = await Conversation.findById(conversationId).populate("participants", "fullName role");
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const isParticipant = conversation.participants.some(
      (p) => (p._id || p).toString() === senderId.toString()
    );
    if (!isParticipant) {
      throw new Error("Access denied: Not a participant in this conversation");
    }

    // Create message
    const message = new Message({
      conversationId,
      senderId,
      text: text ? text.trim() : "", 
      image: image,
    });

    await message.save();

    // Update conversation's last message and timestamp
    conversation.lastMessage = image ? "📷 Photo" : text.trim();
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Populate sender info for response
    await message.populate("senderId", "username fullName email role profileImage");

    const senderName = message.senderId?.fullName || "Someone";
    const senderRole = message.senderId?.role;
    const recipient = conversation.participants.find(
      (participant) => participant._id.toString() !== senderId.toString()
    );

    if (recipient) {
      const recipientRole = recipient.role;
      await createNotification({
        userId: recipient._id,
        type: "message",
        title: senderRole === "doctor" ? "New reply from your doctor" : "New patient message",
        message: `${senderName}: ${image ? "Sent a photo" : text.trim().slice(0, 120)}`,
        actionUrl:
          recipientRole === "doctor"
            ? `/doctor/messages/${conversationId}`
            : `/patient/chat/${conversationId}`,
        targetId: conversationId.toString(),
        targetRoute:
          recipientRole === "doctor"
            ? "/doctor/messages/:conversationId"
            : "/patient/chat/:conversationId",
        metadata: { conversationId, senderId },
        req,
      });

      const emitEvent = req?.app?.get?.("emitEvent");
      if (emitEvent) {
        emitEvent(recipient._id.toString(), "message:unread", {
          conversationId,
          messageId: message._id,
        });
      }
    }
    
    return message;
  } catch (error) {
    throw new Error(`Failed to create message: ${error.message}`);
  }
};

/**
 * Mark a message as read
 */
export const markMessageAsRead = async (messageId) => {
  try {
    const message = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true }
    );
    return message;
  } catch (error) {
    throw new Error(`Failed to mark message as read: ${error.message}`);
  }
};

/**
 * Get unread message count for a conversation
 */
export const getUnreadCount = async (conversationId, userId) => {
  try {
    const count = await Message.countDocuments({
      conversationId,
      senderId: { $ne: userId },
      isRead: false,
    });
    return count;
  } catch (error) {
    throw new Error(`Failed to get unread count: ${error.message}`);
  }
};

/**
 * Get total unread message count across all active conversations for a user
 */
export const getTotalUnreadCount = async (userId) => {
  try {
    const conversations = await Conversation.find({
      participants: userId,
      isActive: true,
    })
      .select("_id")
      .lean();

    const conversationIds = conversations.map((conversation) => conversation._id);

    if (!conversationIds.length) return 0;

    return Message.countDocuments({
      conversationId: { $in: conversationIds },
      senderId: { $ne: userId },
      isRead: false,
    });
  } catch (error) {
    throw new Error(`Failed to get total unread count: ${error.message}`);
  }
};

/**
 * Close/deactivate a conversation
 */
export const closeConversation = async (conversationId, userId) => {
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (!isParticipant) {
      throw new Error("Access denied: Not a participant in this conversation");
    }

    conversation.isActive = false;
    await conversation.save();

    return conversation;
  } catch (error) {
    throw new Error(`Failed to close conversation: ${error.message}`);
  }
};
