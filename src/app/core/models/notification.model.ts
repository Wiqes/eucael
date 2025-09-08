export interface INotification {
  id: number;
  userId: number;
  type: string; // 'message', 'user_online', etc.
  title: string;
  message: string;
  data?: any; // Additional data (e.g., chatId, senderId)
  isRead: boolean;
  createdAt: Date;
}

export interface INotificationCount {
  count: number;
}

export interface IUserPresence {
  userId: string;
  isOnline: boolean;
  timestamp: Date;
}

export interface ITypingIndicator {
  userId: string;
  username: string;
  isTyping: boolean;
  chatId: string;
}

export interface IMessageRead {
  messageId: string;
  readAt: Date;
  readBy: string;
}

export interface INewMessageNotification {
  id: number;
  senderUsername: string;
  senderUserId: string;
  message: string;
  chatId: string;
  timestamp: Date;
}
