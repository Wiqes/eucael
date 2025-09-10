import { Component, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { ChatStateService } from '../../core/services/state/chat-state.service';
import { NgFor, NgIf } from '@angular/common';
import { IParticipant } from '../../core/models/chat.model';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { BadgeModule } from 'primeng/badge';
import { Router } from '@angular/router';
import { ChatAvatarComponent } from '../../shared/ui/chat-avatar/chat-avatar.component';
import { OnlineStatusComponent } from '../../shared/ui/online-status/online-status.component';
import { Subject, takeUntil } from 'rxjs';
import { ChatService } from '../../core/services/chat.service';
import { StateService } from '../../core/services/state/state.service';

@Component({
  selector: 'app-messages',
  imports: [
    NgFor,
    NgIf,
    AvatarModule,
    RippleModule,
    BadgeModule,
    ChatAvatarComponent,
    OnlineStatusComponent,
  ],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
})
export class MessagesComponent implements OnInit, OnDestroy {
  protected chatStateService = inject(ChatStateService);
  private chatService = inject(ChatService);
  private stateService = inject(StateService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  interlocutors = computed<IParticipant[]>(() =>
    this.chatStateService
      .chats()
      .map((chat) => {
        const currentUserId = this.stateService.user()?.id;
        const otherParticipant =
          chat.participant1Id === Number(currentUserId) ? chat.participant2 : chat.participant1;
        return {
          id: otherParticipant?.id || '',
          chatId: chat.id,
          userId: otherParticipant?.id || '',
          isOnline: otherParticipant?.isOnline || false,
          profile: otherParticipant?.profile || null,
          lastMessageAt: chat.lastMessageAt,
          unreadCount: this.getUnreadCount(chat.id),
        } as IParticipant;
      })
      .sort((a, b) => {
        // Sort by last message time (most recent first)
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bTime - aTime;
      }),
  );

  totalUnreadCount = computed(() => this.chatStateService.getTotalUnreadCount());

  ngOnInit(): void {
    this.chatService.isChatsLoading.set(true);
    this.chatService
      .onUserChats()
      .pipe(takeUntil(this.destroy$))
      .subscribe((chats) => {
        this.chatStateService.updateChats(chats);
        this.chatService.isChatsLoading.set(false);
      });

    this.chatService
      .onUserOnlineStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe((userStatus) => {
        this.chatStateService.updateUserOnlineStatus(userStatus.userId, userStatus.isOnline);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Note: We don't disconnect the socket here as it might be used by other components
    // The socket connection should be managed at a higher level (e.g., app level or auth service)
  }

  trackByFn(index: number, chat: IParticipant): string {
    return chat.chatId;
  }

  openChat(userId: string): void {
    this.router.navigate(['chat', userId]);
  }

  getUnreadCount(chatId: string): number {
    return this.chatStateService.getUnreadCount(chatId);
  }

  formatLastMessageTime(timestamp?: Date): string {
    if (!timestamp) return '';

    const now = new Date();
    const messageTime = new Date(timestamp);
    const diff = now.getTime() - messageTime.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) {
      return 'Now';
    } else if (minutes < 60) {
      return `${minutes}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else if (days < 7) {
      return `${days}d`;
    } else {
      return messageTime.toLocaleDateString();
    }
  }
}
