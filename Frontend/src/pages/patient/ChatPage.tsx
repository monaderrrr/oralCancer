import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";

import { MessageBubble } from "../../components/chat/MessageBubble";
import { ChatInput } from "../../components/chat/ChatInput";
import { useAuth } from "../../contexts/AuthContext";
import API from "../../Api";
import socket from "../../socket/Socket";

export function ChatPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<any[]>([]);
  const [chatInfo, setChatInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const endRef = useRef<HTMLDivElement>(null);
  const userId = user?._id;

  // ================= FETCH =================
  useEffect(() => {
    if (!conversationId || !userId) return;

    const fetchChatData = async () => {
      try {
        setLoading(true);

        const [messagesRes, chatRes] = await Promise.all([
          API.get(`/api/v1/chat/conversations/${conversationId}/messages`),
          API.get(`/api/v1/chat/conversations/${conversationId}`),
        ]);

        setMessages(messagesRes.data?.data || []);
        setChatInfo(chatRes.data?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
  }, [conversationId, userId]);

  // ================= JOIN ROOM =================
  useEffect(() => {
    if (!conversationId) return;

    socket.emit("joinConversation", { conversationId });

    return () => {
      socket.emit("leaveConversation", { conversationId });
    };
  }, [conversationId]);

  // ================= RECEIVE (LIKE DOCTOR) =================
  useEffect(() => {
    const handler = (msg: any) => {
      if (msg.conversationId !== conversationId) return;

      setMessages((prev) => {
        const exists = prev.some((m) => m._id === msg._id);
        if (exists) return prev;

        return [...prev, msg];
      });
    };

    socket.on("receiveMessage", handler);

    return () => {
      socket.off("receiveMessage", handler);
    };
  }, [conversationId]);

  // ================= SEND (FIXED: NO DUPLICATION) =================
  const handleSend = async (text: string, file?: File) => {
    if (!conversationId || !userId) return;

    const tempId = "temp-" + Date.now();

    const tempMessage = {
      _id: tempId,
      text,
      senderId: { _id: userId },
      createdAt: new Date().toISOString(),
    };

    // ✅ optimistic UI
    setMessages((prev) => [...prev, tempMessage]);

    try {
      let imageUrl = null;

      if (file) {
        const formData = new FormData();
        formData.append("image", file);

        const uploadRes = await API.post("/api/v1/chat/upload", formData);
        imageUrl = uploadRes.data.imageUrl;
      }

      const res = await API.post(
        `/api/v1/chat/conversations/${conversationId}/messages`,
        {
          text,
          image: imageUrl,
        }
      );

      const saved = res.data?.data;

      // 🔥 replace temp message
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? saved : m))
      );

    } catch (err) {
      // rollback
      setMessages((prev) =>
        prev.filter((m) => m._id !== tempId)
      );
    }
  };

  // ================= SCROLL =================
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading || !userId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-teal-600 w-8 h-8" />
      </div>
    );
  }

  const otherUser = chatInfo?.participants?.find(
    (p: any) => p._id !== userId
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">

      {/* HEADER */}
      <div className="p-3 border-b bg-white flex items-center gap-3">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft />
        </button>

        <div>
          <h2 className="font-semibold">
            {otherUser?.fullName || "Chat"}
          </h2>
          <p className="text-xs text-gray-500">
            {otherUser?.email || ""}
          </p>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            currentUserId={userId}
          />
        ))}
        <div ref={endRef} />
      </div>

      {/* INPUT */}
      <ChatInput onSend={handleSend} />
    </div>
  );
}