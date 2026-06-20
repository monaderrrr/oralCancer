import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles, Copy, Check } from "lucide-react";
import { ChatbotMessage } from "./ChatbotMessage";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  time: string;
}

const QUICK_REPLIES = [
  "What are the symptoms?",
  "Risk factors?",
  "How to scan?",
  "Find a doctor",
];

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const time = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    setMessages([
      {
        id: crypto.randomUUID(),
        text: "Hi! I'm your AI health assistant. Ask me anything about oral cancer symptoms, risk factors or screening.",
        isBot: true,
        time: time(),
      },
    ]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  const getBotResponse = (input: string) => {
    const lower = input.toLowerCase();

    if (lower.includes("symptom"))
      return "Common symptoms include mouth ulcers lasting more than 2 weeks, red or white patches, difficulty swallowing, lumps in the mouth, and unexplained bleeding.";

    if (lower.includes("risk"))
      return "Risk factors include tobacco use, alcohol consumption, HPV infection, excessive sun exposure, and weakened immunity.";

    if (lower.includes("scan"))
      return "You can upload a mouth image in the Scan section and our AI model will analyze it for possible oral cancer signs.";

    if (lower.includes("doctor"))
      return "You can connect with certified doctors directly through the 'Chat with Doctor' feature.";

    return "I recommend reviewing the Symptoms section or starting a scan if you notice unusual changes.";
  };

  const streamBotMessage = async (text: string) => {
    let current = "";

    const id = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      { id, text: "", isBot: true, time: time() },
    ]);

    for (let i = 0; i < text.length; i++) {
      await new Promise((r) => setTimeout(r, 15));

      current += text[i];

      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, text: current } : m))
      );
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || typing) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      text: input,
      isBot: false,
      time: time(),
    };

    setMessages((prev) => [...prev, userMsg]);

    setInput("");
    textareaRef.current!.style.height = "auto";

    setTyping(true);

    const response = getBotResponse(input);

    await streamBotMessage(response);

    setTyping(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg flex items-center justify-center transition hover:scale-105"
        >
          <MessageCircle size={26} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[400px] h-[620px] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden">

          {/* HEADER */}
          <div className="bg-teal-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles size={18} />
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-xs opacity-80">Always here to help</p>
              </div>
            </div>

            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg) => (
              <ChatbotMessage key={msg.id} message={msg} />
            ))}

            {typing && (
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-400"></div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* QUICK REPLIES */}
          <div className="flex gap-2 px-3 py-2 border-t overflow-x-auto">
            {QUICK_REPLIES.map((q) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                className="text-xs bg-gray-100 px-3 py-1 rounded-full hover:bg-teal-50 hover:text-teal-700 whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>

          {/* INPUT */}
          <div className="p-3 border-t flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize();
              }}
              onKeyDown={handleKey}
              placeholder="Ask a question..."
              className="flex-1 resize-none bg-gray-100 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none max-h-32"
            />

            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-10 h-10 bg-teal-600 hover:bg-teal-700 text-white rounded-full flex items-center justify-center"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}