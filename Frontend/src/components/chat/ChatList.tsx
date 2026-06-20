import { MessageCircle } from "lucide-react";

export interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    fullName: string;
    role: "patient" | "doctor";
  }>;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount?: number;
  isActive: boolean;
}

interface ChatListProps {
  conversations: Conversation[];
  currentUserId: string;
  onSelectChat: (id: string) => void;
  selectedChatId?: string;
}

export function ChatList({
  conversations,
  currentUserId,
  onSelectChat,
  selectedChatId,
}: ChatListProps) {

  const getOtherUser = (chat: Conversation) =>
    chat.participants.find(p => p._id !== currentUserId) ||
    chat.participants[0];

  if (!conversations.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <MessageCircle className="w-8 h-8 text-teal-600 mb-2" />
        No conversations yet
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {conversations.map(chat => {
        const user = getOtherUser(chat);

        return (
          <button
            key={chat._id}
            onClick={() => onSelectChat(chat._id)}
            className={`p-4 flex gap-3 border-b text-left hover:bg-gray-50 ${
              selectedChatId === chat._id ? "bg-teal-50" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
              {user.fullName.charAt(0)}
            </div>

            <div className="flex-1">
              <div className="flex justify-between">
                <span className="font-medium">{user.fullName}</span>
                {chat.lastMessageAt && (
                  <span className="text-xs text-gray-500">
                    {new Date(chat.lastMessageAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-500 truncate">
                  {chat.lastMessage}
                </span>

                {chat.unreadCount ? (
                  <span className="ml-3 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                  </span>
                ) : null}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
