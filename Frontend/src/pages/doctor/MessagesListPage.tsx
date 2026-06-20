import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, RefreshCw } from "lucide-react";
import { ChatList } from "../../components/chat/ChatList";
import API from "../../Api";
import { useAuth } from "../../contexts/AuthContext";
import socket from "../../socket/Socket";

export function MessagesListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await API.get("/api/v1/chat/conversations");
        setConversations(res.data?.data || []);
      } catch (err: any) {
        console.error("Fetch conversations error:", err);
        setError("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchConversations();

    socket.on("receiveMessage", fetchConversations);
    socket.on("message:unread", fetchConversations);

    return () => {
      socket.off("receiveMessage", fetchConversations);
      socket.off("message:unread", fetchConversations);
    };
  }, []);

  const filtered = conversations.filter((c) => {
    const patient = c.participants?.find(
      (p: any) => p.role === "patient"
    );

    return patient?.fullName
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  return (
    <div className="max-w-4xl mx-auto p-4">

      <h1 className="text-xl font-bold mb-4">
        Patient Messages
      </h1>

      {/* SEARCH */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />

        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 p-2 border rounded"
          placeholder="Search patients..."
        />
      </div>

      {/* STATES */}
      {loading ? (
        <RefreshCw className="animate-spin mx-auto" />
      ) : error ? (
        <div className="text-center text-red-500">
          {error}
        </div>
      ) : !filtered.length ? (
        <div className="text-center text-gray-500">
          No conversations found
        </div>
      ) : (
        <ChatList
          conversations={filtered}
          currentUserId={user?._id || ""}
          onSelectChat={(id) =>
            navigate(`/doctor/messages/${id}`)
          }
        />
      )}

    </div>
  );
}
