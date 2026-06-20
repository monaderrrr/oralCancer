import React, { useEffect, useState, useRef } from "react";
import { Send, Paperclip } from "lucide-react";
import { Button } from "../ui/Button";
import API from "../../Api";

interface ChatInputProps {
  conversationId: string;
  disabled?: boolean;
  onMessageSent?: (message: any) => void;
  onAttach?: () => void;
  placeholder?: string;
}

export function ChatInput({
  conversationId,
  disabled,
  onMessageSent,
  onAttach,
  placeholder = "Type a message...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSending, setIsSending] = useState(false);

  /**
   * Send message to backend
   */
  const handleSend = async () => {
    if (!message.trim() || !conversationId || isSending) return;

    try {
      setIsSending(true);

      const res = await API.post(
        `/api/v1/chat/conversations/${conversationId}/messages`,
        {
          text: message.trim(),
        }
      );

      const newMsg = res.data?.data;

      if (newMsg) {
        onMessageSent?.(newMsg);
      }

      setMessage("");

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Enter to send, Shift+Enter for new line
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Auto resize textarea
   */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="border-t bg-white p-3">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">

        {/* Attach button */}
        <button
          type="button"
          onClick={onAttach}
          disabled={disabled}
          className="p-2 rounded-full text-gray-500 hover:text-teal-600 hover:bg-gray-100 transition"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Input box */}
        <div className="flex-1 bg-gray-50 rounded-2xl px-3 py-2 focus-within:ring-2 focus-within:ring-teal-500 transition">

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSending}
            placeholder={placeholder}
            rows={1}
            className="w-full bg-transparent outline-none resize-none max-h-32 min-h-[44px] text-sm"
          />
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isSending}
          className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
        >
          <Send className={`w-4 h-4 ${isSending ? "animate-pulse" : ""}`} />
        </Button>

      </div>
    </div>
  );
}