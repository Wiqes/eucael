import { Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { ChatStateService } from '../../core/services/state/chat-state.service';
import { NgFor, NgIf } from '@angular/common';
import { IChat, IParticipant } from '../../core/models/chat.model';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { BadgeModule } from 'primeng/badge';
import { Router } from '@angular/router';
import { ChatAvatarComponent } from '../../shared/ui/chat-avatar/chat-avatar.component';
import { OnlineStatusComponent } from '../../shared/ui/online-status/online-status.component';
import {
  Subject,
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  of,
} from 'rxjs';
import { ChatService } from '../../core/services/chat/chat.service';
import { StateService } from '../../core/services/state/state.service';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';
import { TranslateModule } from '@ngx-translate/core';
import { DataAccessService } from '../../core/services/data-access/data-access.service';
import { IFoundUser } from '../../core/models/entities/user.model';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

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
    ReactiveFormsModule,
    IconFieldModule,
    InputIconModule,
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
  private dataAccessService = inject(DataAccessService);
  private currentUserProfile = computed(() => this.stateService.profile());
  currentUserId = computed(() => this.currentUserProfile()?.userId || '');
  private destroy$ = new Subject<void>();
  isChatsLoading = computed(() => this.chatService.isChatsLoading());

  // Search functionality
  searchControl = new FormControl('');
  searchResults = signal<IFoundUser[]>([]);
  isSearching = signal(false);
  showSearchResults = signal(false);

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

    // Set up search with debounce
    this.searchControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query || query.trim().length < 2) {
            this.showSearchResults.set(false);
            this.searchResults.set([]);
            this.isSearching.set(false);
            return of([]);
          }

          this.isSearching.set(true);
          this.showSearchResults.set(true);
          return this.dataAccessService.searchUsers(query.trim()).pipe(
            catchError((error) => {
              console.error('Search error:', error);
              this.isSearching.set(false);
              return of([]);
            }),
          );
        }),
      )
      .subscribe((results) => {
        this.searchResults.set(results);
        this.isSearching.set(false);
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

  clearSearch(): void {
    this.searchControl.setValue('');
    this.showSearchResults.set(false);
    this.searchResults.set([]);
  }

  selectUser(userId: string): void {
    this.clearSearch();
    this.openChat(userId);
  }

  onSearchFocus(): void {
    if (this.searchControl.value && this.searchControl.value.trim().length >= 2) {
      this.showSearchResults.set(true);
    }
  }

  onSearchBlur(): void {
    // Delay to allow click events on search results
    setTimeout(() => {
      this.showSearchResults.set(false);
    }, 200);
  }
}
