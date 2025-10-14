// src/app/chat/chat.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  inject,
  computed,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  signal,
  effect,
} from '@angular/core';
import { Subscription, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common'; // Needed for *ngFor, *ngIf etc.
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule here
import { ChatService } from '../../core/services/chat/chat.service';
import { StateService } from '../../core/services/state/state.service';
import { ChatStateService } from '../../core/services/state/chat-state.service';
import { IChatMessages, IChatMessage } from '../../core/models/chat.model';
import { ITypingIndicator } from '../../core/models/notification.model';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';
import { InterlocutorService } from '../../core/services/chat/interlocutor.service';
import { ChatHeaderComponent } from './chat-header/chat-header.component';
import { AuthTokenStateService } from '../../core/services/state/auth-token-state.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageInputComponent } from './message-input/message-input.component';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-chat',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule, // Required for common Angular directives like *ngFor, *ngIf
    FormsModule, // Required for ngModel
    LoaderComponent,
    ChatHeaderComponent,
    TranslateModule,
    MessageInputComponent,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  private chatService = inject(ChatService);
  private route = inject(ActivatedRoute);
  private stateService = inject(StateService);
  private chatStateService = inject(ChatStateService);
  private destroy$ = new Subject<void>();
  private authTokenStateService = inject(AuthTokenStateService);
  private token = computed(() => this.authTokenStateService.token());
  private interlocutorService = inject(InterlocutorService);
  private confirmationService = inject(ConfirmationService);
  private translateService = inject(TranslateService);

  myProfile = computed(() => this.stateService.profile() || null);
  currentUserId = computed(() => this.myProfile()?.userId || '');
  interlocutor = computed(() => this.interlocutorService.interlocutor() || null);
  isOnline = computed(() => this.interlocutor()?.isOnline || false);
  interlocutorProfile = computed(() => this.interlocutor()?.profile || null);

  @Input() receiverId = '';
  @ViewChild('messagesContainer', { static: false }) messagesContainer!: ElementRef;
  @ViewChild('messageInput', { static: false }) messageInput!: ElementRef;

  messages: IChatMessage[] = [];
  isLoading = signal(false);
  showScrollToBottom = signal(false);

  // New properties for enhanced features
  activeChatId = signal<string>('');
  typingUsers = signal<ITypingIndicator[]>([]);

  private messageSubscription!: Subscription;
  private previousMessagesSubscription!: Subscription;
  private shouldScrollToBottom = false;
  private scrollTimeout: ReturnType<typeof setTimeout> | null = null;
  private isUserScrolling = false;

  constructor() {
    effect(() => {
      const token = this.token();
      if (token) {
        this.chatService.connect(token);
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.receiverId = params.get('receiverId') || '';
      if (this.receiverId) {
        this.isLoading.set(true);
        if (this.chatService.isConnected()) {
          this.startChatRoom();
        } else {
          this.chatService
            .onConnect()
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.startChatRoom();
            });
        }
      }
    });
  }

  startChatRoom(): void {
    this.joinChatRoom();
    this.subscribeToMessages();
    this.setupEnhancedSocketListeners();
  }

  /**
   * Setup enhanced socket listeners for new features
   */
  private setupEnhancedSocketListeners(): void {
    // Typing indicators
    this.chatService
      .onUserTyping()
      .pipe(takeUntil(this.destroy$))
      .subscribe((typingData: ITypingIndicator) => {
        if (typingData.chatId === this.activeChatId()) {
          this.updateTypingUsers(typingData);
        }
      });

    // Message removal
    this.chatService
      .onMessageRemoved()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: { messageId: number; chatId: string }) => {
        if (data.chatId === this.activeChatId()) {
          this.removeMessageFromUI(data.messageId);
        }
      });
  }

  /**
   * Update typing users list
   */
  private updateTypingUsers(typingData: ITypingIndicator): void {
    const currentUsers = this.typingUsers();

    if (typingData.isTyping) {
      // Add user to typing list if not already there
      if (!currentUsers.find((u) => u.userId === typingData.userId)) {
        this.typingUsers.set([...currentUsers, typingData]);
      }
    } else {
      // Remove user from typing list
      this.typingUsers.set(currentUsers.filter((u) => u.userId !== typingData.userId));
    }
  }

  /**
   * Get typing indicator visibility
   */
  getTypingIndicatorVisible(): boolean {
    return (
      this.typingUsers().length > 0 &&
      !this.typingUsers().some((u) => u.userId === this.currentUserId())
    );
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom && !this.isUserScrolling) {
      this.scrollToBottomSmooth();
      this.shouldScrollToBottom = false;
    }
  }

  /**
   * Scrolls the messages container to the bottom smoothly
   */
  private scrollToBottomSmooth(): void {
    try {
      if (this.messagesContainer?.nativeElement) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'smooth',
        });
      }
    } catch (err) {
      console.warn('Could not scroll to bottom:', err);
    }
  }

  /**
   * Scrolls the messages container to the bottom instantly
   */
  private scrollToBottom(): void {
    try {
      if (this.messagesContainer?.nativeElement) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.warn('Could not scroll to bottom:', err);
    }
  }

  /**
   * Checks if the user is near the bottom of the scroll area
   */
  private isNearBottom(): boolean {
    if (!this.messagesContainer?.nativeElement) return false;

    const element = this.messagesContainer.nativeElement;
    const threshold = 100; // pixels from bottom
    return element.scrollTop + element.clientHeight >= element.scrollHeight - threshold;
  }

  /**
   * Handles scroll events to determine if auto-scroll should be enabled
   */
  onScroll(): void {
    // Mark that user is actively scrolling
    this.isUserScrolling = true;

    // Clear any existing timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // Check if user is near bottom
    const nearBottom = this.isNearBottom();

    // Update scroll to bottom button visibility
    this.showScrollToBottom.set(!nearBottom);

    // Set timeout to detect when user stops scrolling
    this.scrollTimeout = setTimeout(() => {
      this.isUserScrolling = false;
      // Only enable auto-scroll if user is near bottom when they stop scrolling
      if (nearBottom) {
        this.shouldScrollToBottom = true;
      }
    }, 150); // 150ms delay after user stops scrolling
  }
  /**
   * Subscribes to incoming messages using ChatService and updates the messages array.
   */
  subscribeToMessages(): void {
    this.messageSubscription = this.chatService
      .onReceiveMessage()
      .subscribe((message: IChatMessage) => {
        // Check if user was near bottom before adding message
        const wasNearBottom = this.isNearBottom();
        console.log('Received message:', message);

        if (message.sender.id !== this.currentUserId()) {
          this.messages = [...this.messages, message];
          this.updateChatUnreadCount();
        }

        // Only auto-scroll if user was near bottom or if it's their own message
        if (wasNearBottom || message.sender.id === this.currentUserId()) {
          this.shouldScrollToBottom = true;
        }
      });
  }

  handleMessageSent(message: IChatMessage): void {
    this.messages.push(message);
    this.shouldScrollToBottom = true;
  }

  ngOnDestroy(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // Unsubscribe from all subscriptions
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.previousMessagesSubscription) {
      this.previousMessagesSubscription.unsubscribe();
    }

    // Complete destroy subject
    this.destroy$.next();
    this.destroy$.complete();

    // Leave chat room
    if (this.activeChatId()) {
      this.chatService.leaveChat(this.activeChatId());
    }
  }

  joinChatRoom(): void {
    this.chatService
      .joinChat(Number(this.currentUserId()), Number(this.receiverId))
      .subscribe((chatId) => {
        console.log(`Joined chat with ID: ${chatId}`);
        this.activeChatId.set(chatId);
      });

    this.previousMessagesSubscription = this.chatService
      .onPreviousMessages()
      .subscribe(({ messages, chat }: IChatMessages) => {
        const participant =
          chat.participant1?.id === this.currentUserId() ? chat.participant2 : chat.participant1;
        if (participant) {
          this.interlocutorService.interlocutor.set(participant);
        }
        console.log('Joined chat room:', chat);
        this.messages = messages;
        this.isLoading.set(false);

        // Set active chat ID
        this.activeChatId.set(chat.id);

        // Scroll to bottom after loading messages (use instant scroll for initial load)
        setTimeout(() => {
          this.scrollToBottom();
          // Hide the scroll to bottom button initially
          this.showScrollToBottom.set(false);
        }, 100);
      });
  }

  /**
   * Update chat unread count
   */
  updateChatUnreadCount(): void {
    // This would typically be handled by the backend
    // but we can update the local state if needed
    if (this.activeChatId()) {
      this.chatStateService.markChatAsRead(this.activeChatId());
    }
  }

  /**
   * Formats timestamp for display
   */
  formatMessageTime(timestamp: string | Date | undefined): string {
    if (!timestamp) return '';
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }

  /**
   * TrackBy function for message list optimization
   */
  trackByMessageId(index: number, message: IChatMessage): string | number {
    return message.id || index;
  }

  /**
   * Manual scroll to bottom method (can be called from template if needed)
   */
  scrollToBottomManual(): void {
    this.isUserScrolling = false;
    this.shouldScrollToBottom = true;
    this.scrollToBottomSmooth();
  }

  /**
   * Remove a message from the UI
   */
  private removeMessageFromUI(messageId: number): void {
    this.messages = this.messages.filter((msg) => msg.id !== messageId.toString());
  }

  /**
   * Handle message deletion request with confirmation
   */
  onDeleteMessage(event: Event, message: IChatMessage): void {
    // Prevent event bubbling
    event.stopPropagation();

    // Only allow deleting own messages
    if (message.sender.id !== this.currentUserId()) {
      return;
    }

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.translateService.instant('chat.deleteConfirmation.message'),
      header: this.translateService.instant('chat.deleteConfirmation.header'),
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      acceptLabel: this.translateService.instant('chat.deleteConfirmation.accept'),
      rejectLabel: this.translateService.instant('chat.deleteConfirmation.reject'),
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-text p-button-sm',
      accept: () => {
        this.deleteMessage(message);
      },
    });
  }

  /**
   * Delete a message
   */
  private deleteMessage(message: IChatMessage): void {
    // Emit socket event to delete message
    this.chatService.removeMessage(Number(message.id));

    // Optimistically remove from UI
    this.removeMessageFromUI(Number(message.id));
  }
}
