import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, Image as ImageIcon } from "lucide-react";

import { ChatList, Conversation } from "../../components/chat/ChatList";
import { useAuth } from "../../contexts/AuthContext";
import API from "../../Api";
import socket from "../../socket/Socket";

export function ChatListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const res = await API.get("/api/v1/chat/conversations");
      setConversations(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const handleMessageUpdate = (msg: any) => {
      setConversations((prev) =>
        prev.map((conversation: any) => {
          if (conversation._id !== msg.conversationId) return conversation;

          const senderId = msg.senderId?._id || msg.senderId;
          const isOwnMessage = senderId === user?._id;

          return {
            ...conversation,
            lastMessage: msg.image ? "Photo" : msg.text || conversation.lastMessage,
            lastMessageAt: msg.createdAt || conversation.lastMessageAt,
            unreadCount: isOwnMessage
              ? conversation.unreadCount
              : (conversation.unreadCount || 0) + 1,
          };
        })
      );
    };

    socket.on("receiveMessage", handleMessageUpdate);
    socket.on("message:unread", handleMessageUpdate);

    return () => {
      socket.off("receiveMessage", handleMessageUpdate);
      socket.off("message:unread", handleMessageUpdate);
    };
  }, [user?._id]);

  const filtered = useMemo(() => {
    return conversations
      .filter((conversation: any) => {
        const other = conversation.participants.find((p: any) => p._id !== user?._id);
        return other?.fullName?.toLowerCase().includes(search.toLowerCase());
      })
      .sort((a, b) => {
        const dateA = new Date(a.lastMessageAt || 0).getTime();
        const dateB = new Date(b.lastMessageAt || 0).getTime();
        return dateB - dateA;
      });
  }, [conversations, search, user?._id]);

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Messages</h1>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all shadow-sm"
          placeholder="Search by doctor name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-teal-600 w-10 h-10" />
          <p className="text-gray-500 animate-pulse">Loading chats...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <ChatList
            conversations={filtered}
            currentUserId={user?._id || ""}
            onSelectChat={(id) => navigate(`/patient/chat/${id}`)}
          />
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No conversations found.</p>
        </div>
      )}
    </div>
  );
}
