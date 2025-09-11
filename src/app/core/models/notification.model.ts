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
