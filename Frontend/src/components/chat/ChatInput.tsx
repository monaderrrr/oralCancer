import React, { useState, useEffect, useRef } from "react";
import { Send, Paperclip } from "lucide-react";
import { Button } from "../ui/Button";

interface ChatInputProps {
  onSend: (text: string, file?: File) => void; 
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  placeholder = "Type a message...",
  disabled,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null); 

  // ================= SEND =================
  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setMessage("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // ================= FILE CLICK =================
  const handleAttachClick = () => {
    fileRef.current?.click(); 
  };

  // ================= FILE CHANGE =================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSend("", file); 
    }

    // reset input
    e.target.value = "";
  };

  // ================= KEYBOARD =================
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ================= AUTO RESIZE =================
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="border-t border-gray-200 bg-white p-3">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">

        {/* 📎 Photo button  */}
        <button
          type="button"
          onClick={handleAttachClick}
          disabled={disabled}
          className="p-2 text-gray-500 hover:text-teal-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        {/* 👇 input*/}
        <input
          type="file"
          accept="image/*"
          ref={fileRef}
          className="hidden"
          onChange={handleFileChange}
        />

        {/* 📝 textarea */}
        <div className="flex-1 rounded-2xl bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-500">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full bg-transparent border-none focus:outline-none px-4 py-3 resize-none max-h-32 min-h-[44px]"
          />
        </div>

        {/* 📤 send */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
        >
          <Send className="h-4 w-4" />
        </Button>

      </div>
    </div>
  );
}