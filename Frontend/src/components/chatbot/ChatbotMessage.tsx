import React from "react";
import { Bot, User } from "lucide-react";

interface ChatbotMessageProps {
  message: {
    id: string;
    text: string;
    isBot: boolean;
    timestamp?: string;
  };
}

export function ChatbotMessage({ message }: ChatbotMessageProps) {
  const { isBot, text, timestamp } = message;

  const containerAlign = isBot ? "justify-start" : "justify-end";
  const rowDirection = isBot ? "flex-row" : "flex-row-reverse";

  const avatarStyle = isBot
    ? "bg-blue-100 text-blue-600"
    : "bg-gray-200 text-gray-600";

  const bubbleStyle = isBot
    ? "bg-blue-50 text-blue-900 rounded-tl-none"
    : "bg-gray-100 text-gray-900 rounded-tr-none";

  return (
    <div
      className={`flex w-full ${containerAlign} mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      <div className={`flex max-w-[85%] gap-2 ${rowDirection}`}>

        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${avatarStyle}`}
        >
          {isBot ? <Bot size={18} /> : <User size={18} />}
        </div>

        {/* Message */}
        <div className="flex flex-col">
          <div
            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${bubbleStyle}`}
          >
            {text}
          </div>

          {timestamp && (
            <span className="text-xs text-gray-400 mt-1 px-2">
              {timestamp}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}