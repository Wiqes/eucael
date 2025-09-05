import { Component, computed, inject } from '@angular/core';
import { ChatStateService } from '../../core/services/state/chat-state.service';
import { NgFor, NgIf } from '@angular/common';
import { IParticipant } from '../../core/models/chat.model';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-messages',
  imports: [NgFor, NgIf, AvatarModule, RippleModule, BadgeModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
})
export class MessagesComponent {
  private chatStateService = inject(ChatStateService);
  interlocutors = computed<IParticipant[]>(() =>
    [...this.chatStateService.chats(), ...this.chatStateService.chats()].map(
      (chat) =>
        ({
          chatId: chat.id,
          profile: chat.participant2?.profile || chat.participant2?.profile || null,
        } as IParticipant),
    ),
  );

  trackByFn(index: number, chat: IParticipant): string {
    return chat.chatId;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#DDA0DD',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E9',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getUnreadCount(chatId: string): number {
    // This would typically come from a service or state
    // For now, returning a mock value
    return Math.floor(Math.random() * 5);
  }
}
