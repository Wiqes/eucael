// src/app/services/chat.service.ts
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io'; // Still import Socket from ngx-socket-io
import { Observable } from 'rxjs';
// environment is still needed for the URL in main.ts, but not directly in the service's constructor anymore
// because the 'Socket' instance is now injected.

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  // The Socket instance is now injected by Angular's DI system
  // because we provided it via provideSocketIo in appConfig.
  constructor(private socket: Socket) {
    // No need to manually create new Socket({ url: ... }) here anymore.
    // The injected 'socket' instance is already configured.
  }

  // ... rest of your ChatService methods remain the same ...

  // Connect to the chat
  connect(): void {
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

  // Join a specific chat room (e.g., when opening a chat with a user)
  joinChat(participant1Id: number, participant2Id: number): Observable<string> {
    this.socket.emit('joinChat', { participant1Id, participant2Id });
    return this.socket.fromEvent('joinChatResponse');
  }

  // Listen for previous messages when joining a chat
  onPreviousMessages(): Observable<any[]> {
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
