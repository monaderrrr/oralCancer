import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import API from '../../Api'; 

/**
 * Backend-compatible interfaces
 */
interface Participant {
  _id: string;
  fullName: string;
  role: 'doctor' | 'patient';
}

interface Message {
  _id: string;
  text: string;
  senderId: Participant;
  createdAt: string;
}

interface ChatInterfaceProps {
  conversationId: string; // this replaces recipient-based sending
  recipient: Participant;
  recipientAvatar: string;
  currentUserId: string;
}

export function ChatInterface({
  conversationId,
  recipient,
  recipientAvatar,
  currentUserId
}: ChatInterfaceProps) {

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-scroll to latest message
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /**
   * ================= FETCH MESSAGES =================
   * GET /api/v1/chat/conversations/:conversationId/messages
   */
  const fetchMessages = async () => {
    try {
      setIsLoading(true);

      const res = await API.get(`/api/v1/chat/conversations/${conversationId}/messages`);

      // Backend returns: { success, data }
      setMessages(res.data.data || []);

    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * ================= SEND MESSAGE =================
   */
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      const res = await API.post(`/api/v1/chat/conversations/${conversationId}/messages`, {
        text: newMessage.trim()
      });

      /**
       * Backend returns created message
       * We append it to UI instantly
       */
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
        setNewMessage('');
      }

    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  /**
   * Format message time
   */
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

      {/* ================= HEADER ================= */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={recipientAvatar}
              alt={recipient.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              {recipient.fullName}
            </h3>
            <p className="text-xs text-slate-500 capitalize">
              {recipient.role}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button title="Voice Call" className="p-2 text-slate-400 hover:text-teal-600 rounded-full">
            <Phone className="w-5 h-5" />
          </button>

          <button title="Video Call" className="p-2 text-slate-400 hover:text-teal-600 rounded-full">
            <Video className="w-5 h-5" />
          </button>

          <button title="More Options" className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ================= MESSAGES ================= */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.map((msg) => {
          const isMe = msg.senderId?._id === currentUserId;

          return (
            <div
              key={msg._id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  isMe
                    ? 'bg-teal-600 text-white rounded-br-none'
                    : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{msg.text}</p>

                <p
                  className={`text-[10px] mt-1 text-right ${
                    isMe ? 'text-teal-100' : 'text-slate-400'
                  }`}
                >
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* ================= INPUT ================= */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="flex items-center gap-2">

          <button
            type="button"
            title="Attach File"
            className="p-2 text-slate-400 hover:text-teal-600 rounded-full"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <Input
            value={newMessage}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewMessage(e.target.value)
            }
            placeholder="Type a message..."
            className="flex-1"
            disabled={isLoading}
          />

          <Button
            type="submit"
            disabled={!newMessage.trim() || isLoading}
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </Button>

        </form>
      </div>
    </div>
  );
}