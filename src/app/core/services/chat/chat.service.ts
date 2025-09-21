// src/app/services/chat.service.ts
import { inject, Injectable, signal } from '@angular/core';
import { Socket } from 'ngx-socket-io'; // Still import Socket from ngx-socket-io
import { Observable } from 'rxjs';
import { ChatStateService } from '../state/chat-state.service';
import { ITypingIndicator, IUserPresence } from '../../models/notification.model';
import { IChat, IChatMessages } from '../../models/chat.model';
import { InterlocutorService } from './interlocutor.service';
import { SOCKET_ERROR } from '../../constants/socket-error';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private interlocutorService = inject(InterlocutorService);
  private socket = inject(Socket);
  private chatStateService = inject(ChatStateService);
  isChatsLoading = signal<boolean>(false);
  isUserAuthenticated = signal<boolean>(false);

  constructor() {
    this.subscribeToEvents();
  }

  subscribeToEvents(): void {
    this.onIsAuthenticated().subscribe((isAuth) => {
      this.isUserAuthenticated.set(isAuth);
    });

    this.onUserChats().subscribe((chats) => {
      this.chatStateService.updateChats(chats);
      this.isChatsLoading.set(false);
    });

    this.onUserOnlineStatus().subscribe((userStatus) => {
      this.chatStateService.updateUserOnlineStatus(userStatus.userId, userStatus.isOnline);
      this.interlocutorService.changeOnlineStatus(userStatus.userId, userStatus.isOnline);
    });

    // Handle connection errors
    this.onError().subscribe((error) => {
      if (error.message === SOCKET_ERROR.INVALID_TOKEN) {
        this.isUserAuthenticated.set(false);
      }
    });

    this.onDisconnect().subscribe(() => {
      this.isUserAuthenticated.set(false);
      this.chatStateService.chats.set(null);
    });
  }

  // ... rest of your ChatService methods remain the same ...

  // Check if socket is connected
  isConnected(): boolean {
    return this.socket.ioSocket.connected;
  }

  // Connect to the chat with authentication
  connect(token: string): void {
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

  // Listen for incoming messages
  onIsAuthenticated(): Observable<boolean> {
    return this.socket.fromEvent('isAuthenticated');
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
  markMessageAsRead(chatId: string): void {
    this.socket.emit('markMessageAsRead', { chatId });
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

  // Request user chats
  getUserChats(): void {
    this.socket.emit('getUserChats');
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
    return this.socket.fromEvent('error');
  }
}
