import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MoreVertical,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

import { MessageBubble } from "../../components/chat/MessageBubble";
import { ChatInput } from "../../components/chat/ChatInput";
import { useAuth } from "../../contexts/AuthContext";
import API from "../../Api";

export function MessagesChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const endRef = useRef<HTMLDivElement>(null);

  // ================= SAFE USER =================
  const userId = user?._id;

  // ================= REMOVE DUPLICATES =================
  const removeDuplicates = useCallback((msgs: any[]) => {
    const map = new Map();

    msgs.forEach((m) => {
      const key =
        m._id ||
        `${m.text}-${m.createdAt}-${m.senderId?._id || m.senderId}`;
      map.set(key, m);
    });

    return Array.from(map.values());
  }, []);

  // ================= FETCH =================
  useEffect(() => {
    if (!conversationId || !userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [cRes, mRes] = await Promise.all([
          API.get(`/api/v1/chat/conversations/${conversationId}`),
          API.get(`/api/v1/chat/conversations/${conversationId}/messages`),
        ]);

        setConversation(cRes.data?.data || null);

        const cleanMessages = removeDuplicates(mRes.data?.data || []);
        setMessages(cleanMessages);
      } catch (err) {
        console.error("Chat load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [conversationId, userId, removeDuplicates]);

  // ================= SCROLL =================
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ================= SEND =================
  const handleSend = async (text: string) => {
    if (!text.trim() || !conversationId || !userId) return;

    const tempId = "temp-" + Date.now();

    const tempMessage = {
      _id: tempId,
      text,
      senderId: {
        _id: userId,
      },
      createdAt: new Date().toISOString(),
    };

    // ✅ optimistic UI
    setMessages((prev) => removeDuplicates([...prev, tempMessage]));

    try {
      const res = await API.post(
        `/api/v1/chat/conversations/${conversationId}/messages`,
        { text }
      );

      const saved = res.data?.data;

      setMessages((prev) => {
        // استبدال temp
        const replaced = prev.map((m) =>
          m._id === tempId ? saved : m
        );

        return removeDuplicates(replaced);
      });

    } catch (err) {
      console.error("Send error:", err);

      // rollback
      setMessages((prev) =>
        prev.filter((m) => m._id !== tempId)
      );
    }
  };

  const patient = conversation?.participants?.find(
    (p: any) => p.role === "patient"
  );

  // ================= LOADING =================
  if (loading || !userId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <RefreshCw className="animate-spin" />
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-white border-b p-3 flex justify-between">
        <div className="flex gap-3 items-center">
          <button onClick={() => navigate("/doctor/messages")}>
            <ArrowLeft />
          </button>

          <div>
            <h2 className="font-semibold">
              {patient?.fullName || "Patient"}
            </h2>
            <p className="text-xs text-gray-500">
              {patient?.email || ""}
            </p>
          </div>
        </div>

        <MoreVertical />
      </div>

      {/* WARNING */}
      {!conversation?.isActive && (
        <div className="bg-amber-50 text-amber-700 text-sm p-2 flex justify-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Conversation closed
        </div>
      )}

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            currentUserId={userId} // ✅ FIX النهائي
          />
        ))}

        <div ref={endRef} />
      </div>

      {/* INPUT */}
      <ChatInput
        conversationId={conversationId!}
        onSend={handleSend}
        disabled={!conversation?.isActive}
      />
    </div>
  );
}