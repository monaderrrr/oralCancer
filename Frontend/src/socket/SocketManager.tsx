import socket from "./Socket";

export const connectSocket = () => {
  const token = localStorage.getItem("oral_scan_token");
  if (!token) return;

  if (socket.connected) return;

  console.log("🔌 Connecting socket...");
  socket.connect();

  socket.on("connect", () => {
    console.log("✅ Socket connected, authenticating...");
    socket.emit("authenticate", token);

    const userStr = localStorage.getItem("oral_scan_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user._id) {
          socket.emit("join_room", user._id);
          console.log(`✅ Joined room: ${user._id}`);
        }
      } catch (e) { console.error(e); }
    }
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.off("connect"); 
    socket.disconnect();
    console.log("❌ Socket disconnected");
  }
};