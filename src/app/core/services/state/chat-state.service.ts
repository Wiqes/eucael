import { computed, inject, Injectable, signal } from '@angular/core';
import { StateService } from './state.service';
import { IChat } from '../../models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatStateService {
  private readonly stateService = inject(StateService);

  chats = signal<IChat[]>([]);

  /**
   * Update chats with new data (e.g., from WebSocket)
   */
  updateChats(chats: IChat[]): void {
    this.chats.set(chats);
  }

  /**
   * Get unread count for a specific chat and current user
   */
  getUnreadCount(chatId: string): number {
    const chat = this.chats().find((c) => c.id === chatId);
    if (!chat) return 0;

    const currentUserId = this.stateService.user()?.id;
    if (!currentUserId) return 0;

    // Determine which unread count to use based on current user
    if (chat.participant1Id.toString() === currentUserId) {
      return chat.unreadCount1 || 0;
    } else if (chat.participant2Id.toString() === currentUserId) {
      return chat.unreadCount2 || 0;
    }

    return 0;
  }

  /**
   * Get total unread messages count across all chats
   */
  getTotalUnreadCount(): number {
    return this.chats().reduce((total, chat) => {
      return total + this.getUnreadCount(chat.id);
    }, 0);
  }

  /**
   * Mark chat as read by setting unread count to 0
   */
  markChatAsRead(chatId: string): void {
    const chats = this.chats();
    const updatedChats = chats.map((chat) => {
      if (chat.id === chatId) {
        const currentUserId = this.stateService.user()?.id;
        if (!currentUserId) return chat;

        if (chat.participant1Id.toString() === currentUserId) {
          return { ...chat, unreadCount1: 0 };
        } else if (chat.participant2Id.toString() === currentUserId) {
          return { ...chat, unreadCount2: 0 };
        }
      }
      return chat;
    });

    this.chats.set(updatedChats);
  }

  /**
   * Update unread count for a specific chat
   */
  updateChatUnreadCount(chatId: string, unreadCount: number): void {
    const chats = this.chats();
    const updatedChats = chats.map((chat) => {
      if (chat.id === chatId) {
        const currentUserId = this.stateService.user()?.id;
        if (!currentUserId) return chat;

        if (chat.participant1Id.toString() === currentUserId) {
          return { ...chat, unreadCount1: unreadCount };
        } else if (chat.participant2Id.toString() === currentUserId) {
          return { ...chat, unreadCount2: unreadCount };
        }
      }
      return chat;
    });

    this.chats.set(updatedChats);
  }

  /**
   * Get chat by ID
   */
  getChatById(chatId: string): IChat | undefined {
    return this.chats().find((chat) => chat.id === chatId);
  }

  /**
   * Get chat by participant ID (find chat with specific user)
   */
  getChatByParticipantId(participantId: string): IChat | undefined {
    return this.chats().find(
      (chat) =>
        chat.participant1Id.toString() === participantId ||
        chat.participant2Id.toString() === participantId,
    );
  }

  /**
   * Update last message timestamp for a chat
   */
  updateChatLastMessage(chatId: string, timestamp: Date): void {
    const chats = this.chats();
    const updatedChats = chats.map((chat) => {
      if (chat.id === chatId) {
        return { ...chat, lastMessageAt: timestamp };
      }
      return chat;
    });

    this.chats.set(updatedChats);
  }

  /**
   * Clear all chats
   */
  clearChats(): void {
    this.chats.set([]);
  }
}
