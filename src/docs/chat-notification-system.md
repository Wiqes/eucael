# Chat Notification System Implementation

This document describes the comprehensive chat notification system implemented for real-time messaging with user presence tracking and notifications.

## Features Implemented

### 1. Real-time Messaging with Notifications

- Real-time message delivery via WebSockets
- Instant notifications for new messages
- Message read receipts and delivery status
- Typing indicators

### 2. User Presence System

- Online/offline status tracking
- Last seen timestamps
- Multiple device support (user can be connected from multiple devices)

### 3. Notification Management

- Persistent notifications for offline users
- Push notification support for mobile devices
- Unread message counters
- Notification history and management

### 4. Chat Management

- Chat-level unread message counts
- Message history with pagination
- Chat list with last message preview and unread counts

## Database Schema Changes

### User Model Updates

```prisma
model User {
  isOnline    Boolean   @default(false)
  lastSeen    DateTime  @default(now())
  notifications Notification[]
  // ... existing fields
}
```

### Chat Model Updates

```prisma
model Chat {
  lastMessageAt DateTime @default(now())
  unreadCount1  Int      @default(0) // Unread messages for participant1
  unreadCount2  Int      @default(0) // Unread messages for participant2
  // ... existing fields
}
```

### Message Model Updates

```prisma
model Message {
  isRead      Boolean   @default(false)
  deliveredAt DateTime?
  readAt      DateTime?
  // ... existing fields
}
```

### New Notification Model

```prisma
model Notification {
  id        Int      @id @default(autoincrement())
  userId    Int
  type      String   // 'message', 'user_online', etc.
  title     String
  message   String
  data      Json?    // Additional data (e.g., chatId, senderId)
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## WebSocket Events

### Client → Server Events

#### Authentication & Connection

```javascript
// Connect with user credentials
socket.emit('connect', {
  userId: 123,
  username: 'john_doe',
});
```

#### Messaging

```javascript
// Send a message
socket.emit('sendMessage', {
  receiverId: 456,
  content: 'Hello, how are you?',
});

// Join a chat room
socket.emit('joinChat', {
  participant1Id: 123,
  participant2Id: 456,
});

// Leave a chat room
socket.emit('leaveChat', {
  chatId: 789,
});

// Mark message as read
socket.emit('markMessageAsRead', {
  messageId: 101,
});

// Typing indicators
socket.emit('typing', {
  chatId: 789,
  isTyping: true,
});
```

#### Notification Management

```javascript
// Get notifications
socket.emit('getNotifications', {
  unreadOnly: true,
});

// Mark notification as read
socket.emit('markNotificationAsRead', {
  notificationId: 202,
});

// Get user's chat list
socket.emit('getUserChats');
```

### Server → Client Events

#### Real-time Messaging

```javascript
// Receive a new message
socket.on('receiveMessage', (message) => {
  console.log('New message:', message);
  // Display message in chat UI
});

// Get previous messages when joining chat
socket.on('previousMessages', ({ messages, chat }) => {
  console.log('Chat history:', messages);
  // Display message history
});
```

#### Notifications

```javascript
// Real-time message notification (for users not in the chat)
socket.on('newMessageNotification', (notification) => {
  console.log('New message from:', notification.senderUsername);
  // Show notification popup/badge
  // Play notification sound
});

// Unread notification count
socket.on('unreadNotificationCount', ({ count }) => {
  console.log('Unread notifications:', count);
  // Update notification badge
});

// All notifications
socket.on('notifications', (notifications) => {
  console.log('User notifications:', notifications);
  // Display notifications list
});
```

#### User Presence

```javascript
// User online/offline status changes
socket.on('userOnlineStatus', ({ userId, isOnline, timestamp }) => {
  console.log(\`User \${userId} is \${isOnline ? 'online' : 'offline'}\`);
  // Update user status in UI
});

// Typing indicators
socket.on('userTyping', ({ userId, username, isTyping, chatId }) => {
  console.log(\`\${username} is \${isTyping ? 'typing' : 'stopped typing'}\`);
  // Show/hide typing indicator
});
```

#### Chat Management

```javascript
// Updated chat list with unread counts
socket.on('userChats', (chats) => {
  console.log('User chats:', chats);
  // Update chat list UI with unread counts
});

// Message read confirmation
socket.on('messageRead', ({ messageId, readAt, readBy }) => {
  console.log(\`Message \${messageId} read by user \${readBy}\`);
  // Show read receipt (blue checkmarks)
});
```

#### Error Handling

```javascript
// Handle errors
socket.on('error', ({ message }) => {
  console.error('Socket error:', message);
  // Show error message to user
});
```

## REST API Endpoints

### Notification Management

```
GET    /notifications              # Get user notifications
GET    /notifications?unreadOnly=true  # Get only unread notifications
GET    /notifications/count        # Get unread notification count
POST   /notifications/:id/read     # Mark notification as read
POST   /notifications/read-all     # Mark all notifications as read
DELETE /notifications/:id          # Delete notification
```

## Frontend Implementation Example

### Basic Chat Component

```javascript
class ChatComponent {
  constructor() {
    this.socket = io('ws://localhost:3000', {
      query: {
        userId: this.currentUser.id,
        username: this.currentUser.username,
      },
    });

    this.setupSocketListeners();
  }

  setupSocketListeners() {
    // Message handling
    this.socket.on('receiveMessage', this.handleNewMessage.bind(this));
    this.socket.on('previousMessages', this.loadChatHistory.bind(this));

    // Notifications
    this.socket.on('newMessageNotification', this.showNotification.bind(this));
    this.socket.on(
      'unreadNotificationCount',
      this.updateNotificationBadge.bind(this),
    );

    // Presence
    this.socket.on('userOnlineStatus', this.updateUserStatus.bind(this));
    this.socket.on('userTyping', this.showTypingIndicator.bind(this));

    // Chat management
    this.socket.on('userChats', this.updateChatList.bind(this));
    this.socket.on('messageRead', this.showReadReceipt.bind(this));
  }

  sendMessage(content, receiverId) {
    this.socket.emit('sendMessage', {
      content,
      receiverId,
    });
  }

  joinChat(otherUserId) {
    this.socket.emit('joinChat', {
      participant1Id: this.currentUser.id,
      participant2Id: otherUserId,
    });
  }

  markAsRead(messageId) {
    this.socket.emit('markMessageAsRead', { messageId });
  }

  showTyping(chatId, isTyping) {
    this.socket.emit('typing', { chatId, isTyping });
  }

  handleNewMessage(message) {
    // Add message to chat UI
    this.addMessageToChat(message);

    // Mark as read if chat is active
    if (this.activeChatId === message.chatId) {
      this.markAsRead(message.id);
    }
  }

  showNotification(notification) {
    // Show browser notification
    if (Notification.permission === 'granted') {
      new Notification(notification.senderUsername, {
        body: notification.message,
        icon: '/notification-icon.png',
      });
    }

    // Play sound
    this.playNotificationSound();

    // Update UI
    this.showNotificationBadge();
  }

  updateNotificationBadge(data) {
    const badge = document.getElementById('notification-badge');
    badge.textContent = data.count;
    badge.style.display = data.count > 0 ? 'block' : 'none';
  }
}
```

### Notification Permission Setup

```javascript
// Request notification permission on app load
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}
```

## Best Practices Implemented

1. **Connection Management**: Proper tracking of user connections with cleanup on disconnect
2. **Message Delivery**: Immediate delivery for online users, persistent storage for offline users
3. **Read Receipts**: Track message read status and notify senders
4. **Typing Indicators**: Real-time typing status for better UX
5. **Unread Counters**: Accurate unread message counts at both chat and global level
6. **Error Handling**: Comprehensive error handling for network issues
7. **Scalability**: Clean separation of concerns with dedicated services
8. **Security**: JWT-based authentication for WebSocket connections
9. **Performance**: Efficient database queries with proper indexing
10. **User Experience**: Real-time updates, notifications, and presence indicators

## Usage Notes

1. **Authentication**: Users must be authenticated via JWT to connect to WebSocket
2. **Connection**: Pass userId and username in the WebSocket connection query
3. **Rooms**: Users automatically join personal rooms for notifications
4. **Cleanup**: System automatically cleans up old read notifications (30 days by default)
5. **Multi-device**: System supports multiple connections per user
6. **Offline Handling**: Messages are stored and notifications created for offline users

This implementation provides a production-ready chat notification system with all the essential features for modern real-time messaging applications.
