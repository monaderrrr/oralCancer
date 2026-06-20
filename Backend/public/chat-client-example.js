// Frontend Integration Example - Complete Chat Application
// This shows how to integrate the chat system in a React/Vue/Vanilla JS app

// ============================================================================
// 1. VANILLA JAVASCRIPT CHAT CLIENT EXAMPLE
// ============================================================================

class ChatClient {
  constructor(serverUrl = 'http://localhost:3000') {
    this.io = window.io;
    this.socket = null;
    this.currentUserId = null;
    this.currentConversationId = null;
    this.isAuthenticated = false;
    this.messageHandlers = [];
    this.connectionHandlers = [];
  }

  // Initialize socket connection
  connect() {
    this.socket = this.io();

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.notifyConnectionChange(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isAuthenticated = false;
      this.notifyConnectionChange(false);
    });

    this.socket.on('authenticated', (data) => {
      this.isAuthenticated = true;
      this.currentUserId = data.userId;
      console.log('Authenticated as:', data.username);
    });

    this.socket.on('receiveMessage', (data) => {
      this.notifyMessageReceived(data);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('authError', (error) => {
      console.error('Auth error:', error);
      this.isAuthenticated = false;
    });
  }

  // Authenticate with JWT token
  authenticate(token) {
    if (!this.socket) this.connect();
    this.socket.emit('authenticate', token);
  }

  // Join a conversation
  joinConversation(conversationId) {
    if (!this.isAuthenticated) {
      console.error('Not authenticated');
      return;
    }

    this.currentConversationId = conversationId;
    this.socket.emit('joinConversation', { conversationId });
  }

  // Send a message
  sendMessage(text) {
    if (!this.currentConversationId) {
      console.error('Not in a conversation');
      return;
    }

    this.socket.emit('sendMessage', {
      conversationId: this.currentConversationId,
      text,
    });
  }

  // Notify typing
  notifyTyping() {
    this.socket.emit('userTyping', {
      conversationId: this.currentConversationId,
    });
  }

  // Stop typing
  stopTyping() {
    this.socket.emit('userStoppedTyping', {
      conversationId: this.currentConversationId,
    });
  }

  // Register message handler
  onMessage(callback) {
    this.messageHandlers.push(callback);
  }

  // Register connection change handler
  onConnectionChange(callback) {
    this.connectionHandlers.push(callback);
  }

  // Notify message received
  notifyMessageReceived(message) {
    this.messageHandlers.forEach(handler => handler(message));
  }

  // Notify connection change
  notifyConnectionChange(isConnected) {
    this.connectionHandlers.forEach(handler => handler(isConnected));
  }
}

// ============================================================================
// 2. REACT COMPONENT EXAMPLE
// ============================================================================

/*
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

export function ChatComponent() {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [conversationId, setConversationId] = useState('');
  const [jwtToken, setJwtToken] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize Socket.IO
    socketRef.current = io('http://localhost:3000');

    socketRef.current.on('authenticated', (data) => {
      setIsAuthenticated(true);
      console.log('Authenticated:', data.username);
    });

    socketRef.current.on('receiveMessage', (data) => {
      setMessages(prev => [...prev, data]);
    });

    socketRef.current.on('error', (error) => {
      console.error('Error:', error);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleAuthenticate = () => {
    if (jwtToken) {
      socketRef.current.emit('authenticate', jwtToken);
    }
  };

  const handleJoinConversation = () => {
    if (conversationId && isAuthenticated) {
      socketRef.current.emit('joinConversation', { conversationId });
    }
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      socketRef.current.emit('sendMessage', {
        conversationId,
        text: messageText,
      });
      setMessageText('');
    }
  };

  return (
    <div className="chat-container">
      {!isAuthenticated && (
        <div className="auth-section">
          <input
            value={jwtToken}
            onChange={(e) => setJwtToken(e.target.value)}
            placeholder="Paste JWT token..."
          />
          <button onClick={handleAuthenticate}>Authenticate</button>
        </div>
      )}

      {isAuthenticated && (
        <>
          <div className="conversation-section">
            <input
              value={conversationId}
              onChange={(e) => setConversationId(e.target.value)}
              placeholder="Enter Conversation ID..."
            />
            <button onClick={handleJoinConversation}>Join</button>
          </div>

          <div className="messages">
            {messages.map((msg, idx) => (
              <div key={idx} className="message">
                <strong>{msg.senderName}:</strong> {msg.text}
              </div>
            ))}
          </div>

          <div className="input-section">
            <input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </>
      )}
    </div>
  );
}
*/

// ============================================================================
// 3. API REST CLIENT EXAMPLE (Fetch wrapper)
// ============================================================================

class ChatApiClient {
  constructor(baseUrl = 'http://localhost:3000/api/v1/chat', token = '') {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  setToken(token) {
    this.token = token;
  }

  // Helper method for API calls
  async request(method, endpoint, body = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  // REST API Methods
  async createConversation(doctorId) {
    return this.request('POST', '/conversations', { doctorId });
  }

  async getConversations(page = 1, limit = 10) {
    return this.request('GET', `/conversations?page=${page}&limit=${limit}`);
  }

  async getConversation(conversationId) {
    return this.request('GET', `/conversations/${conversationId}`);
  }

  async getMessages(conversationId, page = 1, limit = 50) {
    return this.request('GET', `/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
  }

  async sendMessage(conversationId, text) {
    return this.request('POST', `/conversations/${conversationId}/messages`, { text });
  }

  async getUnreadCount(conversationId) {
    return this.request('GET', `/conversations/${conversationId}/unread-count`);
  }

  async closeConversation(conversationId) {
    return this.request('POST', `/conversations/${conversationId}/close`);
  }
}

// ============================================================================
// 4. USAGE EXAMPLE - COMPLETE WORKFLOW
// ============================================================================

/*
// Initialize clients
const apiClient = new ChatApiClient();
const chatClient = new ChatClient();

// Step 1: Get JWT token from login
const jwtToken = 'your-jwt-token-here';
apiClient.setToken(jwtToken);
chatClient.connect();

// Step 2: After payment, create a conversation
const conversation = await apiClient.createConversation('doctor-id-123');
const conversationId = conversation.data._id;

// Step 3: Authenticate socket
chatClient.authenticate(jwtToken);

// Step 4: Join conversation
chatClient.joinConversation(conversationId);

// Step 5: Listen for messages
chatClient.onMessage((message) => {
  console.log(`${message.senderName}: ${message.text}`);
  // Update UI with message
});

// Step 6: Send a message
chatClient.sendMessage('Hello doctor!');

// Step 7: Get message history
const messages = await apiClient.getMessages(conversationId);
console.log('Previous messages:', messages.data);

// Step 8: Get unread count
const unreadCount = await apiClient.getUnreadCount(conversationId);
console.log('Unread messages:', unreadCount.data.unreadCount);

// Step 9: Close conversation when done
await apiClient.closeConversation(conversationId);
*/

// ============================================================================
// 5. EXPORT FOR USE IN OTHER FILES
// ============================================================================

export { ChatClient, ChatApiClient };

// Usage in other files:
// import { ChatClient, ChatApiClient } from './chatClient.js';
