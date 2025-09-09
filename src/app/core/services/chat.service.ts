// src/app/services/chat.service.ts
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io'; // Still import Socket from ngx-socket-io
import { Observable, takeUntil } from 'rxjs';
import { IChat, IChatMessages } from '../models/chat.model';
import { IUserPresence, ITypingIndicator, IMessageRead } from '../models/notification.model';
import { ChatStateService } from './state/chat-state.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  // The Socket instance is now injected by Angular's DI system
  // because we provided it via provideSocketIo in appConfig.
  constructor(private socket: Socket, private chatStateService: ChatStateService) {
    this.subscribeToEvents();
  }

  subscribeToEvents(): void {
    this.onUserChats().subscribe((chats) => {
      this.chatStateService.updateChats(chats);
    });

    this.onUserOnlineStatus().subscribe((userStatus) => {
      console.log('User presence update:', userStatus);
    });

    // Handle connection errors
    this.onError().subscribe((error) => {
      console.error('Socket connection error', error);
    });
  }

  // ... rest of your ChatService methods remain the same ...

  // Check if socket is connected
  isConnected(): boolean {
    return this.socket.ioSocket.connected;
  }

  // Connect to the chat with authentication
  connect(token: string): void {
    // Avoid reconnecting if already connected
    if (this.isConnected()) {
      return;
    }

    if (token) {
      // Add authentication and user data to socket connection
      this.socket.ioSocket.auth = {
        token,
      };
    }
    this.socket.connect();
  }

  // Disconnect from the chat
  disconnect(): void {
    this.socket.disconnect();
  }

  // Emit a message to the server
  sendMessage(message: { content: string; senderId: number; receiverId: number }): void {
    this.socket.emit('sendMessage', message);
  }

  // Listen for incoming messages
  onReceiveMessage(): Observable<any> {
    return this.socket.fromEvent('receiveMessage');
  }

  onUserOnlineStatus(): Observable<IUserPresence> {
    return this.socket.fromEvent('userOnlineStatus');
  }

  // Join a specific chat room (e.g., when opening a chat with a user)
  joinChat(participant1Id: number, participant2Id: number): Observable<string> {
    this.socket.emit('joinChat', { participant1Id, participant2Id });
    return this.socket.fromEvent('joinChatResponse');
  }

  // Leave a chat room
  leaveChat(chatId: string): void {
    this.socket.emit('leaveChat', { chatId });
  }

  // Mark message as read
  markMessageAsRead(messageId: string): void {
    this.socket.emit('markMessageAsRead', { messageId });
  }

  // Listen for message read confirmations
  onMessageRead(): Observable<IMessageRead> {
    return this.socket.fromEvent('messageRead');
  }

  // Send typing indicator
  sendTypingIndicator(chatId: string, isTyping: boolean): void {
    this.socket.emit('typing', { chatId, isTyping });
  }

  // Listen for typing indicators
  onUserTyping(): Observable<ITypingIndicator> {
    return this.socket.fromEvent('userTyping');
  }

  // Listen for updated chat list
  onUserChats(): Observable<IChat[]> {
    return this.socket.fromEvent('userChats');
  }

  // Listen for previous messages when joining a chat
  onPreviousMessages(): Observable<IChatMessages> {
    return this.socket.fromEvent('previousMessages');
  }

  // Listen for connection status
  onConnect(): Observable<void> {
    return this.socket.fromEvent('connect');
  }

  onDisconnect(): Observable<void> {
    return this.socket.fromEvent('disconnect');
  }

  onError(): Observable<any> {
    return this.socket.fromEvent('connect_error');
  }
}
