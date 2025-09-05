import { Component, computed, inject } from '@angular/core';
import { ChatStateService } from '../../core/services/state/chat-state.service';
import { NgFor, NgIf } from '@angular/common';
import { IParticipant } from '../../core/models/chat.model';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { BadgeModule } from 'primeng/badge';
import { Router } from '@angular/router';
import { ChatAvatarComponent } from '../../shared/ui/chat-avatar/chat-avatar.component';

@Component({
  selector: 'app-messages',
  imports: [NgFor, NgIf, AvatarModule, RippleModule, BadgeModule, ChatAvatarComponent],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
})
export class MessagesComponent {
  protected chatStateService = inject(ChatStateService);
  private router = inject(Router);
  interlocutors = computed<IParticipant[]>(() =>
    this.chatStateService.chats().map(
      (chat) =>
        ({
          chatId: chat.id,
          profile: chat.participant2?.profile || chat.participant1?.profile || null,
        } as IParticipant),
    ),
  );

  trackByFn(index: number, chat: IParticipant): string {
    return chat.chatId;
  }

  openChat(chatId: string): void {
    this.router.navigate(['chat', chatId]);
  }

  getUnreadCount(chatId: string): number {
    // This would typically come from a service or state
    // For now, returning a mock value
    return Math.floor(Math.random() * 5);
  }
}
