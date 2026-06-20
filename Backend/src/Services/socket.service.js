import jwt from "jsonwebtoken";
import Message from "../DB/models/message.model.js";
import Conversation from "../DB/models/conversation.model.js";
import User from "../DB/models/users.model.js";

export const initializeChatSocket = (io) => {
  const onlineUsers = new Map(); // userId -> socketId

  io.on("connection", (socket) => {
    console.log(`⚡ User connected: ${socket.id}`);

    socket.userId = null;

    // ================= JOIN ROOM (للإشعارات والـ notifications) =================
    socket.on("join_room", (userId) => {
      socket.join(userId.toString());
      console.log(`✅ User ${userId} joined room: ${userId}`);
    });

    // ================= AUTH =================
    socket.on("authenticate", async (token) => {
      try {
        if (!token) {
          socket.emit("authError", { message: "No token provided" });
          return socket.disconnect();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_LOGIN);

        const user = await User.findById(decoded._id).select(
          "-password -__v"
        );

        if (!user) {
          socket.emit("authError", { message: "User not found" });
          return socket.disconnect();
        }

        socket.userId = user._id.toString();

        onlineUsers.set(socket.userId, socket.id);

        socket.join(socket.userId);

        socket.emit("authenticated", {
          userId: socket.userId,
          username: user.username,
        });

        socket.broadcast.emit("userOnline", {
          userId: socket.userId,
        });

        console.log(`✅ Authenticated: ${user.username} (${socket.userId})`);
      } catch (err) {
        console.error("❌ Auth error:", err.message);
        socket.emit("authError", { message: "Invalid token" });
        socket.disconnect();
      }
    });

    // ================= DISCONNECT =================
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id} (${socket.userId})`);
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        socket.broadcast.emit("userOffline", { userId: socket.userId });
      }
    });

    // ================= JOIN CONVERSATION =================
    socket.on("joinConversation", async ({ conversationId }) => {
      try {
        if (!socket.userId) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const isParticipant = conversation.participants.some(
          (p) => p.toString() === socket.userId
        );

        if (!isParticipant) return;

        const room = `conversation-${conversationId}`;
        socket.join(room);

        socket.emit("joinedConversation", { conversationId });
      } catch (err) {
        console.log("Join error:", err.message);
      }
    });

    // ================= SEND MESSAGE =================
    socket.on("sendMessage", async ({ conversationId, text }, callback) => {
      try {
        if (!socket.userId || !text?.trim()) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const isParticipant = conversation.participants.some(
          (p) => p.toString() === socket.userId
        );

        if (!isParticipant) return;

        // create message
        const message = await Message.create({
          conversationId,
          senderId: socket.userId,
          text: text.trim(),
          status: "sent", // sent / delivered / seen
          seenBy: [socket.userId],
        });

        await message.populate("senderId", "fullName username");

        // update conversation
        conversation.lastMessage = message.text;
        conversation.lastMessageAt = new Date();

        // increase unread for others
        conversation.participants.forEach((p) => {
          if (p.toString() !== socket.userId) {
            conversation.unreadCount =
              (conversation.unreadCount || 0) + 1;
          }
        });

        await conversation.save();

        const payload = {
          _id: message._id,
          conversationId,
          text: message.text,
          senderId: socket.userId,
          senderName: message.senderId.username,
          image: message.image,
          status: "sent",
          createdAt: message.createdAt,
        };

        // emit to room
        io.to(`conversation-${conversationId}`).emit(
          "receiveMessage",
          payload
        );

        // ACK to sender
        if (callback) {
          callback({ success: true, message: payload });
        }
      } catch (err) {
        console.log("Send message error:", err.message);
      }
    });

    // ================= MESSAGE DELIVERED =================
    socket.on("messageDelivered", async ({ messageId }) => {
      try {
        if (!socket.userId) return;

        await Message.findByIdAndUpdate(messageId, {
          status: "delivered",
        });

        io.emit("messageStatusUpdate", {
          messageId,
          status: "delivered",
        });
      } catch (err) {
        console.log("Delivered error:", err.message);
      }
    });

    // ================= MESSAGE SEEN =================
    socket.on("messageSeen", async ({ conversationId, messageId }) => {
      try {
        if (!socket.userId) return;

        await Message.findByIdAndUpdate(messageId, {
          $addToSet: { seenBy: socket.userId },
          status: "seen",
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          $set: { unreadCount: 0 },
        });

        io.to(`conversation-${conversationId}`).emit("messageSeen", {
          messageId,
          userId: socket.userId,
          status: "seen",
        });
      } catch (err) {
        console.log("Seen error:", err.message);
      }
    });

    // ================= TYPING =================
    socket.on("typing", ({ conversationId }) => {
      socket.to(`conversation-${conversationId}`).emit("typing", {
        userId: socket.userId,
      });
    });

    socket.on("stopTyping", ({ conversationId }) => {
      socket.to(`conversation-${conversationId}`).emit("stopTyping", {
        userId: socket.userId,
      });
    });

    // ================= DISCONNECT =================
    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);

        socket.broadcast.emit("userOffline", {
          userId: socket.userId,
        });
      }

      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return onlineUsers;
};

export default initializeChatSocket;