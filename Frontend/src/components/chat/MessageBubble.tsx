import { Check, CheckCheck, ExternalLink } from "lucide-react";

/**
 * Backend message structure
 */
interface MessageBubbleProps {
  message: {
    _id: string;
    text: string;
    image?: string;

    senderId: {
      _id: string;
      role: "patient" | "doctor";
      fullName?: string;
    } | string;

    createdAt: string;
    isRead?: boolean;
  };

  currentUserId: string;
}

export function MessageBubble({
  message,
  currentUserId,
}: MessageBubbleProps) {

  /**
   * Normalize senderId (backend inconsistency fix)
   */
  const senderId =
    typeof message.senderId === "string"
      ? message.senderId
      : message.senderId?._id;

  /**
   * Check ownership
   */
  const isOwn = senderId === currentUserId;

  /**
   * Safe time formatting
   */
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Safe Image Opener
   */
  const handleImageClick = () => {
    if (message.image) {
      window.open(message.image, "_blank");
    }
  };

  return (
    <div
      className={`flex w-full mb-3 ${
        isOwn ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[75%] md:max-w-[60%] px-4 py-3 rounded-2xl break-words shadow-sm transition-all ${
          isOwn
            ? "bg-teal-600 text-white rounded-br-none"
            : "bg-white border border-gray-100 text-gray-900 rounded-bl-none"
        }`}
      >

        {/* Image Section */}
        {message.image && (
          <div className="relative group mb-2">
            <img
              src={message.image}
              alt="chat attachment"
              className="rounded-xl max-h-72 w-full object-cover cursor-pointer hover:brightness-95 transition-all border border-black/5"
               onClick={() => window.open(message.image, "_blank")}
            />
            {/* Overlay Icon for UX */}
            <div className="absolute top-2 right-2 bg-black/40 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <ExternalLink className="w-3 h-3 text-white" />
            </div>
          </div>
        )}

        {/* Text Section */}
        {message.text && (
          <p className="text-[14px] whitespace-pre-wrap leading-relaxed">
            {message.text}
          </p>
        )}

        {/* Footer (Time & Read Status) */}
        <div className="flex items-center justify-end gap-1 mt-1 opacity-90">

          {/* Time */}
          <span
            className={`text-[10px] font-medium ${
              isOwn ? "text-teal-100" : "text-gray-400"
            }`}
          >
            {formatTime(message.createdAt)}
          </span>

          {/* Status Icons */}
          {isOwn && (
            <span className="ml-1 flex items-center">
              {message.isRead ? (
                <CheckCheck className="h-3.5 w-3.5 text-white" />
              ) : (
                <Check className="h-3.5 w-3.5 text-teal-200/80" />
              )}
            </span>
          )}

        </div>
      </div>
    </div>
  );
}