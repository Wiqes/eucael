import { Component, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { ChatStateService } from '../../core/services/state/chat-state.service';
import { NgFor, NgIf } from '@angular/common';
import { IChat, IParticipant } from '../../core/models/chat.model';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { BadgeModule } from 'primeng/badge';
import { Router } from '@angular/router';
import { ChatAvatarComponent } from '../../shared/ui/chat-avatar/chat-avatar.component';
import { OnlineStatusComponent } from '../../shared/ui/online-status/online-status.component';
import { Subject, takeUntil } from 'rxjs';
import { ChatService } from '../../core/services/chat/chat.service';
import { StateService } from '../../core/services/state/state.service';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';
import { TranslateModule } from '@ngx-translate/core';

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
    LoaderComponent,
    TranslateModule,
  ],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
})
export class MessagesComponent implements OnInit, OnDestroy {
  protected chatStateService = inject(ChatStateService);
  private chats = computed(() => this.chatStateService.chats());
  private chatService = inject(ChatService);
  private stateService = inject(StateService);
  private router = inject(Router);
  private currentUserProfile = computed(() => this.stateService.profile());
  currentUserId = computed(() => this.currentUserProfile()?.userId || '');
  private destroy$ = new Subject<void>();
  isChatsLoading = computed(() => this.chatService.isChatsLoading());

  interlocutors = computed<IParticipant[]>(() => {
    if (!this.chats()) {
      return [];
    }
    return this.chats()
      ?.map((chat) => {
        console.log('chat', this.currentUserId());
        const otherParticipant =
          chat.participant1Id === Number(this.currentUserId())
            ? chat.participant2
            : chat.participant1;
        return {
          id: otherParticipant?.id || '',
          chatId: chat.id,
          userId: otherParticipant?.id || '',
          isOnline: otherParticipant?.isOnline || false,
          profile: otherParticipant?.profile || null,
          lastMessageAt: chat.lastMessageAt,
          lastMessage: chat.messages[0]?.content || '',
          unreadCount: this.getUnreadCount(chat),
        } as IParticipant;
      })
      .sort((a, b) => {
        // Sort by last message time (most recent first)
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bTime - aTime;
      }) as IParticipant[];
  });

  constructor() {
    this.chatService
      .onConnect()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.connectToUserChats();
      });
  }

  ngOnInit(): void {
    this.chatService.isChatsLoading.set(true);
    if (this.chatService.isConnected()) {
      this.connectToUserChats();
    }
  }

  private connectToUserChats(): void {
    console.log('Connecting to user chats', this.chats());
    if (this.chats()) {
      this.chatService.isChatsLoading.set(false);
      return;
    }
    this.chatService.getUserChats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByFn(index: number, chat: IParticipant): string {
    return chat.chatId;
  }

  openChat(userId: string): void {
    this.router.navigate(['chat', userId]);
  }

  getUnreadCount(chat: IChat): number {
    return this.chatStateService.getUnreadCount(chat);
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
