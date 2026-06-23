import API from "../Api";
import socket from "../socket/Socket";

// ================= SAVE MESSAGE (API) =================
export const sendMessage = async (
  conversationId: string,
  text: string
) => {
  return await API.post(
    `/api/v1/chat/conversations/${conversationId}/messages`,
    { text }
  );
};

// ================= REAL TIME SEND =================
export const sendMessageRealTime = async (
  conversationId: string,
  text: string,
  receiverId: string,
  senderId: string
) => {
  // 1. save in DB
  const res = await sendMessage(conversationId, text);

  const savedMessage = res.data?.data;

  // 2. emit via socket
  socket.emit("send_message", {
    ...savedMessage,
    receiverId,
    senderId,
    conversationId,
  });

  return savedMessage;
};