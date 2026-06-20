import socket from "./Socket";

export const connectSocket = () => {
  const token = localStorage.getItem("oral_scan_token");
  if (!token) {
    console.warn("⚠️ No token found, cannot connect socket");
    return;
  }

  if (!socket.connected) {
    console.log("🔌 Connecting socket...");
    socket.connect();
  }

  // Authenticate with token
  socket.emit("authenticate", token);

  // Send join_room event for notifications
  const userStr = localStorage.getItem("oral_scan_user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user._id) {
        socket.emit("join_room", user._id);
        console.log(`✅ Joined notification room for user: ${user._id}`);
      }
    } catch (e) {
      console.error("Error parsing user:", e);
    }
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    console.log("❌ Disconnecting socket...");
    socket.disconnect();
  }
};