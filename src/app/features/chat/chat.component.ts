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
import { ChatService } from '../../core/services/chat.service';
import { StateService } from '../../core/services/state/state.service';
import { ChatStateService } from '../../core/services/state/chat-state.service';
import { Button } from 'primeng/button';
import { IChatMessages, IChatMessage, IParticipant } from '../../core/models/chat.model';
import { ITypingIndicator, IMessageRead } from '../../core/models/notification.model';
import { ChatAvatarComponent } from '../../shared/ui/chat-avatar/chat-avatar.component';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';
import { IUser } from '../../core/models/entities/user.model';
import { TypingIndicatorComponent } from '../../shared/ui/typing-indicator/typing-indicator.component';
import { AuthTokenService } from '../../core/services/auth/auth-token.service';

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
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  private chatService = inject(ChatService);
  private route = inject(ActivatedRoute);
  private stateService = inject(StateService);
  private chatStateService = inject(ChatStateService);
  private destroy$ = new Subject<void>();
  private authTokenService = inject(AuthTokenService);
  readonly user = computed(() => this.stateService.user());

  currentUser = computed(() => this.stateService.user() || null);
  currentUserId = computed(() => this.currentUser()?.id || '');
  myProfile = computed(() => this.currentUser()?.profile || null);
  interlocutor = signal<IParticipant | null>(null);
  isOnline = computed(() => this.interlocutor()?.isOnline || false);
  interlocutorProfile = computed(() => this.interlocutor()?.profile || null);
  interlocutorName = computed(
    () => this.interlocutorProfile()?.name || this.interlocutorProfile()?.email || 'Unknown',
  );

  @Input() receiverId = '';
  @ViewChild('messagesContainer', { static: false }) messagesContainer!: ElementRef;
  @ViewChild('messageInput', { static: false }) messageInput!: ElementRef;

  messages: IChatMessage[] = [];
  newMessageContent: string = '';
  isLoading = signal(false);
  isMessageSending = signal(false);
  showScrollToBottom = signal(false);

  // New properties for enhanced features
  activeChatId = signal<string>('');
  isTyping = signal(false);
  typingUsers = signal<ITypingIndicator[]>([]);
  typingTimeout?: ReturnType<typeof setTimeout>;

  private messageSubscription!: Subscription;
  private previousMessagesSubscription!: Subscription;
  private shouldScrollToBottom = false;
  private scrollTimeout: any;
  private isUserScrolling = false;

  constructor() {
    effect(() => {
      const user = this.user();
      if (user) {
        const token = this.authTokenService.getToken();
        if (token) {
          this.chatService.connect(token);
        }
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.receiverId = params.get('receiverId') || '';
      if (this.currentUserId() && this.receiverId) {
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

      if (message.sender.id !== this.currentUserId()) {
        this.messages = [...this.messages, message];
        this.updateChatUnreadCount();
      }
      this.isMessageSending.set(false);

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
      this.isMessageSending.set(true);
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
