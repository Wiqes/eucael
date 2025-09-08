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
} from '@angular/core';
import { Subscription, Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common'; // Needed for *ngFor, *ngIf etc.
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule here
import { ChatService } from '../../core/services/chat.service';
import { StateService } from '../../core/services/state/state.service';
import { NotificationService } from '../../core/services/notification.service';
import { PresenceService } from '../../core/services/presence.service';
import { ChatStateService } from '../../core/services/state/chat-state.service';
import { Button } from 'primeng/button';
import { IChatMessages, IChatMessage, IParticipant } from '../../core/models/chat.model';
import { ITypingIndicator, IMessageRead } from '../../core/models/notification.model';
import { ChatAvatarComponent } from '../../shared/ui/chat-avatar/chat-avatar.component';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';
import { TypingIndicatorComponent } from '../../shared/components/typing-indicator/typing-indicator.component';
import { OnlineStatusComponent } from '../../shared/components/online-status/online-status.component';
import { IUser } from '../../core/models/entities/user.model';

@Component({
  selector: 'app-chat',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule, // Required for common Angular directives like *ngFor, *ngIf
    FormsModule, // Required for ngModel
    Button,
    ChatAvatarComponent,
    LoaderComponent,
    TypingIndicatorComponent,
    OnlineStatusComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  private chatService = inject(ChatService);
  private route = inject(ActivatedRoute);
  private stateService = inject(StateService);
  private notificationService = inject(NotificationService);
  private presenceService = inject(PresenceService);
  private chatStateService = inject(ChatStateService);
  private destroy$ = new Subject<void>();

  currentUser = computed(() => this.stateService.user() || null);
  currentUserId = computed(() => this.currentUser()?.id || '');
  myProfile = computed(() => this.currentUser()?.profile || null);
  interlocutor = signal<IParticipant | null>(null);
  interlocutorProfile = computed(() => this.interlocutor()?.profile || null);
  interlocutorName = computed(
    () => this.interlocutorProfile()?.name || this.interlocutorProfile()?.email || 'Unknown',
  );

  @Input() receiverId = '';
  @ViewChild('messagesContainer', { static: false }) messagesContainer!: ElementRef;
  @ViewChild('messageInput', { static: false }) messageInput!: ElementRef;

  messages: IChatMessage[] = [];
  pristineMessages: IChatMessage[] = [];
  isPristine = signal(true);
  newMessageContent: string = '';
  isLoading = signal(false);
  showScrollToBottom = signal(false);

  // New properties for enhanced features
  activeChatId = signal<string>('');
  isTyping = signal(false);
  typingUsers = signal<ITypingIndicator[]>([]);
  typingTimeout?: ReturnType<typeof setTimeout>;
  readReceipts = signal<Map<string, IMessageRead>>(new Map());

  private messageSubscription!: Subscription;
  private previousMessagesSubscription!: Subscription;
  private shouldScrollToBottom = false;
  private scrollTimeout: any;
  private isUserScrolling = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.receiverId = params.get('receiverId') || '';
      if (this.currentUserId() && this.receiverId) {
        this.isLoading.set(true);
        if (this.chatService.isConnected()) {
          this.startChatRoom();
        } else {
          this.chatService.onConnect().subscribe(() => {
            this.startChatRoom();
          });
        }
      }
      console.log('ChatComponent initialized with receiverId:', this.receiverId);
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

    // Message read receipts
    this.chatService
      .onMessageRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe((readData: IMessageRead) => {
        this.updateReadReceipts(readData);
      });

    // Chat list updates
    this.chatService
      .onUserChats()
      .pipe(takeUntil(this.destroy$))
      .subscribe((chats) => {
        this.chatStateService.updateChats(chats);
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
   * Update read receipts
   */
  private updateReadReceipts(readData: IMessageRead): void {
    const receipts = this.readReceipts();
    receipts.set(readData.messageId, readData);
    this.readReceipts.set(new Map(receipts));
  }

  /**
   * Get presence text for header
   */
  getPresenceText(): string {
    return this.presenceService.getLastSeenText(this.receiverId);
  }

  /**
   * Check if message is read
   */
  isMessageRead(messageId: string): boolean {
    return this.readReceipts().has(messageId);
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

  /**
   * Get typing username
   */
  getTypingUsername(): string | undefined {
    const typingUser = this.typingUsers().find((u) => u.userId !== this.currentUserId());
    return typingUser?.username;
  }

  /**
   * Handle typing input
   */
  onTyping(): void {
    if (this.activeChatId()) {
      // Clear existing timeout
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }

      // Send typing indicator
      if (!this.isTyping()) {
        this.isTyping.set(true);
        this.chatService.sendTypingIndicator(this.activeChatId(), true);
      }

      // Set timeout to stop typing indicator
      this.typingTimeout = setTimeout(() => {
        this.isTyping.set(false);
        this.chatService.sendTypingIndicator(this.activeChatId(), false);
      }, 1000);
    }
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
    this.messageSubscription = this.chatService.onReceiveMessage().subscribe((message: any) => {
      // Check if user was near bottom before adding message
      const wasNearBottom = this.isNearBottom();
      console.log('Received message:', message);

      this.messages = [...this.pristineMessages, message];
      this.pristineMessages = [...this.messages];
      this.isPristine.set(true);

      // Mark message as read if chat is active and visible
      if (document.visibilityState === 'visible' && this.activeChatId() === message.chatId) {
        this.markMessageAsRead(message.id);
      }

      // Update chat unread count if message is from another user
      if (message.sender.id !== this.currentUserId()) {
        this.updateChatUnreadCount();
      }

      // Only auto-scroll if user was near bottom or if it's their own message
      if (wasNearBottom || message.sender.id === this.currentUserId()) {
        this.shouldScrollToBottom = true;
      }
    });
  }

  ngOnDestroy(): void {
    // Stop typing indicator if active
    if (this.isTyping()) {
      this.chatService.sendTypingIndicator(this.activeChatId(), false);
    }

    // Clear timeouts
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
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

    this.chatService.disconnect();
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
          this.interlocutor.set(participant);
        }
        console.log('Joined chat room:', chat);
        this.messages = messages;
        this.isLoading.set(false);

        // Set active chat ID
        this.activeChatId.set(chat.id);

        // Mark existing messages as read
        messages.forEach((message) => {
          if (message.sender.id !== this.currentUserId() && !message.isRead) {
            this.markMessageAsRead(message.id);
          }
        });

        // Scroll to bottom after loading messages (use instant scroll for initial load)
        setTimeout(() => {
          this.scrollToBottom();
          // Hide the scroll to bottom button initially
          this.showScrollToBottom.set(false);
        }, 100);
      });
  }

  sendMessage(): void {
    console.log('Attempting to send message:', this.newMessageContent);
    if (this.newMessageContent.trim() && this.currentUserId() && this.receiverId) {
      const messageContent = this.newMessageContent.trim();
      console.log('Sending message:', `d${messageContent}`);

      // Stop typing indicator when sending
      if (this.isTyping()) {
        this.isTyping.set(false);
        this.chatService.sendTypingIndicator(this.activeChatId(), false);
        if (this.typingTimeout) {
          clearTimeout(this.typingTimeout);
        }
      }

      // Clear the input immediately for better UX
      this.newMessageContent = '';
      this.pristineMessages = [...this.messages];
      this.isPristine.set(false);
      this.messages.push({
        id: '',
        content: messageContent,
        timestamp: new Date(),
        sender: {
          id: this.currentUserId(),
          profile: this.myProfile()!,
        } as IUser,
        receiver: {
          id: this.receiverId,
          profile: this.interlocutorProfile(),
        } as IUser,
      });

      // Send the message
      this.chatService.sendMessage({
        content: messageContent,
        senderId: Number(this.currentUserId()),
        receiverId: Number(this.receiverId),
      });

      // Always auto-scroll for sent messages
      this.shouldScrollToBottom = true;

      // Focus back to input for continuous typing
      setTimeout(() => {
        if (this.messageInput?.nativeElement) {
          this.messageInput.nativeElement.focus();
        }
      }, 0);
    }
  }

  /**
   * Mark message as read
   */
  markMessageAsRead(messageId: string): void {
    this.chatService.markMessageAsRead(messageId);
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
   * Handles Enter key press with Shift+Enter for new lines
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Formats timestamp for display
   */
  formatMessageTime(timestamp: string | Date): string {
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
  trackByMessageId(index: number, message: IChatMessage): any {
    return message.id || index;
  }

  /**
   * Manual scroll to bottom method (can be called from template if needed)
   */
  scrollToBottomManual(): void {
    this.isUserScrolling = false;
    this.shouldScrollToBottom = true;
    this.showScrollToBottom.set(false);
    this.scrollToBottomSmooth();
  }
}
